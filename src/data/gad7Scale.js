/**
 * ESCALA DEL TRASTORNO DE ANSIEDAD GENERALIZADA (GAD-7)
 * ---------------------------------------------------------------------------
 * Instrumento autoadministrado de 7 ítems, todos de selección única con
 * puntaje 0 a 3. Suma directa:
 *
 *   P1 + P2 + P3 + P4 + P5 + P6 + P7 = TOTAL ................... 0 a 21
 *
 * ⚠️ La fuente lista la banda severa como "15-20", pero declara el máximo
 * en 21: quien responda "Casi todos los días" en los 7 ítems quedaría sin
 * categoría. Se extiende a 15–21, que además es el corte estándar del
 * instrumento (Spitzer et al., 2006).
 *
 * Los autores recomiendan derivar a consulta profesional a partir de 10.
 */

import { maxScoreOf } from './scoring';

export const GAD7_META = {
  id: 'generalized-anxiety-disorder-7',
  version: '1.0.0',
  code: 'GAD-7',
  slug: 'gad7',
  title: 'Escala de Ansiedad Generalizada',
  subtitle: 'Síntomas de ansiedad · últimas dos semanas',
  instructions:
    'Durante las últimas 2 semanas, ¿qué tan seguido ha tenido molestias debido a los siguientes problemas? Marque la opción que mejor describa su situación.',
  attribution:
    'Elaborado por los doctores Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke y colegas, mediante una subvención educativa otorgada por Pfizer Inc. No se requiere permiso para reproducir, traducir, presentar o distribuir.',
  estimatedMinutes: 2,
};

/** Escala de frecuencia del GAD-7 (0 a 3). */
const SCALE_FREQUENCY = [
  { id: 'g0', label: 'Ningún día', points: 0 },
  { id: 'g1', label: 'Varios días', points: 1 },
  { id: 'g2', label: 'Más de la mitad de los días', points: 2 },
  { id: 'g3', label: 'Casi todos los días', points: 3 },
];

const item = (number, text) => ({
  id: `gad7_${number}`,
  number,
  type: 'single',
  text,
  maxPoints: 3,
  options: SCALE_FREQUENCY,
});

export const GAD7_QUESTIONS = [
  item(1, 'Se ha sentido nervioso/a, ansioso/a o con los nervios de punta'),
  item(2, 'No ha sido capaz de parar o controlar su preocupación'),
  item(3, 'Se ha preocupado demasiado por motivos diferentes'),
  item(4, 'Ha tenido dificultad para relajarse'),
  item(5, 'Se ha sentido tan inquieto/a que no ha podido quedarse quieto/a'),
  item(6, 'Se ha molestado o irritado fácilmente'),
  item(7, 'Ha tenido miedo de que algo terrible fuera a pasar'),
];

/** Puntaje máximo teórico: 7 ítems × 3 = 21. */
export const GAD7_MAX_SCORE = maxScoreOf(GAD7_QUESTIONS);

export const GAD7_BANDS = [
  {
    id: 'none',
    label: 'No se aprecia ansiedad',
    min: 0,
    max: 4,
    tone: 'low',
    summary: 'No se detectan síntomas de ansiedad clínicamente relevantes.',
  },
  {
    id: 'mild',
    label: 'Ansiedad leve',
    min: 5,
    max: 9,
    tone: 'guarded',
    summary: 'Se aprecian síntomas de ansiedad leves. Conviene monitorear su evolución.',
  },
  {
    id: 'moderate',
    label: 'Ansiedad moderada',
    min: 10,
    max: 14,
    tone: 'elevated',
    summary:
      'Se aprecian síntomas de ansiedad moderados. Los autores recomiendan consultar con un profesional de la salud a partir de 10 puntos.',
  },
  {
    id: 'severe',
    label: 'Ansiedad grave',
    min: 15,
    max: 21,
    tone: 'high',
    summary:
      'Se aprecian síntomas de ansiedad graves. Se recomienda consulta profesional prioritaria.',
  },
];
