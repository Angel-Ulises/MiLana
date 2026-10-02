export const INVESTMENT_PROVIDER_CONTRACT_VERSION = 1;

const MODOS_AUTORIZACION = new Set(['oauth', 'redirect', 'embedded-token']);
const RESPONSABLE_PROVEEDOR = 'proveedor';

export function validarContratoProveedorInversion(config = {}) {
  const errores = [];
  if (!config.id || typeof config.id !== 'string') errores.push('Falta id interno del proveedor.');
  if (!config.auth || !MODOS_AUTORIZACION.has(config.auth.modo)) errores.push('El modo de autorización debe ser oauth, redirect o embedded-token.');
  if (config.auth?.secretos !== 'servidor') errores.push('Los secretos deben permanecer del lado servidor.');
  if (config.custodiaResponsable !== RESPONSABLE_PROVEEDOR) errores.push('La custodia debe permanecer con la institución proveedora.');
  if (config.kycResponsable !== RESPONSABLE_PROVEEDOR) errores.push('KYC/PLD debe permanecer con la institución proveedora.');
  if (config.ejecucionResponsable !== RESPONSABLE_PROVEEDOR) errores.push('La ejecución debe permanecer con la institución proveedora.');
  if (config.habilitado !== false) errores.push('Un proveedor nuevo debe iniciar deshabilitado.');
  if (config.capacidades?.ordenes === true) errores.push('La capacidad de órdenes no puede iniciar activa.');
  return { valido: errores.length === 0, errores };
}

export function crearContratoProveedorInversion(parcial = {}) {
  return {
    version: INVESTMENT_PROVIDER_CONTRACT_VERSION,
    id: parcial.id || '',
    habilitado: false,
    entorno: parcial.entorno || 'sandbox-pendiente',
    auth: {
      modo: parcial.auth?.modo || 'oauth',
      secretos: 'servidor',
    },
    kycResponsable: RESPONSABLE_PROVEEDOR,
    custodiaResponsable: RESPONSABLE_PROVEEDOR,
    ejecucionResponsable: RESPONSABLE_PROVEEDOR,
    fondeoResponsable: RESPONSABLE_PROVEEDOR,
    retiroResponsable: RESPONSABLE_PROVEEDOR,
    capacidades: {
      lecturaCuenta: false,
      lecturaPosiciones: false,
      cotizaciones: false,
      fondeo: false,
      retiros: false,
      ordenes: false,
      ...(parcial.capacidades || {}),
      ordenes: false,
    },
    requisitosPendientes: [
      'pricing y mínimos por escrito',
      'sandbox y documentación técnica',
      'residentes en México y monedas soportadas',
      'KYC/PLD y responsabilidades contractuales',
      'custodia y entidad ejecutora',
      'fondeo y retiros desde México',
      'impuestos y documentación fiscal',
      'suitability o perfilamiento aplicable',
      'revenue share o modelo comercial',
    ],
  };
}

export function crearAdaptadorProveedorDesactivado(config = {}) {
  const contrato = crearContratoProveedorInversion(config);
  const validacion = validarContratoProveedorInversion(contrato);
  if (!validacion.valido) throw new Error(`Contrato de proveedor inválido: ${validacion.errores.join(' ')}`);

  const bloqueada = () => {
    throw new Error('Integración transaccional desactivada: MiLana no puede conectar, fondear, retirar ni enviar órdenes todavía.');
  };

  return {
    contrato,
    estado: 'desactivado',
    conectarCuenta: bloqueada,
    obtenerCuenta: bloqueada,
    obtenerPosiciones: bloqueada,
    fondear: bloqueada,
    retirar: bloqueada,
    enviarOrden: bloqueada,
  };
}
