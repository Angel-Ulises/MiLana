export const REGIMENES_LABORALES_2026 = Object.freeze({
  lft: {
    value: 'lft',
    label: 'Relación regida por la LFT (empresa privada o ente público bajo LFT)',
  },
  lftseFederal: {
    value: 'lftse-federal',
    label: 'Dependencia federal sujeta a LFTSE (base/operativo)',
  },
  publicoLocal: {
    value: 'publico-local',
    label: 'Gobierno estatal o municipal / estatuto local',
  },
  publicoEspecial: {
    value: 'publico-especial',
    label: 'Confianza, mando, honorarios u otro régimen público',
  },
});

export function esRegimenLFT(regimen) {
  return regimen === REGIMENES_LABORALES_2026.lft.value;
}

export function configAguinaldo2026(regimen) {
  if (regimen === REGIMENES_LABORALES_2026.lft.value) {
    return {
      calculable: true,
      diasMinimos: 15,
      diasSugeridos: 15,
      baseLabel: 'Salario mensual fijo (MXN)',
      baseHelp: 'No incluye incidencias ni cambios de salario.',
      alcance: 'LFT',
    };
  }
  if (regimen === REGIMENES_LABORALES_2026.lftseFederal.value) {
    return {
      calculable: true,
      diasMinimos: 40,
      diasSugeridos: 40,
      baseLabel: 'Base mensual usada para tu aguinaldo (MXN)',
      baseHelp: 'Captura la base que tu nombramiento y nómina usan para aguinaldo; puede no coincidir con tus percepciones totales.',
      alcance: 'LFTSE federal',
    };
  }
  return {
    calculable: false,
    diasMinimos: null,
    diasSugeridos: null,
    baseLabel: 'Base mensual para aguinaldo (MXN)',
    baseHelp: '',
    alcance: 'régimen público específico',
  };
}

export function validarAguinaldoPorRegimen2026({ regimen, dias }) {
  const config = configAguinaldo2026(regimen);
  if (!config.calculable) {
    throw new Error('Este régimen necesita la ley, estatuto o nombramiento específico; MiLana no debe asumir una prestación universal.');
  }
  const numero = Number(dias);
  if (!Number.isFinite(numero) || numero < config.diasMinimos) {
    throw new Error(`Para ${config.alcance}, captura al menos ${config.diasMinimos} días de aguinaldo.`);
  }
  return config;
}

export function vacacionesFederalesLFTSE2026(mesesServicio) {
  const texto = String(mesesServicio ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(texto)) throw new Error('Antigüedad: captura meses de servicio válidos.');
  const meses = Number(texto);
  if (!Number.isFinite(meses) || meses < 0 || meses > 1200) throw new Error('Antigüedad: revisa los meses capturados.');
  const elegible = meses > 6;
  return {
    mesesServicio: meses,
    elegible,
    diasAnuales: elegible ? 20 : 0,
    periodos: elegible ? 2 : 0,
    diasPorPeriodo: elegible ? 10 : 0,
  };
}

export function permiteCalculoIMSS(instituto) {
  return instituto === 'imss';
}
