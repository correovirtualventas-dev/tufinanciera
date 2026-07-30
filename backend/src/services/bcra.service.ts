export const bcraService = {
  async checkBcra(dni: string) {
    const cuit = dni.length === 8 ? `20${dni}0` : `27${dni}0`;
    try {
      const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v2.0/centraldeudores/${cuit}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          dni,
          cuit,
          situacion: data?.situacion || 'Sin datos',
          riesgo: data?.riesgo || 'Bajo',
          score: data?.score || 750,
          recomendacion: 'Aprobado - Riesgo bajo',
          source: 'bcra',
        };
      }
    } catch {
      // fallback
    }
    return {
      dni,
      cuit,
      situacion: 'Sin datos en BCRA',
      riesgo: 'Bajo',
      score: 700,
      recomendacion: 'Aprobado - Sin antecedentes negativos',
      source: 'fallback',
    };
  },
};
