import { cx } from '../../utils/format';

/**
 * Marca TotalSleep como SVG inline: no depende de un archivo externo
 * (evita roturas de path en GitHub Pages y problemas de encoding).
 */
export default function Logo({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 192"
      width={480}
      height={192}
      role="img"
      aria-label="TotalSleep"
      className={cx('block w-auto', className ?? 'h-9')}
    >
      <title>TotalSleep</title>
      <g fill="#1C75BC">
        <rect x="24" y="56" width="56" height="80" rx="4" />
        <rect x="12" y="80" width="80" height="32" rx="4" />
      </g>
      <text
        x="112"
        y="118"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="72"
        fontWeight="800"
        letterSpacing="-2.5"
      >
        <tspan fill="#1C75BC">Total</tspan>
        <tspan fill="#EC008C">SLEEP</tspan>
      </text>
    </svg>
  );
}
