import { cx } from '../../utils/format';

const TONE_BG = {
  low: 'bg-low',
  guarded: 'bg-guarded',
  elevated: 'bg-elevated',
  high: 'bg-high',
  severe: 'bg-severe',
};

const TONE_TEXT = {
  low: 'text-low',
  guarded: 'text-guarded',
  elevated: 'text-elevated',
  high: 'text-high',
  severe: 'text-severe',
};

/**
 * Lectura del puntaje: cifra grande y, debajo, la escala completa del
 * instrumento segmentada por bandas, con un cursor en la posición exacta.
 *
 * Reemplaza al típico anillo de dashboard: acá interesa dónde cae el
 * puntaje dentro del rango clínico, no qué porcentaje del máximo es.
 */
export default function ScoreMeter({ value, max, bands, band }) {
  // Se acota para que el cursor no quede medio cuerpo fuera en 0 y en el máximo.
  const position = Math.min(99.4, Math.max(0.6, (value / max) * 100));

  return (
    <div>
      <div className="flex items-end gap-3">
        <span className="tnum text-[4.5rem] leading-[0.82] font-extrabold tracking-[-0.05em] text-ink">
          {value}
        </span>
        <span className="tnum pb-1.5 text-[15px] font-bold text-silver">/ {max}</span>
      </div>

      <p className={cx('label mt-4', TONE_TEXT[band.tone])}>{band.label}</p>

      {/* Escala de bandas: cada tramo proporcional a su ancho real */}
      <div className="relative mt-3">
        <div className="flex h-2 w-full overflow-hidden">
          {bands.map((item) => (
            <span
              key={item.id}
              title={`${item.label} · ${item.min}–${item.max}`}
              className={cx(
                'h-full transition-opacity duration-200',
                TONE_BG[item.tone],
                item.id === band.id ? 'opacity-100' : 'opacity-45',
              )}
              style={{ width: `${((item.max - item.min + 1) / (max + 1)) * 100}%` }}
            />
          ))}
        </div>

        {/* Cursor: la posición exacta del puntaje sobre la escala */}
        <span
          aria-hidden="true"
          className="absolute -top-1.5 h-5 w-[3px] -translate-x-1/2 bg-ink transition-[left] duration-500 ease-out"
          style={{ left: `${position}%` }}
        />

        <div className="tnum mt-1.5 flex justify-between text-[10px] font-bold text-silver">
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
