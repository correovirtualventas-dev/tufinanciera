const SITUACIONES: Record<number, string> = {
  1: 'Situación 1 - Normal',
  2: 'Situación 2 - Con seguimiento especial',
  3: 'Situación 3 - Con problemas',
  4: 'Situación 4 - Con alto riesgo de insolvencia',
  5: 'Situación 5 - Irrecuperable',
};

function buildCuitCandidates(dni: string): string[] {
  const d = dni.trim();
  if (/^\d{11}$/.test(d)) return [d];
  if (/^\d{8}$/.test(d)) return [`20${d}0`, `23${d}0`, `24${d}0`, `27${d}0`];
  return [];
}

async function fetchCuit(cuit: string): Promise<any | null> {
  const response = await fetch(`https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuit}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (response.ok) return { cuit, data: await response.json() };
  return null;
}

export const bcraService = {
  async checkBcra(dni: string) {
    const candidates = buildCuitCandidates(dni);
    if (candidates.length === 0) {
      return {
        dni,
        cuit: '',
        denominacion: '',
        situacion: 'Identificación inválida',
        riesgo: 'Bajo',
        score: 700,
        totalDeuda: 0,
        entidades: [],
        recomendacion: 'Ingresá un DNI (8 dígitos) o CUIT (11 dígitos) válido',
        source: 'invalid',
      };
    }
    for (const cuit of candidates) {
      try {
        const found = await fetchCuit(cuit);
        if (!found) continue;
        const results = found.data?.results;
        if (!results) continue;
        const periodos = Array.isArray(results.periodos) ? results.periodos : [];
        const ultimoPeriodo = periodos[periodos.length - 1] || periodos[0];
        const todas = Array.isArray(ultimoPeriodo?.entidades) ? ultimoPeriodo.entidades : [];
        const entidades = todas
          .filter((e: any) => Number(e.monto) > 0)
          .map((e: any) => ({
            entidad: e.entidad || 'Sin nombre',
            situacion: SITUACIONES[Number(e.situacion)] || `Situación ${e.situacion}`,
            monto: Number(e.monto) || 0,
            diasAtraso: Number(e.diasAtrasoPago) || 0,
            refinanciaciones: !!e.refinanciaciones,
          }));
        const peorSituacion = Math.max(0, ...todas.map((e: any) => Number(e.situacion) || 0));
        const totalDeuda = entidades.reduce((acc: number, e: any) => acc + e.monto, 0);
        return {
          dni,
          cuit: found.cuit,
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
      } catch {
        continue;
      }
    }
    return {
      dni,
      cuit: candidates[0],
      denominacion: '',
      situacion: 'Sin datos en BCRA',
      riesgo: 'Bajo',
      score: 700,
      totalDeuda: 0,
      entidades: [],
      recomendacion: 'No se encontraron datos para esta identificación en la Central de Deudores',
      source: 'fallback',
    };
  },
};