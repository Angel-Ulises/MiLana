import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const png = (ruta) => { const d = readFileSync(ruta); assert.equal(d.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${ruta} no es PNG`); return [d.readUInt32BE(16), d.readUInt32BE(20)]; };

test('H-13: el manifiesto y los íconos existen, con los tamaños que declaran', () => {
  const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  assert.equal(m.short_name, 'MiLana'); assert.equal(m.start_url, '/'); assert.equal(m.display, 'standalone'); assert.equal(m.lang, 'es-MX');
  assert.ok(m.icons.length >= 2);
  for (const i of m.icons) { assert.ok(existsSync(`public${i.src}`), i.src); const [w, h] = png(`public${i.src}`); assert.equal(`${w}x${h}`, i.sizes, i.src); }
  assert.deepEqual(png('public/apple-touch-icon.png'), [180, 180]);
  const h = readFileSync('public/_headers', 'utf8');
  assert.match(h, /\/manifest\.webmanifest\s+Content-Type: application\/manifest\+json/);
});

test('H-13: el paso de build agrega ícono, manifiesto y color solo donde faltan', () => {
  const dir = mkdtempSync(join(tmpdir(), 'icono-'));
  try {
    mkdirSync(join(dir, 'guia'), { recursive: true });
    writeFileSync(join(dir, 'guia', 'index.html'), '<!doctype html><html><head><title>g</title></head><body>x</body></html>');
    writeFileSync(join(dir, 'index.html'), '<!doctype html><html><head><link rel="icon" href="/favicon.svg"><meta name="theme-color" content="#fff"></head><body>y</body></html>');
    const corre = () => spawnSync(process.execPath, ['scripts/inyectar-icono-app.mjs', dir], { encoding: 'utf8' });
    assert.equal(corre().status, 0);
    const guia = readFileSync(join(dir, 'guia', 'index.html'), 'utf8');
    for (const rel of ['rel="icon"', 'rel="apple-touch-icon"', 'rel="manifest"', 'name="theme-color"', 'src="/impresion.js"']) assert.ok(guia.includes(rel), rel);
    const inicio = readFileSync(join(dir, 'index.html'), 'utf8');
    assert.equal((inicio.match(/rel="icon"/g) || []).length, 1, 'no repite el ícono que ya tenía');
    assert.equal((inicio.match(/theme-color/g) || []).length, 1, 'no repite el color que ya tenía');
    assert.ok(inicio.includes('rel="manifest"'));
    assert.equal((inicio.match(/impresion\.js/g) || []).length, 1);
    const antes = readFileSync(join(dir, 'guia', 'index.html'), 'utf8');
    corre();
    assert.equal(readFileSync(join(dir, 'guia', 'index.html'), 'utf8'), antes, 'una segunda corrida no cambia nada');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('H-13: las hojas de impresión ocultan menús, pie y botones y dejan el resultado', () => {
  const calc = readFileSync('src/resultado-claro.css', 'utf8');
  const guias = readFileSync('public/static-2026.css', 'utf8');
  const bloque = (css) => css.slice(css.indexOf('@media print'));
  for (const sel of ['.ml-orbita-shell', '.site-header', '.site-footer', '.rc-whatsapp', '.rc-escuchar', '.rc-siguiente', '.cc-volver']) assert.ok(bloque(calc).includes(sel), sel);
  const ocultos = bloque(calc).match(/([^{}]*)\{display:none!important\}/)[1];
  const selectores = ocultos.split(',').map((x) => x.trim());
  for (const protegido of ['.rc-monto', '[data-resultado-claro]', '.calculator-main', '.rc-detalle', '.cc-form', '[data-calc-directo]']) assert.ok(!selectores.includes(protegido), `no debe ocultarse ${protegido}`);
  assert.ok(selectores.includes('.calculator-main>p>a[href="/calculadoras"]'), 'el enlace de regreso no se imprime aunque no tenga clase');
  for (const sel of ['header.top', 'footer.footer', '.guide-direct', '.card-tools']) assert.ok(bloque(guias).includes(sel), sel);
  assert.match(calc, /Calculado con MiLana · www\.milanaaqui\.mx/);
});

test('H-13: al imprimir se abre «Ver cómo se calculó» y después queda como estaba', () => {
  const mk = (clase, abierto = false) => ({ clase, open: abierto });
  const guia = mk('guide-more'); const explicacion = mk('rc-detalle'); const reclamo = mk('rc-detalle rc-reclamo'); const pagaron = mk('rc-detalle rc-pagaron'); const yaAbierto = mk('rc-detalle', true);
  const escuchas = {};
  const window = { addEventListener: (n, f) => { escuchas[n] = f; } };
  const document = { querySelectorAll: (sel) => {
    assert.match(sel, /:not\(\.rc-reclamo\):not\(\.rc-pagaron\):not\(\[open\]\).*guide-more/);
    return [explicacion, reclamo, pagaron, yaAbierto, guia].filter((d) => !d.open && !/rc-reclamo|rc-pagaron/.test(d.clase));
  } };
  vm.runInNewContext(readFileSync('public/impresion.js', 'utf8'), { window, document });
  escuchas.beforeprint();
  assert.equal(explicacion.open, true); assert.equal(guia.open, true, 'las secciones plegadas de las guías también'); assert.equal(reclamo.open, false); assert.equal(pagaron.open, false);
  escuchas.afterprint();
  assert.equal(explicacion.open, false, 'vuelve a quedar cerrado'); assert.equal(guia.open, false); assert.equal(yaAbierto.open, true, 'lo que ya estaba abierto sigue abierto');
});

test('H-13: las páginas de React cargan el script de impresión', () => {
  assert.match(readFileSync('index.html', 'utf8'), /<script defer src="\/impresion\.js"><\/script>/);
  assert.ok(JSON.parse(readFileSync('package.json', 'utf8')).scripts.build.includes('inyectar-icono-app.mjs'));
});
