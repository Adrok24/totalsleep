import { cx } from '../../utils/format';

/**
 * Opción de selección única. Rectángulo con filete; al elegirla se invierte
 * a tinta. Los cuadraditos de la izquierda traducen la intensidad de la
 * escala sin depender de leer el número.
 */
export default function ChoiceCard({
  name,
  option,
  checked,
  onSelect,
  scaleMax = 4,
  hidePoints = false,
}) {
  return (
    <label
      className={cx(
        'group relative flex cursor-pointer flex-col justify-between gap-3 rounded-sm border p-3',
        'transition-colors duration-150',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-magenta-500',
        checked
          ? 'border-ink bg-ink text-white'
          : 'border-rule bg-paper text-ink hover:border-graphite',
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.id}
        checked={checked}
        onChange={() => onSelect(option.id)}
        className="sr-only"
      />

      {/* Escalón de intensidad */}
      {!hidePoints && (
        <span className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: scaleMax }, (_, step) => (
            <span
              key={step}
              className={cx(
                'size-1.5 transition-colors duration-150',
                step < option.points
                  ? 'bg-magenta-500'
                  : checked
                    ? 'bg-white/25'
                    : 'bg-rule group-hover:bg-silver',
              )}
            />
          ))}
        </span>
      )}

      <span
        className={cx(
          'text-[13px] leading-[1.3] font-semibold text-balance',
          checked ? 'text-white' : 'text-ink',
        )}
      >
        {option.label}
      </span>

      {!hidePoints && (
        <span
          className={cx('tnum label-sm', checked ? 'text-magenta-200' : 'text-silver')}
        >
          {option.points} pt
        </span>
      )}
    </label>
  );
}
