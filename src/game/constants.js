export const POINTS_PER_WIN = 100;
export const COMPETITOR_COUNT = 8;
export const RACE_DISTANCE = 100;
export const RACE_TICK_INTERVAL_MS = 90;
export const FINISH_DELAY_MS = 350;
export const BASE_SPEED = 1.5;
export const SPEED_VARIATION = 1.8;
export const FINISH_TIE_EPSILON = 1e-9;

export const RACE_STATES = Object.freeze({
  READY: "ready",
  RUNNING: "running",
  FINISHED: "finished",
});

export const STORAGE_KEYS = Object.freeze({
  SCORE: "horse-dash-score",
  BEST_SCORE: "horse-dash-best-score",
  RACES_PLAYED: "horse-dash-races-played",
  WINS: "horse-dash-wins",
  PARTICIPANT_SCORES: "horse-dash-participant-scores",
  HORSE_PROFILES: "horse-dash-horse-profiles",
});