import datos from './data/profesiones.json';

const dinero = (valor) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(Number(valor) || 0);

export function contextoProfesionActual() {
  if (typeof window === 'undefined') return null;
  const slug = new URLSearchParams(window.location.search).get('contexto');
  if (!slug) return null;
  return datos.profesiones.find((profesion) => profesion.slug === slug) || null;
}

export default function AdvisorProfessionContext() {
  const profesion = contextoProfesionActual();
  if (!profesion) return null;

  return (
    <aside className="advisor-public-context" data-advisor-public-context="profesion">
      <div>
        <span>Referencia pública de carrera</span>
        <strong>{profesion.nombre}</strong>
        <p>{dinero(profesion.ingreso)} de ingreso profesional promedio mensual · OLA/ENOE 2026-T2.</p>
      </div>
      <div>
        <p>Esta cifra es contexto de un grupo profesional. <strong>No se cargó como tu ingreso neto</strong> y no modifica ningún cálculo hasta que tú captures tus propios números.</p>
        <a href={`/carreras/profesion/${profesion.slug}`}>Volver al perfil →</a>
      </div>
    </aside>
  );
}
