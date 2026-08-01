import { Link } from 'react-router-dom';
import { cx } from '../../utils/format';

/**
 * Recorrido del flujo como fila de celdas contiguas separadas por filetes.
 * La celda actual se marca con un filete magenta superior; las completadas,
 * con uno azul. Sin píldoras ni conectores decorativos.
 */
export default function FlowSteps({ steps, currentSlug }) {
  return (
    <ol className="flex overflow-hidden border border-rule bg-paper">
      {steps.map((step, index) => {
        const isCurrent = step.slug === currentSlug;

        return (
          <li key={step.id} className={cx('min-w-0 flex-1', index > 0 && 'border-l border-rule')}>
            <Link
              to={`/cuestionario/${step.slug}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cx(
                'group relative block px-2 py-2.5 transition-colors duration-150 sm:px-4',
                isCurrent ? 'bg-paper' : 'hover:bg-rule-soft',
              )}
            >
              {/* Marcador de estado */}
              <span
                aria-hidden="true"
                className={cx(
                  'absolute inset-x-0 top-0 h-0.5 transition-colors',
                  isCurrent
                    ? 'bg-magenta-500'
                    : step.isComplete
                      ? 'bg-cobalt-600'
                      : 'bg-transparent',
                )}
              />

              <div className="flex items-baseline gap-2">
                {/* En pantallas chicas el número cede su lugar al código */}
                <span
                  className={cx(
                    'tnum hidden text-[10px] font-bold sm:inline',
                    isCurrent
                      ? 'text-magenta-500'
                      : step.isComplete
                        ? 'text-cobalt-600'
                        : 'text-silver',
                  )}
                >
                  {String(step.page).padStart(2, '0')}
                </span>
                <span
                  className={cx(
                    'truncate text-[12.5px] font-bold tracking-[-0.01em]',
                    isCurrent ? 'text-ink' : step.isComplete ? 'text-graphite' : 'text-silver',
                  )}
                >
                  {step.code}
                </span>
              </div>

              <span
                className={cx(
                  'tnum mt-0.5 block text-[10.5px] font-semibold',
                  step.isComplete ? 'text-cobalt-600' : 'text-silver',
                )}
              >
                {step.answeredCount}/{step.totalQuestions}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
