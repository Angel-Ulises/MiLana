import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crearAdaptadorProveedorDesactivado,
  crearContratoProveedorInversion,
  validarContratoProveedorInversion,
} from '../src/lib/investmentProviderContract.js';

test('contrato nuevo fuerza custodia, KYC, ejecución y secretos fuera del cliente', () => {
  const contrato = crearContratoProveedorInversion({ id:'sandbox-generico', auth:{ modo:'oauth' } });
  assert.equal(contrato.habilitado, false);
  assert.equal(contrato.auth.secretos, 'servidor');
  assert.equal(contrato.kycResponsable, 'proveedor');
  assert.equal(contrato.custodiaResponsable, 'proveedor');
  assert.equal(contrato.ejecucionResponsable, 'proveedor');
  assert.equal(contrato.capacidades.ordenes, false);
  assert.equal(validarContratoProveedorInversion(contrato).valido, true);
});

test('validador rechaza activar órdenes o mover custodia a MiLana', () => {
  const inseguro = {
    id:'x',
    habilitado:true,
    auth:{ modo:'oauth', secretos:'cliente' },
    kycResponsable:'milana',
    custodiaResponsable:'milana',
    ejecucionResponsable:'milana',
    capacidades:{ ordenes:true },
  };
  const validacion = validarContratoProveedorInversion(inseguro);
  assert.equal(validacion.valido, false);
  assert.ok(validacion.errores.length >= 5);
});

test('adaptador desactivado bloquea conexión, fondeo, retiro y órdenes', () => {
  const adaptador = crearAdaptadorProveedorDesactivado({ id:'sandbox-generico', auth:{ modo:'redirect' } });
  for (const metodo of ['conectarCuenta','obtenerCuenta','obtenerPosiciones','fondear','retirar','enviarOrden']) {
    assert.throws(() => adaptador[metodo](), /desactivada/i);
  }
  assert.equal(adaptador.estado, 'desactivado');
});

test('contrato no contiene proveedor comercial ni credenciales reales', () => {
  const texto = JSON.stringify(crearContratoProveedorInversion({ id:'sandbox-generico' }));
  assert.doesNotMatch(texto, /Kuspit|DriveWealth|Alpaca/i);
  assert.doesNotMatch(texto, /client_secret|access_token|api_key/i);
});
