import { useEffect, useRef, useState } from "react";

const HORSES = [
  { id: "comet", name: "Comet", number: "01", color: "#ffcb57", emoji: "🐎", style: "gold" },
  { id: "blaze", name: "Blaze", number: "02", color: "#ff7777", emoji: "🐎", style: "coral" },
  { id: "pixel", name: "Pixel", number: "03", color: "#65e6c4", emoji: "🐎", style: "mint" },
];

const INITIAL_HORSES = HORSES.map((horse) => ({ ...horse, progress: 0 }));

function Header({ bestScore }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Horse Dash, início">
        <span className="brand-mark">🏁</span>
        <span>HORSE <strong>DASH!</strong></span>
      </a>
      <div className="topbar-stats">
        <span className="status-pill"><span className="status-dot" /> ARCADE MODE</span>
        <span className="best-score">SCORE <strong>{bestScore}</strong></span>
      </div>
    </header>
  );
}

function HorseSelector({ selectedHorse, onSelect, disabled }) {
  return (
    <section className="selection-section" aria-labelledby="select-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CHOOSE YOUR RIDER</p>
          <h2 id="select-title">Pick your horse</h2>
        </div>
        <span className="step-label">01 / 02</span>
      </div>

      <div className="horse-options">
        {HORSES.map((horse) => {
          const isSelected = selectedHorse === horse.id;

          return (
            <button
              className={`horse-card ${isSelected ? "selected" : ""} ${horse.style}`}
              key={horse.id}
              type="button"
              onClick={() => onSelect(horse.id)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              <span className="horse-number">#{horse.number}</span>
              <span className="horse-avatar" aria-hidden="true">{horse.emoji}</span>
              <span className="horse-name">{horse.name}</span>
              <span className="horse-caption">{isSelected ? "YOUR PICK" : "SELECT HORSE"}</span>
              {isSelected && <span className="selected-check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RaceTrack({ horses, isRacing, winner }) {
  return (
    <section className="track-section" aria-labelledby="race-title">
      <div className="section-heading track-heading">
        <div>
          <p className="eyebrow">READY, SET, GO!</p>
          <h2 id="race-title">The race track</h2>
        </div>
        <span className={`race-status ${isRacing ? "live" : ""}`}>
          <span /> {isRacing ? "RACE IN PROGRESS" : winner ? "FINISHED" : "WAITING"}
        </span>
      </div>

      <div className={`race-track ${isRacing ? "racing" : ""}`}>
        <div className="track-skyline" aria-hidden="true">☁️　　☁️　　　　　☁️</div>
        <div className="track-start" aria-hidden="true">START</div>
        <div className="track-finish" aria-label="Linha de chegada">🏁</div>

        {horses.map((horse, index) => (
          <div className="lane" key={horse.id}>
            <span className="lane-number">0{index + 1}</span>
            <div className="lane-ground">
              <div
                className={`runner ${horse.style} ${isRacing ? "running" : ""} ${winner?.id === horse.id ? "winner-runner" : ""}`}
                style={{ left: `${horse.progress}%`, "--horse-color": horse.color }}
              >
                <span className="runner-sprite" aria-label={horse.name}>🐎</span>
                <span className="runner-name">{horse.name}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="track-grass" aria-hidden="true" />
      </div>
      <p className="track-hint">Acompanhe os competidores até a linha de chegada!</p>
    </section>
  );
}

function ResultPanel({ winner, selectedHorse, onPlayAgain }) {
  if (!winner) return null;

  const playerWon = winner.id === selectedHorse;

  return (
    <section className={`result-panel ${playerWon ? "result-win" : "result-again"}`} aria-live="polite">
      <span className="result-icon">{playerWon ? "🏆" : "🎮"}</span>
      <div className="result-copy">
        <p className="eyebrow">{playerWon ? "YOU DID IT!" : "NICE TRY!"}</p>
        <h2>{winner.name} crossed the finish line first!</h2>
        <p>{playerWon ? "Seu cavalo venceu! Você ganhou 100 pontos." : "Dessa vez não foi o seu cavalo. Tente novamente!"}</p>
      </div>
      <button className="play-again-button" type="button" onClick={onPlayAgain}>PLAY AGAIN ↗</button>
    </section>
  );
}

export default function App() {
  const [selectedHorse, setSelectedHorse] = useState("comet");
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const raceHorsesRef = useRef(INITIAL_HORSES);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(() => {
    const savedScore = Number(localStorage.getItem("horse-dash-score"));
    return Number.isFinite(savedScore) && savedScore >= 0 ? savedScore : 0;
  });
  const [raceMessage, setRaceMessage] = useState("Escolha seu cavalo e prepare-se para a corrida.");

  useEffect(() => {
    localStorage.setItem("horse-dash-score", String(score));
  }, [score]);

  useEffect(() => {
    if (!isRacing) return undefined;

    let finishTimeout;

    const raceTimer = window.setInterval(() => {
      const updatedHorses = raceHorsesRef.current.map((horse) => ({
        ...horse,
        progress: Math.min(100, horse.progress + 1.1 + Math.random() * 2.2),
      }));

      raceHorsesRef.current = updatedHorses;
      setHorses(updatedHorses);

      const finishedHorse = updatedHorses.find((horse) => horse.progress >= 100);

      if (finishedHorse) {
        window.clearInterval(raceTimer);
        finishTimeout = window.setTimeout(() => {
          setWinner(finishedHorse);
          setIsRacing(false);
          setRaceMessage(
            finishedHorse.id === selectedHorse
              ? "Parabéns! Seu competidor venceu!"
              : "A corrida terminou. Que tal tentar outra vez?"
          );
          if (finishedHorse.id === selectedHorse) {
            setScore((currentScore) => currentScore + 100);
          }
        }, 350);
      }
    }, 90);

    return () => {
      window.clearInterval(raceTimer);
      window.clearTimeout(finishTimeout);
    };
  }, [isRacing, selectedHorse]);

  function startRace() {
    if (isRacing) return;

    raceHorsesRef.current = INITIAL_HORSES;
    setHorses(INITIAL_HORSES);
    setWinner(null);
    setRaceMessage("Corrida em andamento. Vai, vai, vai!");
    setIsRacing(true);
  }

  function resetGame() {
    setIsRacing(false);
    setWinner(null);
    raceHorsesRef.current = INITIAL_HORSES;
    setHorses(INITIAL_HORSES);
    setRaceMessage("Nova corrida! Escolha seu cavalo.");
  }

  const bestScore = score;

  return (
    <main className="app-shell" id="home">
      <Header bestScore={bestScore} />

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">★ THE ULTIMATE HORSE RACE ★</span>
          <h1>READY.<br /><span>SET.</span> DASH!</h1>
          <p>Escolha seu campeão, entre na pista e corra rumo à vitória.</p>
          <div className="hero-meta">
            <span>⚡ FAST RACES</span>
            <span>•</span>
            <span>🏆 BIG FUN</span>
            <span>•</span>
            <span>🎮 100% ARCADE</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sunburst" />
          <span className="hero-horse">🐎</span>
          <span className="hero-spark spark-one">✦</span>
          <span className="hero-spark spark-two">✧</span>
          <span className="hero-speed">GO!</span>
        </div>
        <div className="hero-bottom-label">NO BETS. JUST RACING.</div>
      </section>

      <div className="game-layout">
        <div className="game-main">
          <HorseSelector
            selectedHorse={selectedHorse}
            onSelect={setSelectedHorse}
            disabled={isRacing}
          />
          <RaceTrack horses={horses} isRacing={isRacing} winner={winner} />
          <ResultPanel
            winner={winner}
            selectedHorse={selectedHorse}
            onPlayAgain={resetGame}
          />
        </div>

        <aside className="game-sidebar">
          <div className="score-card">
            <p className="eyebrow">YOUR SCORE</p>
            <strong>{score}</strong>
            <span>POINTS</span>
            <div className="score-decoration">🏆</div>
          </div>

          <div className="controls-card">
            <p className="eyebrow">RACE CONTROL</p>
            <h3>{isRacing ? "They're running!" : "Ready to race?"}</h3>
            <p>{raceMessage}</p>
            <button
              className="start-button"
              type="button"
              onClick={startRace}
              disabled={isRacing}
            >
              {isRacing ? "RACING..." : winner ? "RACE AGAIN" : "START RACE"} <span>▶</span>
            </button>
            <p className="control-note">Escolha um cavalo antes de iniciar.</p>
          </div>

          <div className="how-to-card">
            <p className="eyebrow">HOW TO PLAY</p>
            <ol>
              <li><span>01</span> Escolha seu cavalo favorito.</li>
              <li><span>02</span> Aperte START RACE.</li>
              <li><span>03</span> Torça pelo seu campeão!</li>
            </ol>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <span>HORSE DASH! <strong>ARCADE RACING</strong></span>
        <span>FEITO PARA DIVERSÃO • SEM APOSTAS OU DINHEIRO REAL</span>
      </footer>
    </main>
  );
}
