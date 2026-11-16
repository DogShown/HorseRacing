export const FINISH_TIE_EPSILON = 1e-9;

export function parseSavedScore(rawValue) {
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") {
    return 0;
  }

  const parsed = Number(rawValue);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function advanceHorses(horses, random = Math.random) {
  return horses.map((horse) => {
    const sample = random();
    const normalizedSample = Number.isFinite(sample)
      ? Math.min(1, Math.max(0, sample))
      : 0.5;

    // Todos recebem a mesma velocidade-base e a mesma faixa de variação.
    // A ordem dos cavalos não altera seus parâmetros nem cria bônus fixos.
    const speed = 1.5 + normalizedSample * 1.8;

    return {
      ...horse,
      progress: Math.min(100, horse.progress + speed),
    };
  });
}

export function findFinishers(previousHorses, advancedHorses) {
  const crossingCandidates = advancedHorses
    .map((horse, index) => {
      const previousProgress = previousHorses[index].progress;
      const distanceCovered = horse.progress - previousProgress;

      if (previousProgress >= 100 || horse.progress < 100 || distanceCovered <= 0) {
        return null;
      }

      return {
        horse,
        crossingTime: (100 - previousProgress) / distanceCovered,
      };
    })
    .filter(Boolean);

  if (crossingCandidates.length === 0) return [];

  const firstCrossingTime = Math.min(
    ...crossingCandidates.map((candidate) => candidate.crossingTime)
  );

  return crossingCandidates
    .filter(
      (candidate) =>
        Math.abs(candidate.crossingTime - firstCrossingTime) <= FINISH_TIE_EPSILON
    )
    .map((candidate) => candidate.horse);
}
