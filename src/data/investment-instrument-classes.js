export const INSTRUMENT_SOURCE_CHECKED_AT = '2026-10-01';

export const investmentInstrumentClasses = [
  {
    id: 'cetes',
    nombre: 'CETES',
    familia: 'Deuda gubernamental',
    resumen: 'Certificados emitidos por el Gobierno de México que se adquieren a descuento y tienen un vencimiento definido.',
    dimensiones: {
      estructura: 'Valor gubernamental en pesos. La diferencia entre precio de compra y valor nominal al vencimiento forma parte del rendimiento.',
      plazo: 'Cetesdirecto publica plazos de 28, 91, 182, 364 y 728 días. La disponibilidad exacta puede cambiar y debe verificarse al momento de operar.',
      liquidez: 'Tiene vencimiento definido. Si el dinero podría necesitarse antes, hay que revisar las condiciones del canal y cualquier mecanismo de venta anticipada; MiLana no asume disponibilidad inmediata.',
      variacion: 'La tasa disponible cambia con el mercado y con la fecha de compra. MiLana no usa una tasa vigente para decidir si conviene.',
      diversificacion: 'Comprar un CETE no equivale por sí mismo a una cartera diversificada; sigue siendo exposición a una sola familia de instrumento y emisor.',
      costos: 'Hay que verificar impuestos, condiciones y costos del canal utilizado. Esta ficha no presume que todos los intermediarios tengan la misma estructura de costos.',
      custodia: 'Debe verificarse qué institución o plataforma lleva la cuenta y custodia el valor en el canal específico usado por la persona.',
    },
    fuente: {
      institucion: 'cetesdirecto / Gobierno de México',
      titulo: 'Productos cetesdirecto — CETES',
      url: 'https://www.cetesdirecto.com/sites/portal/productos.cetesdirecto',
    },
  },
  {
    id: 'fondos-inversion',
    nombre: 'Fondos de inversión',
    familia: 'Cartera administrada',
    resumen: 'Vehículos que concentran recursos de muchos inversionistas y los invierten en una cartera definida por el objetivo y prospecto del fondo.',
    dimensiones: {
      estructura: 'El fondo puede invertir en deuda, acciones u otros valores según su régimen y prospecto. El inversionista adquiere una participación en el patrimonio del fondo.',
      plazo: 'No existe un plazo universal para todos los fondos. Deben revisarse objetivo, horizonte sugerido, régimen de recompra y documentos del fondo específico.',
      liquidez: 'Depende del fondo, serie y reglas de recompra. La frecuencia con la que puede recuperarse el dinero debe verificarse en el prospecto y documentos clave.',
      variacion: 'El valor de la participación puede cambiar por los instrumentos que integran la cartera. Fondos distintos pueden tener exposiciones y sensibilidades muy diferentes.',
      diversificacion: 'Pueden distribuir recursos entre múltiples instrumentos; el grado real de diversificación depende de la cartera y no debe asumirse solo por llamarse “fondo”.',
      costos: 'CNBV recomienda comparar comisiones y gastos junto con riesgo, cartera y otros documentos. Los costos dependen del fondo y serie concreta.',
      custodia: 'La operadora, distribuidora, valuadora y demás participantes deben identificarse en la documentación del fondo y verificarse en fuentes oficiales.',
    },
    fuente: {
      institucion: 'Comisión Nacional Bancaria y de Valores',
      titulo: 'Sector y comparador de Fondos de Inversión',
      url: 'https://www.gob.mx/cnbv/acciones-y-programas/buscador-y-comparador-de-fondos-de-inversion',
    },
  },
  {
    id: 'acciones',
    nombre: 'Acciones',
    familia: 'Capital de una empresa',
    resumen: 'Valores de capital que representan participación en una empresa y cuyo precio de mercado puede variar.',
    dimensiones: {
      estructura: 'Participación de capital en una emisora. En México la compra y venta bursátil se realiza mediante intermediación autorizada.',
      plazo: 'No tienen un vencimiento equivalente al de un CETE. El horizonte depende del objetivo de la persona y no elimina la posibilidad de pérdidas.',
      liquidez: 'Se negocian en mercado cuando existe contraparte y dentro de las condiciones de operación aplicables. El volumen y facilidad de compraventa varían entre emisoras.',
      variacion: 'El precio puede subir o bajar por resultados de la empresa, expectativas y condiciones de mercado. No hay un rendimiento futuro garantizado.',
      diversificacion: 'Una acción individual concentra exposición en una emisora. La diversificación requiere combinar exposiciones; MiLana no propone una cartera específica.',
      costos: 'Deben revisarse comisión de intermediación, spread, impuestos y cualquier otro cargo aplicable al contrato y mercado utilizado.',
      custodia: 'La operación requiere un intermediario autorizado; debe verificarse quién ejecuta y quién custodia los valores del contrato específico.',
    },
    fuente: {
      institucion: 'Bolsa Mexicana de Valores',
      titulo: 'Mercado de Capitales y participación en Bolsa',
      url: 'https://www.bmv.com.mx/es/mercados/capitales',
    },
  },
  {
    id: 'etf',
    nombre: 'ETF',
    familia: 'Fondo negociado en bolsa',
    resumen: 'Vehículo que agrupa activos o sigue una estrategia y cuyas participaciones se negocian en bolsa durante la sesión de mercado.',
    dimensiones: {
      estructura: 'Puede dar exposición a una canasta, índice, sector, país u otra estrategia. La composición y metodología deben revisarse en el ETF concreto.',
      plazo: 'No tiene un plazo universal. Que cotice diariamente no significa que sea apropiado para dinero que se necesitará pronto.',
      liquidez: 'Se compra y vende en bolsa; importan volumen, spread y mercado de origen. La liquidez no es idéntica para todos los ETF.',
      variacion: 'Su precio y valor pueden cambiar con los activos subyacentes, divisas y condiciones de mercado. No debe confundirse diversificación con ausencia de pérdidas.',
      diversificacion: 'Muchos ETF reúnen varios activos, pero algunos están concentrados por sector, país, estrategia o factor. Hay que revisar su composición real.',
      costos: 'Además de costos del intermediario pueden existir gastos propios del fondo, spread y efectos fiscales. Deben verificarse para el ETF y contrato concretos.',
      custodia: 'Debe identificarse el intermediario que recibe la orden y la institución que custodia. En valores internacionales también importa el mercado o sistema a través del cual se accede.',
    },
    fuente: {
      institucion: 'Bolsa Mexicana de Valores',
      titulo: 'Mercado Global / Sistema Internacional de Cotizaciones',
      url: 'https://www.bmv.com.mx/es/mercados/mercado-global',
    },
  },
];

export const investmentComparisonDimensions = [
  { id: 'estructura', etiqueta: 'Qué compras' },
  { id: 'plazo', etiqueta: 'Plazo' },
  { id: 'liquidez', etiqueta: 'Liquidez' },
  { id: 'variacion', etiqueta: 'Qué puede variar' },
  { id: 'diversificacion', etiqueta: 'Diversificación' },
  { id: 'costos', etiqueta: 'Costos a verificar' },
  { id: 'custodia', etiqueta: 'Intermediación y custodia' },
];
