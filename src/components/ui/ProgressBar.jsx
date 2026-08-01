import { cx } from '../../utils/format';

/** Progreso como filete de 2px. Magenta en curso, azul al completarse. */
export default function ProgressBar({ value, max = 100, label, className, showValue = true }) {
  const safeMax = max || 1;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));
  const isComplete = percent >= 100;

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="label text-silver">{label}</span>}
          {showValue && (
            <span
              className={cx(
                'tnum text-[12px] font-bold',
                isComplete ? 'text-cobalt-600' : 'text-ink',
              )}
            >
              {value}
              <span className="text-silver">/{max}</span>
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Progreso'}
        className="relative h-0.5 bg-rule"
      >
        <div
          className={cx(
            'absolute inset-y-0 left-0 transition-[width] duration-300 ease-out',
            isComplete ? 'bg-cobalt-600' : 'bg-magenta-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
