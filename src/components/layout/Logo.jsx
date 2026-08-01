import { cx } from '../../utils/format';

/**
 * Marca TotalSleep — archivo oficial servido desde `public/logo.png`
 * (480×192, relación 2.5:1).
 *
 * Se declaran `width`/`height` para que el navegador reserve el espacio
 * antes de descargar la imagen y no haya salto de layout al cargar.
 * Para cambiar el tamaño en un contexto puntual, pasar una clase de alto
 * por `className` (el ancho se ajusta solo).
 */
export default function Logo({ className }) {
  return (
    <img
      src="/logo.png"
      alt="TotalSleep"
      width={480}
      height={192}
      className={cx('block w-auto', className ?? 'h-9')}
    />
  );
}
