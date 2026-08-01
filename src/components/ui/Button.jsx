import { cx } from '../../utils/format';

/**
 * Botón rectangular. Sin sombras, sin gradientes, sin pill.
 * El magenta está reservado para la acción principal de la pantalla:
 * si hay dos magentas visibles, uno está de más.
 */
const VARIANTS = {
  primary: 'bg-magenta-500 text-white hover:bg-magenta-600 disabled:bg-silver',
  cobalt: 'bg-cobalt-600 text-white hover:bg-cobalt-700 disabled:bg-silver',
  ink: 'bg-ink text-white hover:bg-graphite disabled:bg-silver',
  outline:
    'border border-rule bg-paper text-ink hover:border-ink disabled:border-rule disabled:text-silver',
  quiet: 'text-graphite hover:text-ink hover:bg-rule-soft disabled:text-silver',
  quietInverted: 'text-cobalt-100 hover:text-white hover:bg-white/10',
};

const SIZES = {
  sm: 'h-8 px-3.5 text-[12.5px]',
  md: 'h-10 px-5 text-[13.5px]',
  lg: 'h-12 px-7 text-[14px]',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-[-0.005em]',
        'transition-colors duration-150 select-none',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current/30 border-t-current"
        />
      )}
      {children}
    </Component>
  );
}
