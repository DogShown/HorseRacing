import { HORSES } from "./data/horses.js";
import { useRaceGame } from "./hooks/useRaceGame.js";

function Header({ score }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Horse Dash, início">
        <span className="brand-mark" aria-hidden="true">🏁</span>
        <span>HORSE <strong>DASH!</strong></span>
      </a>
      <div className="topbar-stats">
        <span className="status-pill"><span className="status-dot" aria-hidden="true" /> MODO ARCADE</span>
        <span className="best-score">PONTOS <strong>{score}</strong></span>
      </div>
    </header>
  );
}

function HorseSelector({ selectedHorse, onSelect, disabled }) {
  return (
    <section className="selection-section" aria-labelledby="select-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ESCOLHA SEU COMPETIDOR</p>
          <h2 id="select-title">Escolha seu cavalo</h2>
        </div>
        <span className="step-label">ETAPA 01 / 02</span>
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
              aria-label={`Selecionar ${horse.name}${isSelected ? ", selecionado" : ""}`}
            >
              <span className="horse-number">#{horse.number}</span>
              <span className="horse-avatar" aria-hidden="true">{horse.emoji}</span>
              <span className="horse-name">{horse.name}</span>
              <span className="horse-caption">{isSelected ? "SELECIONADO" : "ESCOLHER"}</span>
              {isSelected && <span className="selected-check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RaceTrack({ horses, isRacing, winners }) {
  const winnerIds = new Set(winners.map((horse) => horse.id));
  const status = isRacing
    ? "Corrida em andamento"
    : winners.length > 1
      ? "Empate"
      : winners.length === 1
        ? "Corrida finalizada"
        : "Aguardando início";

  return (
    <section className="track-section" aria-labelledby="race-title">
      <div className="section-heading track-heading">
        <div>
          <p className="eyebrow">ETAPA 02 / 02</p>
          <h2 id="race-title">Pista de corrida</h2>
        </div>
        <span className={`race-status ${isRacing ? "live" : ""}`} role="status" aria-live="polite">
          <span aria-hidden="true" /> {status}
        </span>
      </div>

      <div className={`race-track ${isRacing ? "racing" : ""}`}>
        <div className="track-skyline" aria-hidden="true">☁️　　☁️　　　　　☁️</div>
        <div className="track-start" aria-hidden="true">LARGADA</div>
        <div className="track-finish" aria-hidden="true">🏁</div>

        {horses.map((horse, index) => (
          <div
            className="lane"
            key={horse.id}
            role="progressbar"
            aria-label={`Progresso de ${horse.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(horse.progress)}
          >
            <span className="lane-number" aria-hidden="true">0{index + 1}</span>
            <div className="lane-ground">
              <div
                className={`runner ${horse.style} ${isRacing ? "running" : ""} ${winnerIds.has(horse.id) ? "winner-runner" : ""}`}
                style={{ left: `${Math.min(horse.progress, 95)}%`, "--horse-color": horse.color }}
              >
                <span className="runner-sprite" aria-hidden="true">{horse.emoji}</span>
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

function ResultPanel({ winners, selectedHorse, onPlayAgain }) {
  if (winners.length === 0) return null;

  const isDraw = winners.length > 1;
  const playerWon = !isDraw && winners[0].id === selectedHorse;
  const names = winners.map((horse) => horse.name).join(" e ");

  return (
    <section
      className={`result-panel ${playerWon ? "result-win" : "result-again"}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="result-icon" aria-hidden="true">
        {isDraw ? "🤝" : playerWon ? "🏆" : "🎮"}
      </span>
      <div className="result-copy">
        <p className="eyebrow">
          {isDraw ? "EMPATE!" : playerWon ? "VITÓRIA!" : "BOA TENTATIVA!"}
        </p>
        <h2>
          {isDraw
            ? `${names} cruzaram juntos a linha de chegada!`
            : `${names} cruzou a linha de chegada!`}
        </h2>
        <p>
          {isDraw
            ? "A corrida terminou empatada. Nenhum ponto foi adicionado."
            : playerWon
              ? "Seu cavalo venceu! Você ganhou 100 pontos."
              : "Dessa vez não foi o seu cavalo. Tente novamente!"}
        </p>
      </div>
      <button className="play-again-button" type="button" onClick={onPlayAgain}>
        NOVA CORRIDA ↗
      </button>
    </section>
  );
}

export default function App() {
  const {
    selectedHorse,
    selectHorse,
    horses,
    isRacing,
    winners,
    score,
    raceMessage,
    startRace,
    resetGame,
  } = useRaceGame();

  return (
    <main className="app-shell" id="home">
      <Header score={score} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-tag">★ CORRIDA ARCADE • DIVERSÃO SEM LIMITES ★</span>
          <h1 id="hero-title">READY.<br /><span>SET.</span> DASH!</h1>
          <p>Escolha seu campeão, entre na pista e corra rumo à vitória.</p>
          <div className="hero-meta">
            <span>⚡ CORRIDAS RÁPIDAS</span>
            <span aria-hidden="true">•</span>
            <span>🏆 MUITA DIVERSÃO</span>
            <span aria-hidden="true">•</span>
            <span>🎮 MODO ARCADE</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sunburst" />
          <span className="hero-horse">🐎</span>
          <span className="hero-spark spark-one">✦</span>
          <span className="hero-spark spark-two">✧</span>
          <span className="hero-speed">VAI!</span>
        </div>
        <div className="hero-bottom-label">SEM APOSTAS. SÓ CORRIDA.</div>
      </section>

      <div className="game-layout">
        <div className="game-main">
          <HorseSelector
            selectedHorse={selectedHorse}
            onSelect={selectHorse}
            disabled={isRacing}
          />
          <RaceTrack horses={horses} isRacing={isRacing} winners={winners} />
          <ResultPanel
            winners={winners}
            selectedHorse={selectedHorse}
            onPlayAgain={resetGame}
          />
        </div>

        <aside className="game-sidebar" aria-label="Painel do jogo">
          <div className="score-card">
            <p className="eyebrow">SUA PONTUAÇÃO</p>
            <strong aria-live="polite" aria-atomic="true">{score}</strong>
            <span>PONTOS ACUMULADOS</span>
            <div className="score-decoration" aria-hidden="true">🏆</div>
          </div>

          <div className="controls-card">
            <p className="eyebrow">CONTROLES DA CORRIDA</p>
            <h3>{isRacing ? "Os cavalos estão correndo!" : winners.length ? "Pronto para outra?" : "Vamos começar?"}</h3>
            <p className="race-message" role="status" aria-live="polite">{raceMessage}</p>
            <button
              className="start-button"
              type="button"
              onClick={startRace}
              disabled={isRacing}
            >
              {isRacing ? "CORRIDA EM ANDAMENTO..." : winners.length ? "CORRER NOVAMENTE" : "INICIAR CORRIDA"} <span aria-hidden="true">▶</span>
            </button>
            <p className="control-note">Você pode trocar de cavalo antes de cada corrida.</p>
          </div>

          <div className="how-to-card">
            <p className="eyebrow">COMO JOGAR</p>
            <ol>
              <li><span>01</span> Escolha seu cavalo favorito.</li>
              <li><span>02</span> Aperte “Iniciar corrida”.</li>
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
