import { cx } from '../../utils/format';
import Logo from './Logo';

/**
 * Acceso: una sola columna centrada sobre el gris de página.
 * Sin panel narrativo ni ornamento — el formulario es lo único que hay
 * que hacer acá, así que es lo único que se muestra.
 */
export default function AuthLayout({ eyebrow, title, subtitle, children, wide = false }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div
        className={cx('w-full', wide ? 'max-w-[32rem]' : 'max-w-[26rem]')}
        style={{ animation: 'var(--animate-enter)' }}
      >
        <div className="mb-8 flex justify-center">
          <Logo className="h-12" />
        </div>

        <div className="border border-rule bg-paper p-7 sm:p-9">
          {eyebrow && <p className="label text-magenta-500">{eyebrow}</p>}
          <h1 className="mt-3 text-[1.75rem] leading-none font-extrabold tracking-[-0.035em] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-[13.5px] leading-relaxed text-graphite">{subtitle}</p>
          )}

          <div className="mt-7 border-t border-rule pt-7">{children}</div>
        </div>

        <p className="mt-6 text-center text-[11.5px] text-silver">
          © {new Date().getFullYear()} TotalSleep · Prototipo con datos simulados.
        </p>
      </div>
    </div>
  );
}
