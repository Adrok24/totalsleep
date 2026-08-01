/**
 * CUESTIONARIO DE SALUD DEL PACIENTE-9 (PHQ-9)
 * ---------------------------------------------------------------------------
 * Instrumento de cribado de depresión basado en los criterios del DSM.
 * 9 ítems de selección única, todos 0 a 3. Suma directa:
 *
 *   P1 + … + P9 = TOTAL ........................................ 0 a 27
 *
 * La pregunta 10 (dificultad funcional) NO se suma al total: sirve para
 * valorar el impacto en la vida diaria. Sólo se muestra si el paciente marcó
 * al menos un problema, tal como indica el enunciado del propio formulario.
 *
 * El PHQ-9 es una herramienta de cribado, no un diagnóstico.
 */

import { maxScoreOf, scoreQuestion } from './scoring';

export const PHQ9_META = {
  id: 'patient-health-questionnaire-9',
  version: '1.0.0',
  code: 'PHQ-9',
  slug: 'phq9',
  title: 'Cuestionario de Salud del Paciente',
  subtitle: 'Cribado de depresión · últimas dos semanas',
  instructions:
    'Durante las últimas 2 semanas, ¿con qué frecuencia le ha molestado alguno de los siguientes problemas? Marque la opción que mejor describa su situación.',
  attribution:
    'Desarrollado por los doctores Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke y colaboradores, con una beca otorgada por Pfizer Inc. No se necesita autorización para su reproducción, traducción, muestra o distribución.',
  estimatedMinutes: 3,
};

/** Escala de frecuencia del PHQ-9 (0 a 3). */
const SCALE_FREQUENCY = [
  { id: 'p0', label: 'Nunca', points: 0 },
  { id: 'p1', label: 'Varios días', points: 1 },
  { id: 'p2', label: 'Más de la mitad de los días', points: 2 },
  { id: 'p3', label: 'Casi cada día', points: 3 },
];

const item = (number, text, extra = {}) => ({
  id: `phq9_${number}`,
  number,
  type: 'single',
  text,
  maxPoints: 3,
  options: SCALE_FREQUENCY,
  ...extra,
});

/** Ids de los 9 ítems puntuables. */
export const PHQ9_SCORED_IDS = Array.from({ length: 9 }, (_, index) => `phq9_${index + 1}`);

/**
 * ¿Marcó al menos un problema? Condiciona la pregunta 10.
 * Declarada con `function` para poder usar `itemById`, definido más abajo:
 * sólo se invoca en runtime, cuando el módulo ya terminó de evaluarse.
 */
function markedAnyProblem(answers = {}) {
  return PHQ9_SCORED_IDS.some((id) => scoreQuestion(itemById[id], answers[id]) > 0);
}

export const PHQ9_QUESTIONS = [
  item(1, 'Poco interés o alegría por hacer cosas'),
  item(2, 'Sensación de estar decaído/a, deprimido/a o desesperanzado/a'),
  item(3, 'Problemas para quedarse dormido/a, para seguir durmiendo o dormir demasiado'),
  item(4, 'Sensación de cansancio o de tener poca energía'),
  item(5, 'Poco apetito o comer demasiado'),
  item(
    6,
    'Sentirse mal consigo mismo/a; sentir que es un/a fracasado/a o que ha decepcionado a su familia o a sí mismo/a',
  ),
  item(7, 'Problemas para concentrarse en algo, como leer el periódico o ver la televisión'),
  item(
    8,
    'Moverse o hablar tan despacio que los demás pueden haberlo notado. O lo contrario: estar tan inquieto/a o agitado/a que se ha estado moviendo de un lado a otro más de lo habitual',
  ),
  item(9, 'Pensamientos de que estaría mejor muerto/a o de querer hacerse daño de algún modo'),
  {
    id: 'phq9_10',
    number: 10,
    type: 'single',
    optional: true,
    unscored: true,
    maxPoints: 0,
    visibleIf: markedAnyProblem,
    text: 'Estos problemas, ¿hasta qué punto le han creado dificultades para hacer su trabajo, ocuparse de la casa o relacionarse con los demás?',
    help: 'No suma al puntaje total, pero ayuda a valorar el impacto en la vida diaria.',
    options: [
      { id: 'd0', label: 'Ninguna dificultad', points: 0 },
      { id: 'd1', label: 'Algunas dificultades', points: 0 },
      { id: 'd2', label: 'Muchas dificultades', points: 0 },
      { id: 'd3', label: 'Muchísimas dificultades', points: 0 },
    ],
  },
];

/** Puntaje máximo teórico: 9 ítems × 3 = 27. */
export const PHQ9_MAX_SCORE = maxScoreOf(PHQ9_QUESTIONS);

export const PHQ9_BANDS = [
  {
    id: 'minimal',
    label: 'Mínima o sin depresión',
    min: 0,
    max: 4,
    tone: 'low',
    summary: 'No se detectan síntomas depresivos clínicamente relevantes.',
  },
  {
    id: 'mild',
    label: 'Depresión leve',
    min: 5,
    max: 9,
    tone: 'guarded',
    summary: 'Síntomas depresivos leves. Conviene monitorear su evolución.',
  },
  {
    id: 'moderate',
    label: 'Depresión moderada',
    min: 10,
    max: 14,
    tone: 'elevated',
    summary:
      'Síntomas depresivos moderados. Un puntaje de 10 o más suele indicar la necesidad de una evaluación profesional.',
  },
  {
    id: 'moderately-severe',
    label: 'Depresión moderadamente grave',
    min: 15,
    max: 19,
    tone: 'high',
    summary: 'Síntomas depresivos moderadamente graves. Se recomienda evaluación profesional.',
  },
  {
    id: 'severe',
    label: 'Depresión grave',
    min: 20,
    max: 27,
    tone: 'severe',
    summary: 'Síntomas depresivos graves. Se recomienda consulta profesional prioritaria.',
  },
];

const itemById = Object.fromEntries(PHQ9_QUESTIONS.map((question) => [question.id, question]));
