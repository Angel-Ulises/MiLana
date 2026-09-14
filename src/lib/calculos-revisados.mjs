// Alcances y fuentes: docs/revision-calculos/2026-09-14, PR #7.
export const ISR_MENSUAL_2026 = [
  [0.01,844.59,0,1.92],[844.60,7168.51,16.22,6.40],
  [7168.52,12598.02,420.95,10.88],[12598.03,14644.64,1011.68,16],
  [14644.65,17533.64,1339.14,17.92],[17533.65,35362.83,1856.84,21.36],
  [35362.84,55736.68,5665.16,23.52],[55736.69,106410.50,10457.09,30],
  [106410.51,141880.66,25659.23,32],[141880.67,425641.99,37009.69,34],
  [425642,Infinity,133488.54,35]
].map(([li,ls,cf,tasa])=>({li,ls,cf,tasa}));

function money(value) {
  const text=String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text) || !Number.isFinite(Number(text)) || Number(text)<=0 || Number(text)>Number.MAX_SAFE_INTEGER/100)
    throw new Error('Captura un importe positivo con un máximo de dos decimales.');
  return Number(text);
}

export function calcularISR({ingreso, soloMinimo, periodo='2026-09', empleadorUnico=true}) {
  const bruto=money(ingreso);
  if (!/^2026-(0[2-9]|1[0-2])$/.test(periodo) || empleadorUnico!==true)
    throw new Error('Este modo cubre un mes completo de febrero a diciembre de 2026, con un solo empleador.');
  if (typeof soloMinimo!=='boolean') throw new Error('Indica si percibiste únicamente el salario mínimo general de tu zona.');
  const rango=ISR_MENSUAL_2026.find(r=>bruto>=r.li&&bruto<=r.ls);
  if (!rango) throw new Error('Revisa el importe capturado.');
  const causado=soloMinimo?0:(bruto-rango.li)*rango.tasa/100+rango.cf;
  const subsidio=soloMinimo?0:Math.min(causado,bruto<=11492.66?3566.22*0.1502:0);
  const retenido=Math.max(0,causado-subsidio);
  return {bruto,causado,subsidio,retenido,despuesISR:bruto-retenido,soloMinimo};
}

function fechaCivil(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('Captura una fecha válida.');
  const [y,m,d]=text.split('-').map(Number);
  const date=new Date(0); date.setUTCFullYear(y,m-1,d); date.setUTCHours(0,0,0,0);
  if (y<1900 || date.getUTCFullYear()!==y || date.getUTCMonth()!==m-1 || date.getUTCDate()!==d)
    throw new Error('Captura una fecha válida a partir de 1900.');
  return date.getTime();
}

export function calcularAguinaldo({salario,dias='15',ingreso='',anioCompleto=false}) {
  const sm=money(salario);
  const da=money(dias);
  if (da<15) throw new Error('La prestación debe ser de al menos 15 días.');
  const end=Date.UTC(2026,11,31),start=Date.UTC(2026,0,1);
  if (!ingreso && !anioCompleto) throw new Error('Captura tu fecha de ingreso o confirma el año completo.');
  const entry=ingreso?fechaCivil(ingreso):start;
  if (entry>end) throw new Error('La fecha de ingreso debe ser anterior al 1 de enero de 2027.');
  const diasPeriodo=Math.floor((end-Math.max(entry,start))/86400000)+1;
  const bruto=sm/30*da*diasPeriodo/365;
  if (!Number.isFinite(bruto)) throw new Error('Revisa los importes capturados.');
  return {salarioDiario:sm/30,diasPrestacion:da,diasPeriodo,bruto};
}
