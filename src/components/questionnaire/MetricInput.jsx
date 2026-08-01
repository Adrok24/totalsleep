import { useId } from 'react';
import { cx } from '../../utils/format';

/**
 * Dato duro dentro de un cuestionario: hora, cantidad o texto libre.
 * No puntúa por sí mismo — alimenta el cálculo de un componente.
 * Se presenta como una fila de formulario técnico, no como una tarjeta.
 */
export default function MetricInput({ question, value, onChange }) {
  const id = useId();
  const isFilled = value !== undefined && value !== null && String(value).trim() !== '';
  const isText = question.type === 'text';

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <label htmlFor={id} className="label flex-1 text-graphite">
        {question.inputLabel ?? question.text}
      </label>

      <div className="relative shrink-0">
        <input
          id={id}
          type={question.type === 'number' ? 'number' : question.type === 'time' ? 'time' : 'text'}
          inputMode={question.type === 'number' ? 'decimal' : undefined}
          min={question.min}
          max={question.max}
          step={question.step}
          placeholder={question.placeholder}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={cx(
            'tnum h-11 rounded-sm border bg-paper px-3.5 text-[15px] font-bold text-ink',
            'transition-colors duration-150 outline-none',
            'placeholder:font-normal placeholder:text-silver',
            'focus:border-magenta-500',
            // El spinner nativo pelea con la unidad; la unidad gana.
            '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]',
            question.unit && 'pr-11',
            isText ? 'w-full font-medium sm:w-80' : 'w-full sm:w-40',
            isFilled ? 'border-cobalt-600' : 'border-rule hover:border-silver',
          )}
        />
        {question.unit && (
          <span className="label-sm pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-silver">
            {question.unit}
          </span>
        )}
      </div>
    </div>
  );
}
