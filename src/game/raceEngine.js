import {
  BASE_SPEED,
  FINISH_TIE_EPSILON,
  RACE_DISTANCE,
  SPEED_VARIATION,
} from "./constants.js";

export function parseSavedScore(rawValue) {
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") {
    return 0;
  }

  const parsed = Number(rawValue);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function advanceHorses(horses, random = Math.random) {
  return horses.map((horse) => {
    if (horse.progress >= RACE_DISTANCE) return horse;

    const sample = random();
    const normalizedSample = Number.isFinite(sample)
      ? Math.min(1, Math.max(0, sample))
      : 0.5;
    const speed = BASE_SPEED + normalizedSample * SPEED_VARIATION;

    return {
      ...horse,
      progress: horse.progress + speed,
    };
  });
}

export function findFinishGroups(previousHorses, advancedHorses) {
  const crossingCandidates = advancedHorses
    .map((horse, index) => {
      const previousProgress = previousHorses[index].progress;
      const distanceCovered = horse.progress - previousProgress;

      if (
        previousProgress >= RACE_DISTANCE ||
        horse.progress < RACE_DISTANCE ||
        distanceCovered <= 0
      ) {
        return null;
      }

      return {
        horse,
        crossingTime: (RACE_DISTANCE - previousProgress) / distanceCovered,
      };
    })
    .filter(Boolean)
    .sort((first, second) => first.crossingTime - second.crossingTime);

  const groups = [];

  for (const candidate of crossingCandidates) {
    const currentGroup = groups[groups.length - 1];

    if (
      !currentGroup ||
      Math.abs(candidate.crossingTime - currentGroup[0].crossingTime) > FINISH_TIE_EPSILON
    ) {
      groups.push([candidate]);
    } else {
      currentGroup.push(candidate);
    }
  }

  return groups.map((group) => group.map((candidate) => candidate.horse));
}

export function findFinishers(previousHorses, advancedHorses) {
  return findFinishGroups(previousHorses, advancedHorses)[0] ?? [];
}

export function buildClassification(finishGroups) {
  let position = 1;

  return finishGroups.flatMap((group) => {
    const rows = group.map((horse) => ({ horse, position }));
    position += group.length;
    return rows;
  });
}
