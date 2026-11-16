import { useEffect, useRef, useState } from "react";
import { createInitialHorses } from "../data/horses.js";

const SCORE_STORAGE_KEY = "horse-dash-score";
const TICK_INTERVAL = 90;
const FINISH_DELAY = 350;

function readSavedScore() {
  try {
    const value = Number(window.localStorage.getItem(SCORE_STORAGE_KEY));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function useRaceGame() {
  const [selectedHorse, setSelectedHorse] = useState("comet");
  const [horses, setHorses] = useState(createInitialHorses);
  const raceHorsesRef = useRef(createInitialHorses());
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(readSavedScore);
  const [raceMessage, setRaceMessage] = useState(
    "Escolha seu cavalo e prepare-se para a corrida."
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(SCORE_STORAGE_KEY, String(score));
    } catch {
      // O jogo continua funcionando mesmo se o navegador bloquear o armazenamento.
    }
  }, [score]);

  useEffect(() => {
    if (!isRacing) return undefined;

    let finishTimeout;

    const raceTimer = window.setInterval(() => {
      const previousHorses = raceHorsesRef.current;
      const advances = previousHorses.map((horse) => ({
        ...horse,
        progress: horse.progress + 1.1 + Math.random() * 2.2,
      }));

      // Se mais de um cavalo cruzar no mesmo ciclo, vence quem cruzaria primeiro
      // dentro desse intervalo, em vez de quem aparece primeiro no array.
      const finishers = advances
        .map((horse, index) => ({
          horse,
          crossingTime: horse.progress >= 100
            ? (100 - previousHorses[index].progress) /
              (horse.progress - previousHorses[index].progress)
            : Number.POSITIVE_INFINITY,
        }))
        .filter((entry) => Number.isFinite(entry.crossingTime))
        .sort((a, b) => a.crossingTime - b.crossingTime);

      const updatedHorses = advances.map((horse) => ({
        ...horse,
        progress: Math.min(100, horse.progress),
      }));

      raceHorsesRef.current = updatedHorses;
      setHorses(updatedHorses);

      if (finishers.length > 0) {
        const finishedHorse = finishers[0].horse;
        window.clearInterval(raceTimer);

        finishTimeout = window.setTimeout(() => {
          setWinner(finishedHorse);
          setIsRacing(false);
          const playerWon = finishedHorse.id === selectedHorse;
          setRaceMessage(
            playerWon
              ? "Parabéns! Seu cavalo venceu e você ganhou 100 pontos."
              : "A corrida terminou. Que tal tentar outra vez?"
          );

          if (playerWon) {
            setScore((currentScore) => currentScore + 100);
          }
        }, FINISH_DELAY);
      }
    }, TICK_INTERVAL);

    return () => {
      window.clearInterval(raceTimer);
      window.clearTimeout(finishTimeout);
    };
  }, [isRacing, selectedHorse]);

  function selectHorse(horseId) {
    if (isRacing) return;
    setSelectedHorse(horseId);
  }

  function startRace() {
    if (isRacing) return;

    const freshHorses = createInitialHorses();
    raceHorsesRef.current = freshHorses;
    setHorses(freshHorses);
    setWinner(null);
    setRaceMessage("A corrida começou! Torça pelo seu competidor.");
    setIsRacing(true);
  }

  function resetGame() {
    setIsRacing(false);
    setWinner(null);
    const freshHorses = createInitialHorses();
    raceHorsesRef.current = freshHorses;
    setHorses(freshHorses);
    setRaceMessage("Nova corrida! Escolha seu cavalo.");
  }

  return {
    selectedHorse,
    selectHorse,
    horses,
    isRacing,
    winner,
    score,
    raceMessage,
    startRace,
    resetGame,
  };
}
