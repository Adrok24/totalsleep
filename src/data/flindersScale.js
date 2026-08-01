/**
 * ESCALA DE FATIGA DE FLINDERS (Flinders Fatigue Scale — FFS)
 * ---------------------------------------------------------------------------
 * Instrumento de 7 ítems que evalúa la fatiga diurna durante las últimas dos
 * semanas. Estructura de puntaje:
 *
 *   · Ítems 1, 2, 3, 4, 6 y 7 → selección única, 0 a 4 puntos ...... máx. 24
 *   · Ítem 5 ("momentos del día") → selección múltiple, 1 pto c/u .. máx.  7
 *   ------------------------------------------------------------------------
 *   TOTAL ......................................................... 0 a 31
 *
 * Cada opción declara explícitamente su `points` para que el cálculo del
 * puntaje viva en los datos y no en la UI. El motor de cálculo compartido
 * está en `scoring.js`.
 */

import { calculateScore, getBand, maxScoreOf } from './scoring';

export const FLINDERS_META = {
  id: 'flinders-fatigue-scale',
  version: '1.0.0',
  code: 'FFS',
  slug: 'flinders',
  title: 'Escala de Fatiga de Flinders',
  subtitle: 'Evaluación de fatiga diurna · últimas dos semanas',
  instructions:
    'Nos interesa saber en qué medida se ha sentido fatigado (cansado, agotado, exhausto) durante las últimas dos semanas. No nos referimos a la somnolencia (la probabilidad de quedarse dormido). Por favor, marque la respuesta que mejor describa su estado de ánimo promedio durante este período de dos semanas.',
  estimatedMinutes: 3,
};

/** Escalas de respuesta reutilizables (0 → 4 puntos). */
const SCALE_INTENSITY = [
  { id: 'a0', label: 'No', points: 0 },
  { id: 'a1', label: 'Un poco', points: 1 },
  { id: 'a2', label: 'Moderadamente', points: 2 },
  { id: 'a3', label: 'Mucho', points: 3 },
  { id: 'a4', label: 'Extremadamente', points: 4 },
];

const SCALE_FREQUENCY = [
  { id: 'b0', label: 'Nunca', points: 0 },
  { id: 'b1', label: 'Rara vez', points: 1 },
  { id: 'b2', label: 'A veces', points: 2 },
  { id: 'b3', label: 'A menudo', points: 3 },
  { id: 'b4', label: 'Siempre', points: 4 },
];

const SCALE_DURATION = [
  { id: 'c0', label: 'En ningún momento', points: 0 },
  { id: 'c1', label: 'Una pequeña parte del día', points: 1 },
  { id: 'c2', label: 'La mitad del día', points: 2 },
  { id: 'c3', label: 'La mayor parte del día', points: 3 },
  { id: 'c4', label: 'Todo el día', points: 4 },
];

export const FLINDERS_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    type: 'single',
    text: '¿Ha experimentado fatiga durante las últimas dos semanas?',
    help: 'Considere el promedio del período completo, no un día puntual.',
    maxPoints: 4,
    options: SCALE_INTENSITY,
  },
  {
    id: 'q2',
    number: 2,
    type: 'single',
    text: '¿Con qué frecuencia experimentó fatiga?',
    help: 'Frecuencia con la que apareció la sensación de cansancio o agotamiento.',
    maxPoints: 4,
    options: SCALE_FREQUENCY,
  },
  {
    id: 'q3',
    number: 3,
    type: 'single',
    text: '¿Durante qué parte del día se sintió fatigado?',
    help: 'Cuánto tiempo de su jornada estuvo presente la fatiga.',
    maxPoints: 4,
    options: SCALE_DURATION,
  },
  {
    id: 'q4',
    number: 4,
    type: 'single',
    text: '¿En qué medida la fatiga le causó malestar o angustia?',
    help: 'Impacto emocional de la fatiga sobre su bienestar.',
    maxPoints: 4,
    options: SCALE_INTENSITY,
  },
  {
    id: 'q5',
    number: 5,
    type: 'multiple',
    text: '¿En qué momento(s) del día solía experimentar fatiga?',
    help: 'Puede marcar más de una opción. Cada casillero marcado suma 1 punto.',
    noneLabel: 'No sentí fatiga en ningún momento',
    maxPoints: 7,
    options: [
      { id: 'm1', label: 'Temprano en la mañana', points: 1 },
      { id: 'm2', label: 'Media mañana', points: 1 },
      { id: 'm3', label: 'Mediodía', points: 1 },
      { id: 'm4', label: 'Media tarde', points: 1 },
      { id: 'm5', label: 'Última hora de la tarde', points: 1 },
      { id: 'm6', label: 'Primera hora de la noche', points: 1 },
      { id: 'm7', label: 'Última hora de la noche', points: 1 },
    ],
  },
  {
    id: 'q6',
    number: 6,
    type: 'single',
    text: '¿En qué medida la fatiga afectó sus actividades diarias?',
    help: 'Trabajo, estudio, tareas del hogar, vida social o actividad física.',
    maxPoints: 4,
    options: SCALE_INTENSITY,
  },
  {
    id: 'q7',
    number: 7,
    type: 'single',
    text: '¿En qué medida la fatiga afectó su calidad de vida en general?',
    help: 'Valoración global del período de dos semanas.',
    maxPoints: 4,
    options: SCALE_INTENSITY,
  },
];

/** Puntaje máximo teórico de la escala (24 + 7 = 31). */
export const FLINDERS_MAX_SCORE = maxScoreOf(FLINDERS_QUESTIONS);

/**
 * Bandas orientativas de interpretación. No constituyen un diagnóstico:
 * la lectura clínica siempre queda a cargo del profesional tratante.
 */
export const FLINDERS_BANDS = [
  {
    id: 'low',
    label: 'Fatiga baja',
    min: 0,
    max: 7,
    tone: 'low',
    summary: 'Nivel de fatiga dentro del rango habitual de personas con buen descanso.',
  },
  {
    id: 'mild',
    label: 'Fatiga leve',
    min: 8,
    max: 13,
    tone: 'guarded',
    summary: 'Presencia de fatiga ocasional que conviene monitorear en el tiempo.',
  },
  {
    id: 'moderate',
    label: 'Fatiga moderada',
    min: 14,
    max: 21,
    tone: 'elevated',
    summary:
      'Puntaje compatible con fatiga clínicamente significativa. Se sugiere revisión profesional.',
  },
  {
    id: 'high',
    label: 'Fatiga severa',
    min: 22,
    max: 31,
    tone: 'high',
    summary:
      'Fatiga marcada con impacto probable en el funcionamiento diario. Se recomienda consulta prioritaria.',
  },
];

/* Atajos específicos de esta escala (envuelven el motor genérico). */
export const calculateFlindersScore = (answers) => calculateScore(FLINDERS_QUESTIONS, answers);
export const getScoreBand = (score) => getBand(FLINDERS_BANDS, score);
