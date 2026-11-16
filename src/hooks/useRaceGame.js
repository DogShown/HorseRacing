import { useEffect, useRef, useState } from "react";
import { createInitialHorses, saveHorseProfile } from "../data/horses.js";
import {
  FINISH_DELAY_MS,
  POINTS_PER_WIN,
  RACE_STATES,
  RACE_TICK_INTERVAL_MS,
  STORAGE_KEYS,
} from "../game/constants.js";
import {
  advanceHorses,
  buildClassification,
  findFinishGroups,
  parseSavedScore,
} from "../game/raceEngine.js";

function readStoredNumber(key) {
  try {
    return parseSavedScore(window.localStorage.getItem(key));
  } catch {
    return 0;
  }
}

function persistNumber(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
    return true;
  } catch {
    // O jogo continua funcionando mesmo quando o armazenamento está indisponível.
    return false;
  }
}

function clearTimer(ref, clearFunction) {
  if (ref.current !== null) {
    clearFunction(ref.current);
    ref.current = null;
  }
}

export function useRaceGame() {
  const [selectedHorse, setSelectedHorse] = useState("comet");
  const [horses, setHorses] = useState(createInitialHorses);
  const [isRacing, setIsRacing] = useState(false);
  const [winners, setWinners] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [score, setScore] = useState(() => readStoredNumber(STORAGE_KEYS.SCORE));
  const [bestScore, setBestScore] = useState(() => readStoredNumber(STORAGE_KEYS.BEST_SCORE));
  const [racesPlayed, setRacesPlayed] = useState(() => readStoredNumber(STORAGE_KEYS.RACES_PLAYED));
  const [wins, setWins] = useState(() => readStoredNumber(STORAGE_KEYS.WINS));
  const [raceMessage, setRaceMessage] = useState(
    "Escolha seu cavalo e prepare-se para a corrida."
  );
  const [storageWarning, setStorageWarning] = useState(false);

  const raceHorsesRef = useRef(null);
  if (raceHorsesRef.current === null) {
    raceHorsesRef.current = createInitialHorses();
  }
  const finishGroupsRef = useRef([]);
  const raceIntervalRef = useRef(null);
  const finishTimeoutRef = useRef(null);
  const raceIdRef = useRef(0);
  const raceActiveRef = useRef(false);

  function clearRaceTimers() {
    clearTimer(raceIntervalRef, window.clearInterval);
    clearTimer(finishTimeoutRef, window.clearTimeout);
  }

  useEffect(() => {
    if (!persistNumber(STORAGE_KEYS.SCORE, score)) setStorageWarning(true);
  }, [score]);
  useEffect(() => {
    if (!persistNumber(STORAGE_KEYS.BEST_SCORE, bestScore)) setStorageWarning(true);
  }, [bestScore]);
  useEffect(() => {
    if (!persistNumber(STORAGE_KEYS.RACES_PLAYED, racesPlayed)) setStorageWarning(true);
  }, [racesPlayed]);
  useEffect(() => {
    if (!persistNumber(STORAGE_KEYS.WINS, wins)) setStorageWarning(true);
  }, [wins]);

  useEffect(() => {
    if (!isRacing) return undefined;

    const currentRaceId = raceIdRef.current;

    raceIntervalRef.current = window.setInterval(() => {
      if (!raceActiveRef.current || raceIdRef.current !== currentRaceId) return;

      const previousHorses = raceHorsesRef.current;
      const advancedHorses = advanceHorses(previousHorses);
      const finishGroups = findFinishGroups(previousHorses, advancedHorses);

      raceHorsesRef.current = advancedHorses;
      setHorses(advancedHorses);

      if (finishGroups.length > 0) {
        finishGroupsRef.current = [...finishGroupsRef.current, ...finishGroups];
      }

      const finishedCount = finishGroupsRef.current.reduce(
        (total, group) => total + group.length,
        0
      );

      if (finishedCount < advancedHorses.length) return;

      clearTimer(raceIntervalRef, window.clearInterval);
      finishTimeoutRef.current = window.setTimeout(() => {
        if (!raceActiveRef.current || raceIdRef.current !== currentRaceId) return;

        raceActiveRef.current = false;
        const finalRanking = buildClassification(finishGroupsRef.current);
        const firstPlaceGroup = finishGroupsRef.current[0] ?? [];
        const playerWon =
          firstPlaceGroup.length === 1 && firstPlaceGroup[0].id === selectedHorse;

        setRanking(finalRanking);
        setWinners(firstPlaceGroup);
        setIsRacing(false);
        setRacesPlayed((total) => total + 1);

        if (playerWon) {
          setRaceMessage(
            `Parabéns! ${firstPlaceGroup[0].name} venceu e você ganhou ${POINTS_PER_WIN} pontos.`
          );
          setWins((total) => total + 1);
          setScore((currentScore) =>
            currentScore <= Number.MAX_SAFE_INTEGER - POINTS_PER_WIN
              ? currentScore + POINTS_PER_WIN
              : currentScore
          );
          const nextScore = score <= Number.MAX_SAFE_INTEGER - POINTS_PER_WIN
            ? score + POINTS_PER_WIN
            : score;
          setBestScore((currentBest) => Math.max(currentBest, nextScore));
        } else if (firstPlaceGroup.length > 1) {
          setRaceMessage(
            `Empate em primeiro lugar entre ${firstPlaceGroup.map((horse) => horse.name).join(" e ")}. Nenhum ponto foi adicionado.`
          );
        } else {
          setRaceMessage(
            `${firstPlaceGroup[0]?.name ?? "Outro competidor"} venceu. Que tal tentar outra corrida?`
          );
        }
      }, FINISH_DELAY_MS);
    }, RACE_TICK_INTERVAL_MS);

    return () => {
      clearTimer(raceIntervalRef, window.clearInterval);
      clearTimer(finishTimeoutRef, window.clearTimeout);
    };
  }, [isRacing, selectedHorse]);

  useEffect(() => {
    return () => {
      raceActiveRef.current = false;
      raceIdRef.current += 1;
      clearRaceTimers();
    };
  }, []);

  function updateHorseProfile(horseId, field, value) {
    if (raceActiveRef.current || !["name", "breed", "participant"].includes(field)) return;
    const limits = { name: 22, breed: 32, participant: 22 };
    const cleanValue = String(value).slice(0, limits[field]);
    saveHorseProfile(horseId, { [field]: cleanValue });
    const updated = raceHorsesRef.current.map((horse) =>
      horse.id === horseId ? { ...horse, [field]: cleanValue } : horse
    );
    raceHorsesRef.current = updated;
    setHorses(updated);
  }

  function selectHorse(horseId) {
    if (raceActiveRef.current) return;
    setSelectedHorse(horseId);
  }

  function startRace() {
    if (raceActiveRef.current) return;

    clearRaceTimers();
    raceIdRef.current += 1;
    raceActiveRef.current = true;
    finishGroupsRef.current = [];

    const freshHorses = createInitialHorses();
    raceHorsesRef.current = freshHorses;
    setHorses(freshHorses);
    setWinners([]);
    setRanking([]);
    setRaceMessage("A corrida começou! Torça pelo seu competidor.");
    setIsRacing(true);
  }

  function resetGame() {
    raceActiveRef.current = false;
    raceIdRef.current += 1;
    clearRaceTimers();
    finishGroupsRef.current = [];

    const freshHorses = createInitialHorses();
    raceHorsesRef.current = freshHorses;
    setHorses(freshHorses);
    setWinners([]);
    setRanking([]);
    setIsRacing(false);
    setRaceMessage("Nova corrida! Escolha seu cavalo.");
  }

  return {
    selectedHorse,
    selectHorse,
    horses,
    isRacing,
    raceState: isRacing ? RACE_STATES.RUNNING : ranking.length ? RACE_STATES.FINISHED : RACE_STATES.READY,
    winners,
    ranking,
    score,
    bestScore,
    racesPlayed,
    wins,
    storageWarning,
    raceMessage,
    startRace,
    resetGame,
  };
}
