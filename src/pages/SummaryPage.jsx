import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ScoreMeter from '../components/questionnaire/ScoreMeter';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { getQuestionnaireById } from '../data/questionnaires';
import { getBand } from '../data/scoring';
import { cx, formatDateTime } from '../utils/format';

/** Resultado de un instrumento: cifra, escala de bandas y desglose. */
function SectionResult({ section, index }) {
  const questionnaire = getQuestionnaireById(section.questionnaireId);
  const bands = questionnaire?.bands ?? [];
  const band = getBand(bands, section.totalScore);

  return (
    <section
      className="border border-rule bg-paper"
      style={{ animation: 'var(--animate-enter)', animationDelay: `${index * 60}ms` }}
    >
      <div className="grid gap-8 p-6 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] sm:p-8">
        <div>
          <span className="label text-cobalt-600">{section.code}</span>
          <div className="mt-4">
            <ScoreMeter
              value={section.totalScore}
              max={section.maxScore}
              bands={bands}
              band={band}
            />
          </div>
        </div>

        <div className="min-w-0 sm:border-l sm:border-rule sm:pl-8">
          <h2 className="text-[1.35rem] leading-tight font-extrabold tracking-[-0.028em] text-ink text-balance">
            {section.questionnaireTitle}
          </h2>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-graphite">
            {band.summary}
          </p>

          {/* Métricas derivadas (PSQI) */}
          {section.metrics && (
            <dl className="mt-5 grid grid-cols-3 border-t border-rule">
              {[
                ['Eficiencia', section.metrics.efficiency, '%', 0],
                ['En cama', section.metrics.bedHours, 'h', 1],
                ['Dormidas', section.metrics.sleepHours, 'h', 1],
              ].map(([label, value, unit, digits], position) => (
                <div key={label} className={cx('py-3', position > 0 && 'border-l border-rule pl-4')}>
                  <dt className="label-sm text-silver">{label}</dt>
                  <dd className="tnum mt-1 text-lg leading-none font-extrabold text-ink">
                    {value === null || value === undefined ? '—' : Number(value).toFixed(digits)}
                    <span className="text-[11px] font-bold text-silver">{unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Rangos de referencia como tabla */}
          <table className="mt-5 w-full border-t border-rule text-left">
            <caption className="label sr-only">Rangos de referencia</caption>
            <tbody>
              {bands.map((item) => {
                const isCurrent = item.id === band.id;
                return (
                  <tr key={item.id} className="border-b border-rule-soft last:border-b-0">
                    <td className="w-6 py-2">
                      <span
                        className={cx(
                          'block h-2.5 w-1.5',
                          {
                            low: 'bg-low',
                            guarded: 'bg-guarded',
                            elevated: 'bg-elevated',
                            high: 'bg-high',
                            severe: 'bg-severe',
                          }[item.tone],
                          !isCurrent && 'opacity-45',
                        )}
                      />
                    </td>
                    <td
                      className={cx(
                        'py-2 text-[12.5px]',
                        isCurrent ? 'font-bold text-ink' : 'text-silver',
                      )}
                    >
                      {item.label}
                    </td>
                    <td
                      className={cx(
                        'tnum py-2 text-right text-[12px] font-bold',
                        isCurrent ? 'text-ink' : 'text-silver',
                      )}
                    >
                      {item.min}–{item.max}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <details className="group border-t border-rule">
        <summary className="label flex cursor-pointer list-none items-center justify-between px-6 py-3 text-graphite transition-colors hover:bg-rule-soft sm:px-8">
          Detalle de {section.breakdownKind ?? 'respuestas'}
          <span aria-hidden="true" className="text-[14px] group-open:rotate-45">
            +
          </span>
        </summary>

        <table className="w-full border-t border-rule text-left">
          <tbody>
            {section.breakdown.map((item) => (
              <tr key={item.questionId} className="border-b border-rule-soft last:border-b-0">
                <td className="tnum w-14 py-3 pl-6 align-top text-[11px] font-bold text-silver sm:pl-8">
                  {item.number}
                </td>
                <td className="py-3 pr-4 align-top">
                  <p className="text-[13px] leading-snug font-semibold text-ink">{item.text}</p>
                  {item.labels.length > 0 ? (
                    <p className="mt-0.5 text-[12.5px] text-graphite">{item.labels.join(' · ')}</p>
                  ) : (
                    <p className="mt-0.5 text-[12.5px] text-silver">Sin opciones marcadas</p>
                  )}
                </td>
                <td className="tnum w-20 py-3 pr-6 text-right align-top text-[13px] font-extrabold text-ink sm:pr-8">
                  {item.points}
                  <span className="text-[11px] font-bold text-silver">/{item.maxPoints}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

export default function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveResult } = useAuth();
  const { resetAll } = useQuestionnaire();

  const submission = location.state?.submission ?? null;
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  if (!submission) return <Navigate to="/cuestionario" replace />;

  const alreadySaved = user?.results?.some((result) => result.id === submission.id);
  const isSaved = saveState === 'saved' || alreadySaved;

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      await saveResult(submission);
      resetAll();
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      setSaveError(error.message);
    }
  };

  const startOver = () => {
    resetAll();
    navigate('/cuestionario', { replace: true });
  };

  return (
    <AppShell>
      {/* ── Cabecera con marcadores ──────────────────────────────── */}
      <header
        className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6"
        style={{ animation: 'var(--animate-enter)' }}
      >
        <div>
          <span className="label text-cobalt-600">Evaluación enviada</span>
          <h1 className="mt-3 text-[2rem] leading-none font-extrabold tracking-[-0.038em] text-ink">
            Resultados
          </h1>
          <p className="tnum mt-2 text-[12.5px] text-silver">
            {submission.sections.length} instrumentos · {formatDateTime(submission.completedAt)}
          </p>
        </div>

        <div className="flex flex-wrap divide-x divide-rule border border-rule bg-paper">
          {submission.sections.map((section) => (
            <div key={section.questionnaireId} className="px-4 py-2.5">
              <span className="label-sm block text-silver">{section.code}</span>
              <span className="tnum mt-1 block text-lg leading-none font-extrabold text-ink">
                {section.totalScore}
                <span className="text-[11px] font-bold text-silver">/{section.maxScore}</span>
              </span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-5">
        {submission.sections.map((section, index) => (
          <SectionResult key={section.questionnaireId} section={section} index={index} />
        ))}

        {/* ── Guardar ────────────────────────────────────────────── */}
        <section
          className={cx(
            'border bg-paper p-6 sm:p-8',
            isSaved ? 'border-cobalt-600' : 'border-rule',
          )}
          style={{ animation: 'var(--animate-enter)', animationDelay: '220ms' }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              {isSaved && <Badge tone="low">Guardado</Badge>}
              <h2
                className={cx(
                  'text-[1.15rem] font-extrabold tracking-[-0.025em] text-ink',
                  isSaved && 'mt-3',
                )}
              >
                {isSaved ? 'Resultados en tu historial' : 'Guardar en mi perfil'}
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-graphite">
                {isSaved
                  ? 'Podés consultarlos en Resultados y compararlos con futuras mediciones.'
                  : 'Se archivan para hacer seguimiento en el tiempo. Por ahora quedan en este dispositivo.'}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {isSaved ? (
                <>
                  <Button as={Link} to="/mis-resultados" variant="cobalt" size="md">
                    Ver historial
                  </Button>
                  <Button variant="quiet" size="md" onClick={startOver}>
                    Repetir evaluación
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" loading={saveState === 'saving'} onClick={handleSave}>
                    {saveState === 'saving' ? 'Guardando…' : 'Guardar resultados'}
                  </Button>
                  <Button variant="outline" size="md" onClick={startOver}>
                    Descartar
                  </Button>
                </>
              )}
            </div>
          </div>

          {saveError && (
            <p role="alert" className="mt-4 text-[13px] font-semibold text-magenta-600">
              {saveError}
            </p>
          )}
        </section>

        <p className="max-w-3xl text-[11.5px] leading-relaxed text-silver">
          Los puntajes de cada instrumento se reportan por separado y no se suman entre sí: cada
          escala mide un constructo distinto, con rango e interpretación propios. Son herramientas de
          tamizaje y su lectura corresponde al equipo profesional.
        </p>
      </div>
    </AppShell>
  );
}
