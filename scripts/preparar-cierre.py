from pathlib import Path
p = Path('scripts/cierre-calculadoras.mjs')
s = p.read_text(encoding='utf-8')
repls = {
    "<ResultLine label={`Salario pendiente (${diasPendientes || 0} días)`}": "<ResultLine label={'Salario pendiente (' + (diasPendientes || 0) + ' días)'}",
    "<ResultLine label={`Aguinaldo proporcional (${resultado.diasAguinaldo} días del año)`}": "<ResultLine label={'Aguinaldo proporcional (' + resultado.diasAguinaldo + ' días del año)'}",
    "<ResultLine label={`Vacaciones proporcionales (${resultado.vacacionesProporcionalesDias.toFixed(2)} días)`}": "<ResultLine label={'Vacaciones proporcionales (' + resultado.vacacionesProporcionalesDias.toFixed(2) + ' días)'}",
    "<ResultLine label={`Vacaciones pendientes (${resultado.vacacionesPendientesDias} días)`}": "<ResultLine label={'Vacaciones pendientes (' + resultado.vacacionesPendientesDias + ' días)'}",
    "<ResultLine label={`Prima vacacional (${resultado.primaPct}%)`}": "<ResultLine label={'Prima vacacional (' + resultado.primaPct + '%)'}",
    "<ResultLine label={`Indemnización de 3 meses (SDI ${fmt(resultado.salarioDiarioIntegrado)}/día)`}": "<ResultLine label={'Indemnización de 3 meses (SDI ' + fmt(resultado.salarioDiarioIntegrado) + '/día)'}",
    "value={`2026-${String(i+2).padStart(2,'0')}`}": "value={'2026-' + String(i+2).padStart(2,'0')}",
    "{s.reference && `(${s.reference})`}": "{s.reference && '(' + s.reference + ')'}",
    "<ResultLine label=\"ISR mensual estimado\" value={`− ${fmt(resultado.retenido)}`}": "<ResultLine label=\"ISR mensual estimado\" value={'− ' + fmt(resultado.retenido)}",
    "<ResultLine label=\"Cuota obrera IMSS\" value={`− ${fmt(resultado.cuotaObrera)}`}": "<ResultLine label=\"Cuota obrera IMSS\" value={'− ' + fmt(resultado.cuotaObrera)}",
}
for a,b in repls.items():
    if a not in s:
        raise SystemExit(f'No se encontró literal a corregir: {a}')
    s = s.replace(a,b)
p.write_text(s, encoding='utf-8')
print('Literales JSX internos corregidos para ejecutar el script de cierre.')
