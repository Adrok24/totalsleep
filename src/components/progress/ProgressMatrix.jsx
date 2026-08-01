import { getQuestionnaireById, QUESTIONNAIRES } from '../../data/questionnaires';
import { getBand } from '../../data/scoring';
import { cx, formatDateShort } from '../../utils/format';

const TONE_FILL = {
  low: 'fill-low',
  guarded: 'fill-guarded',
  elevated: 'fill-elevated',
  high: 'fill-high',
  severe: 'fill-severe',
};

const TONE_BG = {
  low: 'bg-low',
  guarded: 'bg-guarded',
  elevated: 'bg-elevated',
  high: 'bg-high',
  severe: 'bg-severe',
};

/**
 * Línea de tendencia de un instrumento.
 *
 * Cada instrumento tiene su propia escala (0–31, 0–28, 0–21, 0–27), así que
 * cada línea se normaliza contra SU máximo: son small multiples, nunca dos
 * escalas compartiendo un eje. El trazo va en tinta —color de texto— y los
 * puntos llevan el color de la banda; el color nunca es el único portador
 * del dato porque los valores exactos están en la misma fila.
 */
function Trend({ series, max, width = 116, height = 38 }) {
  if (series.length < 2) {
    return <span className="text-[11px] text-silver">—</span>;
  }

  const pad = 5;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const point = (entry, index) => ({
    x: pad + (index / (series.length - 1)) * innerW,
    // Más puntaje = peor, y arriba = peor: la línea sube cuando empeora.
    y: pad + innerH - (entry.score / max) * innerH,
  });

  const points = series.map(point);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Evolución: ${series.map((entry) => entry.score).join(', ')} sobre ${max}`}
    >
      {/* Línea base del rango, recesiva */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="stroke-rule" strokeWidth="1" />
      <path d={path} fill="none" className="stroke-ink" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, index) => {
        const isLast = index === points.length - 1;
        return (
          <circle
            key={series[index].id}
            cx={p.x}
            cy={p.y}
            r={isLast ? 4 : 2.5}
            className={cx(TONE_FILL[series[index].tone], isLast && 'stroke-paper')}
            strokeWidth={isLast ? 2 : 0}
          >
            <title>{`${series[index].label}: ${series[index].score}/${max}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}

/**
 * Matriz de progreso: instrumentos en filas, tomas en columnas.
 *
 * Es una tabla a propósito: el equipo clínico necesita los valores exactos,
 * y la tabla también cubre el requisito de accesibilidad de que exista una
 * lectura del dato sin depender del color.
 */
export default function ProgressMatrix({ results, className }) {
  // De la más antigua a la más reciente: el tiempo corre hacia la derecha.
  const sessions = [...(results ?? [])].reverse();

  if (sessions.length === 0) return null;

  const rows = QUESTIONNAIRES.map((questionnaire) => {
    const series = sessions
      .map((session) => {
        const section = session.sections?.find((s) => s.questionnaireId === questionnaire.id);
        if (!section) return null;
        const band = getBand(questionnaire.bands, section.totalScore);
        return {
          id: session.id,
          score: section.totalScore,
          tone: band.tone,
          band: band.label,
          label: formatDateShort(session.completedAt),
        };
      })
      .filter(Boolean);

    const first = series[0];
    const last = series[series.length - 1];
    const delta = first && last && series.length > 1 ? last.score - first.score : null;

    return { questionnaire, series, delta, last };
  }).filter((row) => row.series.length > 0);

  return (
    <div className={cx('overflow-x-auto border border-rule bg-paper', className)}>
      <table className="w-full min-w-[46rem] text-left">
        <thead>
          <tr className="border-b border-rule">
            <th scope="col" className="label px-5 py-3 text-silver">
              Instrumento
            </th>
            <th scope="col" className="label px-2 py-3 text-silver">
              Rango
            </th>
            {sessions.map((session, index) => (
              <th
                key={session.id}
                scope="col"
                className={cx(
                  'label px-3 py-3 text-right',
                  index === sessions.length - 1 ? 'text-ink' : 'text-silver',
                )}
              >
                {formatDateShort(session.completedAt)}
              </th>
            ))}
            <th scope="col" className="label px-4 py-3 text-center text-silver">
              Evolución
            </th>
            {/* La matriz compara contra la primera toma; las fichas de cada
                sesión comparan contra la anterior. Conviene decirlo. */}
            <th scope="col" className="label px-5 py-3 text-right text-silver">
              vs. 1ª toma
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(({ questionnaire, series, delta, last }) => (
            <tr key={questionnaire.id} className="border-b border-rule-soft last:border-b-0">
              <th scope="row" className="px-5 py-3 align-middle">
                <span className="label block text-cobalt-600">{questionnaire.code}</span>
                <span className="mt-0.5 block text-[12.5px] font-semibold text-ink">
                  {questionnaire.title}
                </span>
              </th>

              <td className="tnum px-2 py-3 align-middle text-[11.5px] text-silver">
                0–{questionnaire.maxScore}
              </td>

              {sessions.map((session, index) => {
                const entry = series.find((item) => item.id === session.id);
                const isLatest = index === sessions.length - 1;
                return (
                  <td key={session.id} className="px-3 py-3 text-right align-middle">
                    {entry ? (
                      <span
                        className="inline-flex items-center gap-2"
                        title={`${entry.label} · ${entry.band}`}
                      >
                        <span className={cx('h-3.5 w-1 shrink-0', TONE_BG[entry.tone])} />
                        <span
                          className={cx(
                            'tnum text-[15px] font-extrabold',
                            isLatest ? 'text-ink' : 'text-graphite',
                          )}
                        >
                          {entry.score}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[12px] text-silver">—</span>
                    )}
                  </td>
                );
              })}

              <td className="px-4 py-2 align-middle">
                <div className="flex justify-center">
                  <Trend series={series} max={questionnaire.maxScore} />
                </div>
              </td>

              <td className="px-5 py-3 text-right align-middle">
                {delta === null ? (
                  <span className="text-[12px] text-silver">Primera toma</span>
                ) : (
                  <>
                    <span
                      className={cx(
                        'tnum block text-[15px] font-extrabold',
                        delta < 0 ? 'text-cobalt-600' : delta > 0 ? 'text-magenta-500' : 'text-graphite',
                      )}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </span>
                    <span
                      className={cx(
                        'label-sm mt-0.5 block',
                        delta < 0 ? 'text-cobalt-600' : delta > 0 ? 'text-magenta-500' : 'text-silver',
                      )}
                    >
                      {delta < 0 ? 'Mejora' : delta > 0 ? 'Empeora' : 'Sin cambio'}
                    </span>
                  </>
                )}
                <span className="sr-only">{last?.band}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
