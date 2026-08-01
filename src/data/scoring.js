/**
 * Motor de puntaje genérico, compartido por todos los instrumentos.
 *
 * Cada escala aporta sus datos (preguntas, opciones con puntos y bandas
 * interpretativas); acá vive el cálculo, una sola vez.
 *
 * Un instrumento puede además declarar un `scorer` propio cuando su
 * puntuación no es una suma directa de opciones (ver PSQI).
 */

/** Tipos de pregunta que se responden con opciones. */
const CHOICE_TYPES = new Set(['single', 'multiple']);

/** Puntaje de una pregunta individual. */
export function scoreQuestion(question, answer) {
  if (!CHOICE_TYPES.has(question.type) || !answer) return 0;

  if (question.type === 'multiple') {
    const selected = Array.isArray(answer) ? answer : [answer];
    return question.options
      .filter((option) => selected.includes(option.id))
      .reduce((sum, option) => sum + option.points, 0);
  }

  const option = question.options.find((item) => item.id === answer);
  return option ? option.points : 0;
}

/** Etiquetas legibles de la respuesta elegida (para el resumen). */
export function labelsForAnswer(question, answer) {
  if (answer === undefined || answer === null || answer === '') return [];

  if (!CHOICE_TYPES.has(question.type)) {
    return [`${answer}${question.unit ? ` ${question.unit}` : ''}`];
  }

  const selected = Array.isArray(answer) ? answer : [answer];
  return question.options
    .filter((option) => selected.includes(option.id))
    .map((option) => option.label);
}

/**
 * ¿La pregunta fue respondida?
 * En las de selección múltiple un array vacío es una respuesta válida
 * (p. ej. "no sentí fatiga en ningún momento") y vale 0 puntos.
 */
export function isAnswered(question, answer) {
  switch (question.type) {
    case 'multiple':
      return Array.isArray(answer);
    case 'number':
      return answer !== '' && answer !== null && answer !== undefined && !Number.isNaN(Number(answer));
    case 'time':
    case 'text':
      return typeof answer === 'string' && answer.trim() !== '';
    default:
      return Boolean(answer);
  }
}

/** Preguntas visibles según las respuestas actuales (soporta condicionales). */
export function visibleQuestions(questions, answers = {}) {
  return questions.filter((question) => !question.visibleIf || question.visibleIf(answers));
}

/** Estado de completitud considerando preguntas opcionales y condicionales. */
export function completionOf(questions, answers = {}) {
  const required = visibleQuestions(questions, answers).filter((question) => !question.optional);
  const missing = required.filter((question) => !isAnswered(question, answers[question.id]));

  return {
    answeredCount: required.length - missing.length,
    totalQuestions: required.length,
    missing,
    isComplete: missing.length === 0,
  };
}

/** Puntaje máximo teórico de un conjunto de preguntas. */
export function maxScoreOf(questions) {
  return questions.reduce((total, question) => total + (question.maxPoints ?? 0), 0);
}

/**
 * Puntaje total + detalle por pregunta (suma directa de opciones).
 * @returns {{ total, max, breakdown, answeredCount, totalQuestions, isComplete }}
 */
export function calculateScore(questions, answers = {}) {
  const breakdown = questions.map((question) => ({
    questionId: question.id,
    number: question.number,
    text: question.text,
    type: question.type,
    answered: isAnswered(question, answers[question.id]),
    points: scoreQuestion(question, answers[question.id]),
    maxPoints: question.maxPoints ?? 0,
    labels: labelsForAnswer(question, answers[question.id]),
  }));

  const completion = completionOf(questions, answers);

  return {
    total: breakdown.reduce((sum, item) => sum + item.points, 0),
    max: maxScoreOf(questions),
    breakdown,
    ...completion,
  };
}

/** Banda interpretativa correspondiente a un puntaje. */
export function getBand(bands, score) {
  return bands.find((band) => score >= band.min && score <= band.max) ?? bands[bands.length - 1];
}

/**
 * Ejecuta el scorer propio del instrumento si lo declara; si no, la suma
 * directa. Punto único de entrada para toda la UI.
 */
export function scoreQuestionnaire(questionnaire, answers = {}) {
  return questionnaire.scorer
    ? questionnaire.scorer(questionnaire.questions, answers)
    : calculateScore(questionnaire.questions, answers);
}
