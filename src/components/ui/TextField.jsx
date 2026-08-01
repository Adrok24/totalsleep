import { useId, useState } from 'react';
import { cx } from '../../utils/format';

/**
 * Campo de texto: etiqueta técnica arriba, caja rectangular con filete.
 * El foco engrosa el filete a magenta — sin halos ni sombras.
 */
export default function TextField({
  label,
  type = 'text',
  error,
  hint,
  className,
  ...props
}) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && revealed ? 'text' : type;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cx('label', error ? 'text-magenta-600' : 'text-graphite')}
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cx(
            'h-11 w-full rounded-sm border bg-paper px-3.5 text-[14.5px] font-medium text-ink',
            'transition-colors duration-150 outline-none',
            'placeholder:font-normal placeholder:text-silver',
            'focus:border-magenta-500',
            isPassword && 'pr-11',
            error ? 'border-magenta-500 bg-magenta-50' : 'border-rule hover:border-silver',
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xs p-1.5 text-silver transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
              <path
                d="M1.8 10S4.8 4.8 10 4.8 18.2 10 18.2 10 15.2 15.2 10 15.2 1.8 10 1.8 10Z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.4" />
              {!revealed && <path d="m3.5 16.5 13-13" stroke="currentColor" strokeWidth="1.4" />}
            </svg>
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[12.5px] font-semibold text-magenta-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-[12.5px] text-silver">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
