// Precarga de pruebas: adelanta el reloj de Node a FAKE_NOW sin tocar el sistema.
if (process.env.FAKE_NOW) {
  const Real = Date;
  const offset = new Real(process.env.FAKE_NOW).getTime() - Real.now();
  class Fake extends Real {
    constructor(...a) { if (a.length === 0) super(Real.now() + offset); else super(...a); }
    static now() { return Real.now() + offset; }
  }
  globalThis.Date = Fake;
}
