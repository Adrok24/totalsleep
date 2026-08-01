import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProgressMatrix from '../components/progress/ProgressMatrix';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { QUESTIONNAIRES, getQuestionnaireById } from '../data/questionnaires';
import { getBand } from '../data/scoring';
import { cx, formatDateTime } from '../utils/format';

const TONE_BG = {
  low: 'bg-low',
  guarded: 'bg-guarded',
  elevated: 'bg-elevated',
  high: 'bg-high',
  severe: 'bg-severe',
};

function bandOf(section) {
  const questionnaire = getQuestionnaireById(section.questionnaireId);
  return getBand(questionnaire?.bands ?? [], section.totalScore);
}

function EmptyState() {
  return (
    <div className="border border-dashed border-rule bg-paper px-8 py-20 text-center">
      <h2 className="text-[1.25rem] font-extrabold tracking-[-0.025em] text-ink">
        Todavía no guardaste resultados
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-graphite">
        Completá la evaluación y guardá el resultado para empezar a construir tu historial.
      </p>
      <Button as={Link} to="/cuestionario" size="lg" className="mt-6">
        Comenzar evaluación
      </Button>
    </div>
  );
}

export default function ResultsPage() {
  const { user } = useAuth();
  const results = user?.results ?? [];

  const perInstrument = QUESTIONNAIRES.map((questionnaire) => {
    const history = results
      .map((result) => result.sections?.find((s) => s.questionnaireId === questionnaire.id))
      .filter(Boolean);

    return {
      questionnaire,
      latest: history[0],
      delta: history[0] && history[1] ? history[0].totalScore - history[1].totalScore : null,
    };
  });

  return (
    <AppShell>
      <header
        className="mb-8 border-b border-rule pb-6"
        style={{ animation: 'var(--animate-enter)' }}
      >
        <span className="label text-magenta-500">Historial clínico</span>
        <h1 className="mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none font-extrabold tracking-[-0.038em] text-ink">
          Resultados
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-graphite">
          Cada evaluación queda archivada con el puntaje y la banda de cada instrumento. Repetila
          periódicamente para observar la evolución.
        </p>
      </header>

      {results.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Panel de últimos valores, como tabla de indicadores */}
          <div
            className="grid grid-cols-2 border border-rule bg-paper sm:grid-cols-3 lg:grid-cols-6"
            style={{ animation: 'var(--animate-enter)' }}
          >
            <div className="border-r border-b border-rule p-4 lg:border-b-0">
              <span className="label text-silver">Evaluaciones</span>
              <p className="tnum mt-2 text-2xl leading-none font-extrabold text-ink">
                {results.length}
              </p>
            </div>

            {perInstrument.map(({ questionnaire, latest, delta }, index) => (
              <div
                key={questionnaire.id}
                className={cx(
                  'border-b border-rule p-4 lg:border-b-0',
                  index < perInstrument.length - 1 && 'border-r',
                  index % 2 === 0 && 'sm:border-r',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="label text-silver">{questionnaire.code}</span>
                  {delta !== null && delta !== 0 && (
                    <span
                      className={cx(
                        'tnum text-[10.5px] font-bold',
                        delta > 0 ? 'text-magenta-500' : 'text-cobalt-600',
                      )}
                    >
                      {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                    </span>
                  )}
                </div>
                <p className="tnum mt-2 text-2xl leading-none font-extrabold text-ink">
                  {latest ? latest.totalScore : '—'}
                  <span className="text-[12px] font-bold text-silver">
                    {latest ? `/${latest.maxScore}` : ''}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Progreso entre tomas: sólo tiene sentido con dos o más */}
          {results.length > 1 && (
            <section>
              <h2 className="mb-3 text-[1.15rem] font-extrabold tracking-[-0.025em] text-ink">
                Tu progreso
              </h2>
              <ProgressMatrix results={results} />
              <p className="mt-3 max-w-3xl text-[11.5px] leading-relaxed text-silver">
                En los cinco instrumentos un puntaje más alto indica peor estado: un cambio negativo
                es una mejora. Cada escala tiene su propio rango y no son comparables entre sí.
              </p>
            </section>
          )}

          {/* Evaluaciones */}
          <div className="flex flex-col gap-4">
            {results.map((result, index) => (
              <article
                key={result.id}
                className="border border-rule bg-paper"
                style={{ animation: 'var(--animate-enter)', animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-3">
                  <span className="tnum label text-ink">{formatDateTime(result.completedAt)}</span>
                  <span className="label text-silver">
                    {result.sections?.length ?? 0} instrumentos
                  </span>
                </div>

                <table className="w-full text-left">
                  <tbody>
                    {(result.sections ?? []).map((section) => {
                      const band = bandOf(section);
                      const percent = (section.totalScore / section.maxScore) * 100;

                      return (
                        <tr
                          key={section.questionnaireId}
                          className="border-b border-rule-soft last:border-b-0"
                        >
                          <td className="label w-20 py-3 pl-5 align-middle text-cobalt-600">
                            {section.code}
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <p className="text-[13px] font-semibold text-ink">
                              {section.questionnaireTitle}
                            </p>
                          </td>
                          <td className="hidden w-40 py-3 pr-4 align-middle sm:table-cell">
                            <div className="h-1 w-full bg-rule">
                              <div
                                className={cx('h-full', TONE_BG[band.tone])}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </td>
                          <td className="w-52 py-3 pr-4 text-right align-middle">
                            <Badge tone={band.tone}>{band.label}</Badge>
                          </td>
                          <td className="tnum w-24 py-3 pr-5 text-right align-middle text-lg font-extrabold text-ink">
                            {section.totalScore}
                            <span className="text-[11px] font-bold text-silver">
                              /{section.maxScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </article>
            ))}
          </div>

          <div>
            <Button as={Link} to="/cuestionario" variant="outline" size="md">
              Realizar una nueva evaluación
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
