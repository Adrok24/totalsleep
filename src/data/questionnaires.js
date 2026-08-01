/**
 * Registro ordenado de los cuestionarios que componen la evaluación.
 * El orden de este array define las páginas del flujo: agregar un
 * instrumento nuevo es agregar una entrada acá.
 */

import {
  FLINDERS_BANDS,
  FLINDERS_MAX_SCORE,
  FLINDERS_META,
  FLINDERS_QUESTIONS,
} from './flindersScale';
import { GAD7_BANDS, GAD7_MAX_SCORE, GAD7_META, GAD7_QUESTIONS } from './gad7Scale';
import { ISI_BANDS, ISI_GROUPS, ISI_MAX_SCORE, ISI_META, ISI_QUESTIONS } from './isiScale';
import { PHQ9_BANDS, PHQ9_MAX_SCORE, PHQ9_META, PHQ9_QUESTIONS } from './phq9Scale';
import {
  PSQI_BANDS,
  PSQI_GROUPS,
  PSQI_MAX_SCORE,
  PSQI_META,
  PSQI_QUESTIONS,
  calculatePsqiScore,
} from './psqiScale';

export const QUESTIONNAIRES = [
  {
    ...FLINDERS_META,
    questions: FLINDERS_QUESTIONS,
    groups: {},
    bands: FLINDERS_BANDS,
    maxScore: FLINDERS_MAX_SCORE,
  },
  {
    ...ISI_META,
    questions: ISI_QUESTIONS,
    groups: ISI_GROUPS,
    bands: ISI_BANDS,
    maxScore: ISI_MAX_SCORE,
  },
  {
    ...PSQI_META,
    questions: PSQI_QUESTIONS,
    groups: PSQI_GROUPS,
    bands: PSQI_BANDS,
    maxScore: PSQI_MAX_SCORE,
    // El PSQI no es una suma directa: aporta su propio motor de componentes.
    scorer: calculatePsqiScore,
    breakdownLabel: 'componentes',
  },
  {
    ...GAD7_META,
    questions: GAD7_QUESTIONS,
    groups: {},
    bands: GAD7_BANDS,
    maxScore: GAD7_MAX_SCORE,
  },
  {
    ...PHQ9_META,
    questions: PHQ9_QUESTIONS,
    groups: {},
    bands: PHQ9_BANDS,
    maxScore: PHQ9_MAX_SCORE,
  },
].map((questionnaire, index, all) => ({
  ...questionnaire,
  page: index + 1,
  totalPages: all.length,
}));

export const TOTAL_PAGES = QUESTIONNAIRES.length;

export const FIRST_QUESTIONNAIRE = QUESTIONNAIRES[0];

export function getQuestionnaireBySlug(slug) {
  return QUESTIONNAIRES.find((questionnaire) => questionnaire.slug === slug) ?? null;
}

export function getQuestionnaireById(id) {
  return QUESTIONNAIRES.find((questionnaire) => questionnaire.id === id) ?? null;
}

/** Cuestionario siguiente / anterior dentro del flujo. */
export function getNeighbours(slug) {
  const index = QUESTIONNAIRES.findIndex((questionnaire) => questionnaire.slug === slug);
  return {
    previous: index > 0 ? QUESTIONNAIRES[index - 1] : null,
    next: index >= 0 && index < QUESTIONNAIRES.length - 1 ? QUESTIONNAIRES[index + 1] : null,
  };
}
