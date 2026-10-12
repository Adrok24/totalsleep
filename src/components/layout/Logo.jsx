import { cx } from '../../utils/format';

/**
 * Marca TotalSleep — archivo oficial servido desde `public/logo.png`
 * (480×192, relación 2.5:1).
 *
 * Usa BASE_URL para que también funcione en GitHub Pages (/totalsleep/).
 */
export default function Logo({ className }) {
  const src = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <img
      src={src}
      alt="TotalSleep"
      width={480}
      height={192}
      className={cx('block w-auto', className ?? 'h-9')}
    />
  );
}
