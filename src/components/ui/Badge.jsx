import { cx } from '../../utils/format';

/**
 * Etiqueta rectangular con filete. Los tonos de severidad usan la rampa
 * divergente de marca (azul → violeta → magenta).
 */
const TONES = {
  low: 'border-low/35 text-low bg-low-tint',
  guarded: 'border-guarded/35 text-guarded bg-guarded-tint',
  elevated: 'border-elevated/35 text-elevated bg-elevated-tint',
  high: 'border-high/35 text-high bg-high-tint',
  severe: 'border-severe/40 text-severe bg-severe-tint',

  neutral: 'border-rule text-graphite bg-paper',
  ink: 'border-ink bg-ink text-white',
  onDark: 'border-white/25 text-white bg-white/10',
};

export default function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cx(
        'label inline-flex items-center gap-1.5 rounded-xs border px-2 py-1',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}
