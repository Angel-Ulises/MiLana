// Una sola fuente de rutas para Órbita (HTML estático) y encabezados React.
// Mantener la selección de secciones de portada/SEO sin crear URL /calculadoras.
export const NAVEGACION_MILANA = Object.freeze([
  ['calculadoras', '/#calculadoras', 'Calculadoras'],
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
  const match = NAVEGACION_MILANA.find(([id]) => id !== 'calculadoras' && p.startsWith('/' + id) && (p.length === id.length + 1 || p[id.length + 1] === '/'));
  if (match) return match[0];
  return p.startsWith('/calculadoras/') ? 'calculadoras' : null;
}