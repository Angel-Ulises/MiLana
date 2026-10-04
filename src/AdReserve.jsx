// Los bloques reservados sin un <ins className="adsbygoogle"> real creaban huecos permanentes.
// AdSense sigue cargando desde index.html; este componente ya no reserva espacio ficticio.
export default function AdReserve() {
  return null;
}
