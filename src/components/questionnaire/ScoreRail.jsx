import { getBand } from '../../data/scoring';
import { cx } from '../../utils/format';
import ProgressBar from '../ui/ProgressBar';
import ScoreMeter from './ScoreMeter';

/**
 * Riel lateral: lectura en vivo del instrumento actual y tabla de ítems.
 * En mobile se reduce a una barra inferior de una sola línea.
 */
export default function ScoreRail({ score, bands, code, breakdownLabel, onJump }) {
  const band = getBand(bands, score.total);
  const answeredRatio = score.answeredCount / score.totalQuestions;

  return (
    <>
      {/* ── Desktop ───────────────────────────────────────────────── */}
      <aside className="sticky top-20 hidden lg:block">
        <div className="border border-rule bg-paper">
          <div className="border-b border-rule px-5 pt-5 pb-6">
            <div className="mb-5 flex items-baseline justify-between">
              <span className="label text-silver">Puntaje en vivo</span>
              {code && <span className="label text-cobalt-600">{code}</span>}
            </div>
            <ScoreMeter value={score.total} max={score.max} bands={bands} band={band} />
          </div>

          <div className="border-b border-rule px-5 py-4">
            <ProgressBar
              label="Completado"
              value={score.answeredCount}
              max={score.totalQuestions}
            />
          </div>

          <div className="px-5 py-4">
            <p className="label mb-3 text-silver">
              {breakdownLabel ? `7 ${breakdownLabel} · 0–3 c/u` : 'Detalle por ítem'}
            </p>

            <ul className="-mx-2">
              {score.breakdown.map((item) => (
                <li key={item.questionId}>
                  <button
                    type="button"
                    onClick={() => onJump?.(item)}
                    className="flex w-full items-baseline gap-3 rounded-xs px-2 py-1.5 text-left transition-colors hover:bg-rule-soft"
                  >
                    <span
                      className={cx(
                        'tnum w-6 shrink-0 text-[10.5px] font-bold',
                        item.answered ? 'text-cobalt-600' : 'text-silver',
                      )}
                    >
                      {item.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-graphite">
                      {item.text}
                    </span>
                    <span
                      className={cx(
                        'tnum shrink-0 text-[12px] font-bold',
                        item.answered ? 'text-ink' : 'text-rule',
                      )}
                    >
                      {item.points}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-silver">
          Cada instrumento se puntúa por separado. Los puntajes no se suman entre sí.
        </p>
      </aside>

      {/* ── Mobile ────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-30 -mx-5 mt-6 border-t border-rule bg-paper px-5 py-3 sm:-mx-8 sm:px-8 lg:hidden">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <span className="label-sm block text-silver">{code ?? 'Puntaje'}</span>
            <span className="tnum text-xl leading-none font-extrabold text-ink">
              {score.total}
              <span className="text-[12px] font-bold text-silver">/{score.max}</span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="h-0.5 bg-rule">
              <div
                className="h-full bg-magenta-500 transition-[width] duration-300"
                style={{ width: `${answeredRatio * 100}%` }}
              />
            </div>
            <p className="tnum mt-1.5 text-[11px] font-semibold text-graphite">
              {score.answeredCount} de {score.totalQuestions} respondidas
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
