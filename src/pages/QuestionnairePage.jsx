import { Fragment, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import FlowSteps from '../components/questionnaire/FlowSteps';
import QuestionBlock from '../components/questionnaire/QuestionBlock';
import ScoreRail from '../components/questionnaire/ScoreRail';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { getNeighbours, getQuestionnaireBySlug } from '../data/questionnaires';
import { isAnswered, scoreQuestion, scoreQuestionnaire, visibleQuestions } from '../data/scoring';
import { buildSubmission, clearDraft, submitQuestionnaire } from '../services/questionnaireService';

/**
 * Página genérica de cuestionario. El instrumento se resuelve por el slug
 * de la URL, así que sumar una escala nueva no requiere tocar este archivo.
 *
 * Las preguntas se presentan sobre una única hoja blanca separadas por
 * filetes, como un formulario clínico impreso, en lugar de una pila de
 * tarjetas independientes.
 */
export default function QuestionnairePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    answersFor,
    setAnswer,
    resetQuestionnaire,
    answersByQuestionnaire,
    progress,
    draftRestored,
    dismissDraftNotice,
    startedAt,
  } = useQuestionnaire();

  const [showMissing, setShowMissing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const questionnaire = getQuestionnaireBySlug(slug);
  const answers = answersFor(questionnaire?.id);

  const score = useMemo(
    () => (questionnaire ? scoreQuestionnaire(questionnaire, answers) : null),
    [questionnaire, answers],
  );

  const questions = useMemo(
    () => (questionnaire ? visibleQuestions(questionnaire.questions, answers) : []),
    [questionnaire, answers],
  );

  if (!questionnaire) return <Navigate to="/cuestionario" replace />;

  const { previous, next } = getNeighbours(slug);
  const justRegistered = location.state?.justRegistered;
  const isLastPage = !next;

  const scrollTo = (anchor) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ensureComplete = () => {
    if (score.isComplete) return true;
    setShowMissing(true);
    const first = score.missing[0];
    if (first) scrollTo(`pregunta-${first.id}`);
    return false;
  };

  const handleNext = () => {
    if (!ensureComplete()) return;
    setShowMissing(false);
    navigate(`/cuestionario/${next.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    navigate(`/cuestionario/${previous.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async () => {
    if (!ensureComplete()) return;

    const incomplete = progress.find((step) => !step.isComplete);
    if (incomplete) {
      setSendError(
        `Falta completar ${incomplete.code} (${incomplete.answeredCount}/${incomplete.totalQuestions}).`,
      );
      navigate(`/cuestionario/${incomplete.slug}`);
      return;
    }

    setIsSending(true);
    setSendError(null);
    try {
      const submission = buildSubmission({ user, answersByQuestionnaire, startedAt });
      const stored = await submitQuestionnaire(submission);
      clearDraft();
      navigate('/resumen', { state: { submission: stored }, replace: true });
    } catch (error) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    resetQuestionnaire(questionnaire.id);
    setShowMissing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let renderedGroup = null;

  return (
    <AppShell>
      {justRegistered && (
        <p
          role="status"
          className="mb-6 border-l-2 border-cobalt-600 bg-paper py-3 pl-4 text-[13.5px] font-semibold text-ink"
          style={{ animation: 'var(--animate-fade)' }}
        >
          Cuenta creada, {user?.firstName}. Ya iniciaste sesión: empezamos por la escala de fatiga.
        </p>
      )}

      <div className="mb-8" style={{ animation: 'var(--animate-fade)' }}>
        <FlowSteps steps={progress} currentSlug={slug} />
      </div>

      {/* ── Encabezado ───────────────────────────────────────────── */}
      <header className="mb-8" style={{ animation: 'var(--animate-enter)' }}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="label text-magenta-500">
            Página {questionnaire.page} / {questionnaire.totalPages}
          </span>
          <span className="label text-cobalt-600">{questionnaire.code}</span>
          <span className="tnum label text-silver">
            {score.totalQuestions} ítems · rango 0–{questionnaire.maxScore} · ≈
            {questionnaire.estimatedMinutes} min
          </span>
        </div>

        <h1 className="mt-4 max-w-5xl text-[clamp(1.9rem,3.2vw,3.1rem)] leading-[1.03] font-extrabold tracking-[-0.038em] text-ink text-balance">
          {questionnaire.title}
        </h1>

        <p className="mt-5 max-w-3xl border-l-2 border-cobalt-600 pl-5 text-[14.5px] leading-relaxed text-graphite">
          {questionnaire.instructions}
        </p>

        {draftRestored && (
          <button
            type="button"
            onClick={dismissDraftNotice}
            className="mt-5 text-[12.5px] font-semibold text-magenta-600 underline-offset-4 hover:underline"
          >
            Recuperamos respuestas sin enviar · ocultar
          </button>
        )}
      </header>

      {/* ── Hoja de preguntas + riel ─────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div>
          <div className="border border-rule bg-paper">
            {questions.map((question) => {
              const answer = answers[question.id];
              const answered = isAnswered(question, answer);
              const group = question.groupId ? questionnaire.groups[question.groupId] : null;
              const showGroupHeader = group && renderedGroup !== question.groupId;
              if (showGroupHeader) renderedGroup = question.groupId;

              return (
                <Fragment key={question.id}>
                  {showGroupHeader && (
                    <div className="border-b border-rule bg-cobalt-50 px-4 py-4 sm:px-7">
                      <h2 className="max-w-3xl text-[13.5px] leading-snug font-bold tracking-[-0.01em] text-cobalt-900 text-balance">
                        {group.title}
                      </h2>
                      {group.help && (
                        <p className="mt-1 text-[12.5px] text-cobalt-800/75">{group.help}</p>
                      )}
                    </div>
                  )}

                  <QuestionBlock
                    question={question}
                    answer={answer}
                    answered={answered}
                    points={scoreQuestion(question, answer)}
                    totalQuestions={score.totalQuestions}
                    invalid={showMissing && !question.optional && !answered}
                    onChange={(value) => {
                      setAnswer(questionnaire.id, question.id, value);
                      setSendError(null);
                    }}
                  />
                </Fragment>
              );
            })}

            {/* Pie de la hoja */}
            <div className="flex flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[14px] font-bold tracking-[-0.01em] text-ink">
                  {!score.isComplete
                    ? `${score.answeredCount} de ${score.totalQuestions} respondidas`
                    : isLastPage
                      ? 'Listo para enviar'
                      : `Continuá con ${next.code}`}
                </p>
                <p className="mt-0.5 max-w-md text-[12.5px] leading-relaxed text-graphite">
                  {!score.isComplete
                    ? 'Completá los ítems obligatorios de esta página para avanzar.'
                    : isLastPage
                      ? 'Vas a ver el puntaje de cada instrumento antes de guardarlo.'
                      : `${next.title} · ≈${next.estimatedMinutes} min.`}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {previous && (
                  <Button variant="outline" size="md" type="button" onClick={handleBack}>
                    Anterior
                  </Button>
                )}
                <Button variant="quiet" size="md" type="button" onClick={handleReset}>
                  Reiniciar
                </Button>
                {isLastPage ? (
                  <Button type="button" size="lg" loading={isSending} onClick={handleFinish}>
                    {isSending ? 'Enviando…' : 'Finalizar cuestionario'}
                  </Button>
                ) : (
                  <Button type="button" size="lg" onClick={handleNext}>
                    Siguiente: {next.code}
                  </Button>
                )}
              </div>
            </div>

            {sendError && (
              <p
                role="alert"
                className="border-t border-magenta-500 bg-magenta-50 px-4 py-3 text-[13px] font-semibold text-magenta-600 sm:px-7"
              >
                {sendError}
              </p>
            )}
          </div>

          {questionnaire.attribution && (
            <p className="mt-4 max-w-3xl text-[11.5px] leading-relaxed text-silver">
              {questionnaire.attribution}
            </p>
          )}
        </div>

        <ScoreRail
          score={score}
          bands={questionnaire.bands}
          code={questionnaire.code}
          breakdownLabel={questionnaire.breakdownLabel}
          onJump={(item) => scrollTo(item.anchor ?? `pregunta-${item.questionId}`)}
        />
      </div>
    </AppShell>
  );
}
