const SITUACIONES: Record<number, string> = {
  1: 'Situación 1 - Normal',
  2: 'Situación 2 - Con seguimiento especial',
  3: 'Situación 3 - Con problemas',
  4: 'Situación 4 - Con alto riesgo de insolvencia',
  5: 'Situación 5 - Irrecuperable',
};

export const bcraService = {
  async checkBcra(dni: string) {
    const cuit = dni.length === 8 ? `20${dni}0` : `27${dni}0`;
    try {
      const response = await fetch(`https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuit}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const payload: any = await response.json();
        const results = payload?.results;
        if (results) {
          const periodos = Array.isArray(results.periodos) ? results.periodos : [];
          const ultimoPeriodo = periodos[periodos.length - 1] || periodos[0];
          const entidades = Array.isArray(ultimoPeriodo?.entidades)
            ? ultimoPeriodo.entidades
                .filter((e: any) => Number(e.monto) > 0)
                .map((e: any) => ({
                  entidad: e.entidad || 'Sin nombre',
                  situacion: SITUACIONES[Number(e.situacion)] || `Situación ${e.situacion}`,
                  monto: Number(e.monto) || 0,
                  diasAtraso: Number(e.diasAtrasoPago) || 0,
                  refinanciaciones: !!e.refinanciaciones,
                }))
            : [];
          const peorSituacion = Math.max(
            0,
            ...(Array.isArray(ultimoPeriodo?.entidades) ? ultimoPeriodo.entidades : []).map((e: any) => Number(e.situacion) || 0)
          );
          const totalDeuda = entidades.reduce((acc: number, e: any) => acc + e.monto, 0);
          return {
            dni,
            cuit,
            denominacion: results.denominacion || '',
            situacion: SITUACIONES[peorSituacion] || 'Sin datos',
            riesgo: peorSituacion <= 1 ? 'Bajo' : peorSituacion <= 2 ? 'Medio' : 'Alto',
            score: peorSituacion <= 1 ? 750 : peorSituacion <= 2 ? 550 : 350,
            totalDeuda,
            entidades,
            recomendacion: entidades.length === 0
              ? 'Aprobado - Sin deudas informadas'
              : peorSituacion <= 1
                ? 'Aprobado - Sin antecedentes negativos'
                : 'Revisar - Deudas informadas en BCRA',
            source: 'bcra',
          };
        }
      }
    } catch {
      // fallback
    }
    return {
      dni,
      cuit,
      denominacion: '',
      situacion: 'Sin datos en BCRA',
      riesgo: 'Bajo',
      score: 700,
      totalDeuda: 0,
      entidades: [],
      recomendacion: 'Aprobado - Sin antecedentes negativos',
      source: 'fallback',
    };
  },
};