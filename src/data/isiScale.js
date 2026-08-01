/**
 * ÍNDICE DE SEVERIDAD DEL INSOMNIO (Insomnia Severity Index — ISI)
 * ---------------------------------------------------------------------------
 * Instrumento autoadministrado de 7 ítems, todos de selección única con
 * puntaje 0 a 4:
 *
 *   1a + 1b + 1c + 2 + 3 + 4 + 5 = TOTAL ....................... 0 a 28
 *
 * Los tres primeros ítems comparten el enunciado del grupo 1 ("gravedad
 * del problema de sueño") y por eso se agrupan visualmente, pero puntúan
 * de forma independiente.
 */

import { maxScoreOf } from './scoring';

export const ISI_META = {
  id: 'insomnia-severity-index',
  version: '1.0.0',
  code: 'ISI',
  slug: 'isi',
  title: 'Índice de Severidad del Insomnio',
  subtitle: 'Evaluación de severidad del insomnio · autoadministrada',
  instructions: 'Para cada pregunta, marque la opción que mejor describa su situación actual.',
  estimatedMinutes: 2,
};

/** Grupos de preguntas con enunciado compartido. */
export const ISI_GROUPS = {
  g1: {
    id: 'g1',
    title: 'Indica la gravedad de tu actual problema(s) de sueño',
    help: 'Puntuá cada una de las tres dificultades por separado.',
  },
};

const SCALE_SEVERITY = [
  { id: 's0', label: 'Nada', points: 0 },
  { id: 's1', label: 'Leve', points: 1 },
  { id: 's2', label: 'Moderado', points: 2 },
  { id: 's3', label: 'Severo', points: 3 },
  { id: 's4', label: 'Muy severo', points: 4 },
];

const SCALE_SATISFACTION = [
  { id: 'f0', label: 'Muy satisfecho', points: 0 },
  { id: 'f1', label: 'Satisfecho', points: 1 },
  { id: 'f2', label: 'Moderadamente satisfecho', points: 2 },
  { id: 'f3', label: 'Insatisfecho', points: 3 },
  { id: 'f4', label: 'Muy insatisfecho', points: 4 },
];

const SCALE_DEGREE = [
  { id: 'd0', label: 'Nada', points: 0 },
  { id: 'd1', label: 'Un poco', points: 1 },
  { id: 'd2', label: 'Algo', points: 2 },
  { id: 'd3', label: 'Mucho', points: 3 },
  { id: 'd4', label: 'Muchísimo', points: 4 },
];

export const ISI_QUESTIONS = [
  {
    id: 'isi_1a',
    number: '1a',
    groupId: 'g1',
    type: 'single',
    text: 'Dificultad para quedarse dormido/a',
    maxPoints: 4,
    options: SCALE_SEVERITY,
  },
  {
    id: 'isi_1b',
    number: '1b',
    groupId: 'g1',
    type: 'single',
    text: 'Dificultad para permanecer dormido/a',
    maxPoints: 4,
    options: SCALE_SEVERITY,
  },
  {
    id: 'isi_1c',
    number: '1c',
    groupId: 'g1',
    type: 'single',
    text: 'Despertarse muy temprano',
    maxPoints: 4,
    options: SCALE_SEVERITY,
  },
  {
    id: 'isi_2',
    number: '2',
    type: 'single',
    text: '¿Cómo estás de satisfecho/a en la actualidad con tu sueño?',
    maxPoints: 4,
    options: SCALE_SATISFACTION,
  },
  {
    id: 'isi_3',
    number: '3',
    type: 'single',
    text: '¿En qué medida consideras que tu problema de sueño interfiere con tu funcionamiento diario?',
    help: 'Por ejemplo: fatiga durante el día, capacidad para las tareas cotidianas o el trabajo, concentración, memoria, estado de ánimo.',
    maxPoints: 4,
    options: SCALE_DEGREE,
  },
  {
    id: 'isi_4',
    number: '4',
    type: 'single',
    text: '¿En qué medida crees que los demás se dan cuenta de tu problema de sueño por lo que afecta a tu calidad de vida?',
    maxPoints: 4,
    options: SCALE_DEGREE,
  },
  {
    id: 'isi_5',
    number: '5',
    type: 'single',
    text: '¿Cómo estás de preocupado/a por tu actual problema de sueño?',
    maxPoints: 4,
    options: SCALE_DEGREE,
  },
];

/** Puntaje máximo teórico: 7 ítems × 4 = 28. */
export const ISI_MAX_SCORE = maxScoreOf(ISI_QUESTIONS);

/** Interpretación oficial del instrumento. */
export const ISI_BANDS = [
  {
    id: 'none',
    label: 'Ausencia de insomnio clínico',
    min: 0,
    max: 7,
    tone: 'low',
    summary: 'No se detectan indicadores de insomnio clínicamente significativo.',
  },
  {
    id: 'subclinical',
    label: 'Insomnio subclínico',
    min: 8,
    max: 14,
    tone: 'guarded',
    summary: 'Dificultades de sueño presentes pero por debajo del umbral clínico. Conviene monitorear.',
  },
  {
    id: 'moderate',
    label: 'Insomnio clínico (moderado)',
    min: 15,
    max: 21,
    tone: 'elevated',
    summary: 'Insomnio clínico de intensidad moderada. Se sugiere evaluación profesional.',
  },
  {
    id: 'severe',
    label: 'Insomnio clínico (grave)',
    min: 22,
    max: 28,
    tone: 'high',
    summary: 'Insomnio clínico grave con impacto probable en el funcionamiento diario. Se recomienda consulta prioritaria.',
  },
];
