/**
 * questionnaireService — servicio FICTICIO de cuestionarios.
 *
 * Reproduce el contrato que esperamos del backend real. Cuando la API
 * exista, basta con reemplazar el cuerpo de `submitQuestionnaire` por el
 * fetch comentado más abajo: el payload ya tiene la forma definitiva.
 */

import { QUESTIONNAIRES } from '../data/questionnaires';
import { getBand, scoreQuestionnaire } from '../data/scoring';
import { STORAGE_KEYS, createId, delay, readStorage, removeStorage, writeStorage } from './storage';

/** Endpoint previsto para la futura integración. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.totalsleep.local/v1';

/**
 * Resultado de un instrumento dentro de una sesión de evaluación.
 * Los puntajes NO se suman entre instrumentos: cada escala tiene su propio
 * rango e interpretación y se reporta por separado.
 */
export function buildSection(questionnaire, answers = {}) {
  const score = scoreQuestionnaire(questionnaire, answers);
  const band = getBand(questionnaire.bands, score.total);

  return {
    questionnaireId: questionnaire.id,
    questionnaireVersion: questionnaire.version,
    questionnaireTitle: questionnaire.title,
    code: questionnaire.code,
    slug: questionnaire.slug,
    answers,
    totalScore: score.total,
    maxScore: score.max,
    bandId: band.id,
    bandLabel: band.label,
    // En el PSQI el desglose son los 7 componentes; en la FFS/ISI, las preguntas.
    breakdownKind: questionnaire.breakdownLabel ?? 'preguntas',
    breakdown: score.breakdown,
    // Métricas derivadas (eficiencia, horas en cama…) cuando el instrumento las produce.
    ...(score.metrics ? { metrics: score.metrics } : {}),
  };
}

/**
 * Construye el payload de la sesión completa que se enviará al backend.
 * @param {{ user: object, answersByQuestionnaire: Record<string, object>, startedAt?: string }} params
 */
export function buildSubmission({
  user,
  answersByQuestionnaire = {},
  startedAt,
  // `id` y `completedAt` sólo se pasan al reconstruir tomas históricas.
  id,
  completedAt,
}) {
  return {
    id: id ?? createId('res'),
    patientId: user?.id ?? null,
    patientName: user ? `${user.firstName} ${user.lastName}` : null,
    startedAt: startedAt ?? null,
    completedAt: completedAt ?? new Date().toISOString(),
    sections: QUESTIONNAIRES.map((questionnaire) =>
      buildSection(questionnaire, answersByQuestionnaire[questionnaire.id] ?? {}),
    ),
  };
}

/**
 * POST /questionnaires/submissions
 *
 * Implementación real esperada:
 *
 *   const response = await fetch(`${API_BASE_URL}/questionnaires/submissions`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 *     body: JSON.stringify(submission),
 *   });
 *   if (!response.ok) throw new Error('No pudimos guardar tus respuestas.');
 *   return response.json();
 */
export async function submitQuestionnaire(submission) {
  await delay(900);

  // Simulamos un fallo de red esporádico para ejercitar el manejo de errores.
  if (submission?.__forceError) {
    throw new Error('El servidor no respondió. Intentá nuevamente.');
  }

  console.info(`[questionnaireService] POST ${API_BASE_URL}/questionnaires/submissions`, submission);

  return { ...submission, status: 'stored', serverReceivedAt: new Date().toISOString() };
}

/** GET /questionnaires — metadatos + preguntas (hoy vienen del bundle). */
export async function fetchQuestionnaires() {
  await delay(200);
  return QUESTIONNAIRES;
}

/* -------------------------------------------------------------------------- */
/* Borrador local (autosave de todo el flujo)                                  */
/* -------------------------------------------------------------------------- */

export function saveDraft(userId, answersByQuestionnaire) {
  if (!userId) return;
  writeStorage(STORAGE_KEYS.draft, {
    userId,
    answersByQuestionnaire,
    updatedAt: new Date().toISOString(),
  });
}

export function loadDraft(userId) {
  const draft = readStorage(STORAGE_KEYS.draft, null);
  if (!draft || draft.userId !== userId) return null;
  return draft;
}

export function clearDraft() {
  removeStorage(STORAGE_KEYS.draft);
}
