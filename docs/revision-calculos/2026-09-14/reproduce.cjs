// Diagnóstico de la base auditada. Ejecuta callbacks existentes; no modifica la aplicación.
const fs = require('fs');
const vm = require('vm');
const root = process.argv[2] || '.';
const app = fs.readFileSync(root + '/src/App.jsx', 'utf8');
const common = app.slice(app.indexOf('const SALARIO_MINIMO_GENERAL'), app.indexOf('function CalcFiniquito'));
function run(component, inputs) {
  const part = app.slice(app.indexOf('function ' + component + '('));
  const marker = 'const calcular = () => {';
  const body = part.slice(part.indexOf(marker) + marker.length, part.indexOf('\n  };'));
  const ctx = {...inputs, output:null, setResult:r=>ctx.output=r};
  vm.runInNewContext(common + '\n(function(){' + body + '\n})();', ctx);
  return ctx.output;
}
const r=[];
for(const salary of ['25000','10000','11000','11492.66','11492.67','9451.20','100000','7168.515']) {
  const isr=run('CalcISR',{salarioMensual:salary});
  const net=run('CalcBrutoNeto',{salarioMensual:salary});
  r.push({case:'ISR y neto',salary,isr:isr.isrNeto,subsidio:isr.subsidio,netISR:net.isrMensual,imss:net.imssObrero});
}
for(const date of ['','2026-01-01','2026-07-01','2026-12-31','2027-01-01']) {
  const a=run('CalcAguinaldo',{salarioMensual:'18000',diasAguinaldo:'15',fechaIngreso:date});
  r.push({case:'aguinaldo',date,days:a.diasProporcionales,amount:a.aguinaldoBruto});
}
for(const days of ['0','-15','15.5']) {
  const a=run('CalcAguinaldo',{salarioMensual:'18000',diasAguinaldo:days,fechaIngreso:''});
  r.push({case:'dias prestacion',days,amount:a.aguinaldoBruto});
}
for(const [entry,departure] of [['2026-07-01','2026-09-14'],['2011-09-18','2026-09-14'],['2025-09-14','2026-09-14'],['2026-09-14','2026-09-14']]) {
  const inputs={salarioMensual:'18000',diasTrabajados:'0',vacPendientes:'0',fechaIngreso:entry,fechaSalida:departure};
  const f=run('CalcFiniquito',inputs); const l=run('CalcLiquidacion',inputs);
  r.push({case:'separacion',entry,departure,finiquito:f,liquidacion:l});
}
const data=JSON.parse(fs.readFileSync(root + '/src/data/regulatory-data.json','utf8'));
const states=Object.entries(data.calculators).map(([id,d])=>({id,declared:d.verificationStatus,visible:d.verificationStatus==='verified'&&d.sources.some(s=>s.institution)&&d.legalBasis.length&&d.verifiedAt?'verified':d.verificationStatus==='blocked'?'blocked':'needs-review',sourceURLs:d.sources.filter(s=>s.url).length}));
console.log(JSON.stringify({timezone:process.env.TZ,sourceCommit:'64cdc90b783857cc46b2909d22974a433ae7fc05',results:r,states},null,2));
