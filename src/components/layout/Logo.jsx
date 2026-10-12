import { cx } from '../../utils/format';

/**
 * Marca TotalSleep — archivo en `public/logo.svg`.
 * Usa BASE_URL para funcionar también bajo GitHub Pages (/totalsleep/).
 */
export default function Logo({ className }) {
  const src = `${import.meta.env.BASE_URL}logo.svg`;

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
