// Una sola fuente de rutas para Órbita (HTML estático) y encabezados React.
// /calculadoras es la página de entrada a todas las calculadoras, agrupadas por situación.
export const NAVEGACION_MILANA = Object.freeze([
  ['calculadoras', '/calculadoras', 'Calculadoras'],
  ['carreras', '/carreras', 'Carreras'],
  ['estados', '/estados', 'Estados'],
  ['finanzas', '/finanzas', 'Finanzas'],
  ['invertir', '/invertir', 'Invertir'],
  ['economia', '/economia', 'Economía'],
  ['aprende', '/aprende', 'Aprende'],
]);

export function seccionNavegacion(pathname = '/') {
  const p = typeof pathname === 'string' ? pathname : '/';
  if (p === '/finanzas/inversion' || p.startsWith('/finanzas/inversion/')) return 'invertir';
  const match = NAVEGACION_MILANA.find(([id]) => p.startsWith('/' + id) && (p.length === id.length + 1 || p[id.length + 1] === '/'));
  return match ? match[0] : null;
}