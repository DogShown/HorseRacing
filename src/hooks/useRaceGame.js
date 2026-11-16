import { useEffect, useRef, useState } from "react";
import { createInitialHorses } from "../data/horses.js";
import {
  advanceHorses,
  findFinishers,
  parseSavedScore,
} from "../game/raceEngine.js";

const SCORE_STORAGE_KEY = "horse-dash-score";
const TICK_INTERVAL = 90;
const FINISH_DELAY = 350;
const POINTS_PER_WIN = 100;

function readSavedScore() {
  try {
    return parseSavedScore(window.localStorage.getItem(SCORE_STORAGE_KEY));
  } catch {
    return 0;
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
  const [score, setScore] = useState(readSavedScore);
  const [raceMessage, setRaceMessage] = useState(
    "Escolha seu cavalo e prepare-se para a corrida."
  );

  const raceHorsesRef = useRef(null);
  if (raceHorsesRef.current === null) {
    raceHorsesRef.current = createInitialHorses();
  }
  const raceIntervalRef = useRef(null);
  const finishTimeoutRef = useRef(null);
  const raceIdRef = useRef(0);
  const raceActiveRef = useRef(false);

  function clearRaceTimers() {
    clearTimer(raceIntervalRef, window.clearInterval);
    clearTimer(finishTimeoutRef, window.clearTimeout);
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(SCORE_STORAGE_KEY, String(score));
    } catch {
      // A partida continua jogável se o navegador bloquear o armazenamento.
    }
  }, [score]);

  useEffect(() => {
    if (!isRacing) return undefined;

    const currentRaceId = raceIdRef.current;

    raceIntervalRef.current = window.setInterval(() => {
      if (!raceActiveRef.current || raceIdRef.current !== currentRaceId) return;

      const previousHorses = raceHorsesRef.current;
      const advancedHorses = advanceHorses(previousHorses);
      const finishers = findFinishers(previousHorses, advancedHorses);

      raceHorsesRef.current = advancedHorses;
      setHorses(advancedHorses);

      if (finishers.length === 0) return;

      clearTimer(raceIntervalRef, window.clearInterval);

      finishTimeoutRef.current = window.setTimeout(() => {
        // Um callback antigo nunca pode concluir ou pontuar uma nova corrida.
        if (!raceActiveRef.current || raceIdRef.current !== currentRaceId) return;

        raceActiveRef.current = false;
        setWinners(finishers);
        setIsRacing(false);

        if (finishers.length > 1) {
          setRaceMessage(
            `Empate entre ${finishers.map((horse) => horse.name).join(" e ")}. Nenhum ponto foi adicionado.`
          );
          return;
        }

        const playerWon = finishers[0].id === selectedHorse;

        if (playerWon) {
          setRaceMessage(
            `Parabéns! ${finishers[0].name} venceu e você ganhou ${POINTS_PER_WIN} pontos.`
          );
          setScore((currentScore) => {
            const safeScore = parseSavedScore(String(currentScore));
            return safeScore <= Number.MAX_SAFE_INTEGER - POINTS_PER_WIN
              ? safeScore + POINTS_PER_WIN
              : safeScore;
          });
        } else {
          setRaceMessage(
            `${finishers[0].name} venceu. Que tal tentar outra corrida?`
          );
        }
      }, FINISH_DELAY);
    }, TICK_INTERVAL);

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

  function selectHorse(horseId) {
    if (raceActiveRef.current) return;
    setSelectedHorse(horseId);
  }

  function startRace() {
    if (raceActiveRef.current) return;

    clearRaceTimers();
    raceIdRef.current += 1;
    raceActiveRef.current = true;

    const freshHorses = createInitialHorses();
    raceHorsesRef.current = freshHorses;
    setHorses(freshHorses);
    setWinners([]);
    setRaceMessage("A corrida começou! Torça pelo seu competidor.");
    setIsRacing(true);
  }

  function resetGame() {
    // Invalida imediatamente o intervalo e qualquer timeout ainda pendente.
    raceActiveRef.current = false;
    raceIdRef.current += 1;
    clearRaceTimers();

    const freshHorses = createInitialHorses();
    raceHorsesRef.current = freshHorses;
    setHorses(freshHorses);
    setWinners([]);
    setIsRacing(false);
    setRaceMessage("Nova corrida! Escolha seu cavalo.");
  }

  return {
    selectedHorse,
    selectHorse,
    horses,
    isRacing,
    winners,
    score,
    raceMessage,
    startRace,
    resetGame,
  };
}
