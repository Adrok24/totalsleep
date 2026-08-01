/**
 * Historial simulado de evaluaciones.
 *
 * En vez de escribir a mano cinco instrumentos por cada fecha, se generan
 * las respuestas a partir de un "nivel de severidad" 0..1 y se dejan pasar
 * por el mismo motor de puntaje que usa la app. Así el historial nunca
 * puede quedar desincronizado con las reglas de las escalas.
 *
 * Esto existe sólo para que el panel de administración tenga progreso real
 * que mostrar durante la fase de prototipo. Cuando exista backend, las
 * evaluaciones vendrán de la base y este archivo se borra.
 */

import { QUESTIONNAIRES } from './questionnaires';

/** Interpola entre dos valores según el nivel. */
const lerp = (from, to, level) => from + (to - from) * level;

/** "HH:MM" a partir de minutos desde medianoche (envuelve en 24 h). */
function toTime(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Opción cuyo puntaje es el más cercano al nivel pedido. */
function optionForLevel(question, level) {
  const max = Math.max(...question.options.map((option) => option.points));
  const target = level * max;
  return question.options.reduce((best, option) =>
    Math.abs(option.points - target) < Math.abs(best.points - target) ? option : best,
  ).id;
}

/** Datos duros del PSQI, coherentes entre sí para el nivel dado. */
const METRIC_VALUES = {
  psqi_1: (level) => toTime(lerp(23 * 60, 25 * 60, level)), // se acuesta más tarde
  psqi_3: (level) => toTime(lerp(7 * 60, 6 * 60, level)), // se levanta más temprano
  psqi_2: (level) => String(Math.round(lerp(10, 75, level))), // tarda más en dormirse
  psqi_4: (level) => String(Number(lerp(7.5, 4, level).toFixed(1))), // duerme menos
};

/** Respuestas completas de un instrumento para un nivel de severidad. */
export function answersForLevel(questionnaire, level) {
  const answers = {};

  for (const question of questionnaire.questions) {
    if (question.optional) continue; // los opcionales quedan sin responder

    if (question.type === 'multiple') {
      const count = Math.round(level * question.options.length);
      answers[question.id] = question.options.slice(0, count).map((option) => option.id);
      continue;
    }

    if (question.type === 'single') {
      answers[question.id] = optionForLevel(question, level);
      continue;
    }

    const metric = METRIC_VALUES[question.id];
    if (metric) answers[question.id] = metric(level);
  }

  return answers;
}

/** Todas las respuestas de una sesión, con un nivel por instrumento. */
function sessionAnswers(level) {
  return Object.fromEntries(
    QUESTIONNAIRES.map((questionnaire) => [
      questionnaire.id,
      // Pequeño desfasaje por instrumento para que no queden todos iguales.
      answersForLevel(questionnaire, Math.min(1, Math.max(0, level + questionnaire.page * 0.02))),
    ]),
  );
}

/**
 * Historial por nombre de usuario: fecha de la toma y nivel de severidad.
 * Lucía mejora entre tomas; Martín empeora.
 */
const TIMELINE = {
  lucia: [
    { completedAt: '2026-01-19T10:15:00.000Z', level: 0.82 },
    { completedAt: '2026-04-06T09:40:00.000Z', level: 0.6 },
    { completedAt: '2026-06-22T11:05:00.000Z', level: 0.34 },
  ],
  martin: [
    { completedAt: '2026-02-10T16:20:00.000Z', level: 0.28 },
    { completedAt: '2026-05-18T15:50:00.000Z', level: 0.55 },
  ],
};

/**
 * Devuelve las tomas históricas de un usuario, de la más reciente a la más
 * antigua, con las respuestas listas para pasar por `buildSubmission`.
 */
export function historyFor(username) {
  const entries = TIMELINE[username?.toLowerCase()] ?? [];
  return entries
    .map(({ completedAt, level }, index) => ({
      id: `seed-${username}-${index + 1}`,
      completedAt,
      startedAt: completedAt,
      answersByQuestionnaire: sessionAnswers(level),
    }))
    .reverse();
}
