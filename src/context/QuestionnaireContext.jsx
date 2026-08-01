import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QUESTIONNAIRES } from '../data/questionnaires';
import { scoreQuestionnaire } from '../data/scoring';
import { clearDraft, loadDraft, saveDraft } from '../services/questionnaireService';
import { useAuth } from './AuthContext';

const QuestionnaireContext = createContext(null);

/**
 * Estado compartido del flujo de cuestionarios: mantiene las respuestas de
 * todas las páginas en memoria y las autoguarda como borrador, de modo que
 * navegar entre la página 1 y la 2 no pierde nada.
 */
export function QuestionnaireProvider({ children }) {
  const { user } = useAuth();
  const [answersByQuestionnaire, setAnswersByQuestionnaire] = useState({});
  const [draftRestored, setDraftRestored] = useState(false);
  const startedAt = useRef(new Date().toISOString());

  // Recupera el borrador del paciente al montar / cambiar de sesión.
  useEffect(() => {
    if (!user) {
      setAnswersByQuestionnaire({});
      setDraftRestored(false);
      return;
    }
    const draft = loadDraft(user.id);
    const restored = draft?.answersByQuestionnaire ?? {};
    const hasAnswers = Object.values(restored).some(
      (answers) => Object.keys(answers ?? {}).length > 0,
    );
    setAnswersByQuestionnaire(restored);
    setDraftRestored(hasAnswers);
  }, [user]);

  // Autoguardado.
  useEffect(() => {
    if (!user) return;
    const hasAnswers = Object.values(answersByQuestionnaire).some(
      (answers) => Object.keys(answers ?? {}).length > 0,
    );
    if (hasAnswers) saveDraft(user.id, answersByQuestionnaire);
  }, [user, answersByQuestionnaire]);

  const setAnswer = useCallback((questionnaireId, questionId, value) => {
    setAnswersByQuestionnaire((prev) => ({
      ...prev,
      [questionnaireId]: { ...(prev[questionnaireId] ?? {}), [questionId]: value },
    }));
  }, []);

  const answersFor = useCallback(
    (questionnaireId) => answersByQuestionnaire[questionnaireId] ?? {},
    [answersByQuestionnaire],
  );

  const resetQuestionnaire = useCallback((questionnaireId) => {
    setAnswersByQuestionnaire((prev) => ({ ...prev, [questionnaireId]: {} }));
    setDraftRestored(false);
  }, []);

  const resetAll = useCallback(() => {
    setAnswersByQuestionnaire({});
    setDraftRestored(false);
    clearDraft();
  }, []);

  /** Progreso global del flujo, para la barra de pasos. */
  const progress = useMemo(
    () =>
      QUESTIONNAIRES.map((questionnaire) => {
        const score = scoreQuestionnaire(
          questionnaire,
          answersByQuestionnaire[questionnaire.id] ?? {},
        );
        return {
          id: questionnaire.id,
          slug: questionnaire.slug,
          code: questionnaire.code,
          title: questionnaire.title,
          page: questionnaire.page,
          answeredCount: score.answeredCount,
          totalQuestions: score.totalQuestions,
          isComplete: score.isComplete,
        };
      }),
    [answersByQuestionnaire],
  );

  const allComplete = progress.every((item) => item.isComplete);

  const value = useMemo(
    () => ({
      answersByQuestionnaire,
      answersFor,
      setAnswer,
      resetQuestionnaire,
      resetAll,
      progress,
      allComplete,
      draftRestored,
      dismissDraftNotice: () => setDraftRestored(false),
      startedAt: startedAt.current,
    }),
    [
      answersByQuestionnaire,
      answersFor,
      setAnswer,
      resetQuestionnaire,
      resetAll,
      progress,
      allComplete,
      draftRestored,
    ],
  );

  return <QuestionnaireContext.Provider value={value}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire debe usarse dentro de un <QuestionnaireProvider>.');
  }
  return context;
}
