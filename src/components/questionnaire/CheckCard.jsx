import { cx } from '../../utils/format';

/**
 * Opción de selección múltiple. Casilla cuadrada; al marcarla el filete
 * pasa a magenta y aparece el incremento de puntaje a la derecha.
 */
export default function CheckCard({ name, option, checked, onToggle }) {
  return (
    <label
      className={cx(
        'group flex cursor-pointer items-center gap-3 rounded-sm border py-2.5 pr-3 pl-3',
        'transition-colors duration-150',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-magenta-500',
        checked
          ? 'border-magenta-500 bg-magenta-50'
          : 'border-rule bg-paper hover:border-graphite',
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={option.id}
        checked={checked}
        onChange={() => onToggle(option.id)}
        className="sr-only"
      />

      <span
        aria-hidden="true"
        className={cx(
          'grid size-4 shrink-0 place-items-center border transition-colors duration-150',
          checked ? 'border-magenta-500 bg-magenta-500' : 'border-silver group-hover:border-ink',
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-2.5 text-white" aria-hidden="true">
            <path
              d="m2.5 6.2 2.3 2.3 4.7-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="square"
            />
          </svg>
        )}
      </span>

      <span
        className={cx(
          'flex-1 text-[13px] leading-tight font-semibold',
          checked ? 'text-ink' : 'text-graphite',
        )}
      >
        {option.label}
      </span>

      <span
        className={cx(
          'tnum label-sm transition-opacity duration-150',
          checked ? 'text-magenta-600 opacity-100' : 'opacity-0',
        )}
      >
        +1
      </span>
    </label>
  );
}
