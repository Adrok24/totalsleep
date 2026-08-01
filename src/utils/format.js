/** Formateadores compartidos (es-AR). */

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, { hour: '2-digit', minute: '2-digit' });
}

/** Fecha compacta para encabezados de columna: "19 ene 26". */
export function formatDateShort(value) {
  return formatDate(value, { day: '2-digit', month: 'short', year: '2-digit' });
}

/** Meses transcurridos entre dos fechas, redondeados. */
export function monthsBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.round((b - a) / (1000 * 60 * 60 * 24 * 30.44));
}

export function initialsOf(user) {
  if (!user) return '··';
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '··';
}

/** Une clases condicionales sin dependencias externas. */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
