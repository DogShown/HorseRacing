import React, { useEffect, useRef } from "react";
import { POINTS_PER_WIN } from "./game/constants.js";
import { useRaceGame } from "./hooks/useRaceGame.js";

function validateComponentProps(componentName, props, schema) {
  if (!import.meta.env.DEV) return;

  for (const [propName, expectedType] of Object.entries(schema)) {
    const value = props[propName];
    const valid = expectedType === "array"
      ? Array.isArray(value)
      : typeof value === expectedType;

    if (!valid) {
      console.error(`[${componentName}] esperava "${propName}" como ${expectedType}.`);
    }
  }
}

function validateHorseCollection(componentName, horses) {
  if (!import.meta.env.DEV) return;
  const valid = Array.isArray(horses) && horses.every((horse) =>
    horse &&
    typeof horse.id === "string" &&
    typeof horse.name === "string" &&
    typeof horse.progress === "number" &&
    Number.isFinite(horse.progress)
  );

  if (!valid) {
    console.error(`[${componentName}] recebeu uma coleção de cavalos inválida.`);
  }
}

function HorseIcon({ color = "#8b7355", className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 96"
      role="img"
      aria-label="Ilustração de cavalo de corrida"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={color}>
        {/* Cauda e garupa */}
        <path d="M25 43C17 38 12 29 8 22c-2-4-5-3-6 0-2 9 5 22 17 29l8 3z" />
        {/* Corpo */}
        <path d="M24 43c8-9 21-13 36-12 12 1 20 6 27 12l-5 17c-12 5-34 5-49-1-8-3-12-8-9-16z" />
        {/* Pescoço */}
        <path d="M73 43c7-10 10-22 17-31 4-5 11-7 17-4 4 2 5 7 2 11l-8 10c-2 8-1 17 5 25l-13 9-17-8z" />
        {/* Cabeça e focinho */}
        <path d="M98 13c6-7 15-8 21-3 5 4 5 10 1 14l-8 5-13-3-7-7z" />
        {/* Orelhas */}
        <path d="m101 9 1-8 6 8zm10-1 5-6 2 10z" />
        {/* Crina */}
        <path d="M78 31c2-12 8-23 17-29-2 8-1 13 3 17-8 2-10 7-12 15z" opacity=".78" />
        {/* Pernas dianteiras em galope */}
        <path d="M83 57c4 3 8 7 11 12l13 7-3 5-19-7-10-13zm-8 1c-1 8-4 14-10 19l-4 12-6-1 2-16 10-20z" />
        {/* Pernas traseiras */}
        <path d="M36 58c-4 7-9 11-17 13L9 83l-5-3 8-18 15-14zm14 4c4 7 5 13 3 20l5 9-6 3-10-10 1-18z" />
      </g>
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 20C1 12 2 7 7 4" strokeWidth="3" />
        <path d="M91 13c4 5 7 7 12 8" strokeWidth="2" opacity=".55" />
      </g>
      <circle cx="115" cy="16" r="1.8" fill="#202b24" />
      <path d="m121 23 4 1" stroke="#202b24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Header({ score, bestScore }) {
  validateComponentProps("Header", { score, bestScore }, { score: "number", bestScore: "number" });
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Horse Dash, início">
        <span className="brand-mark" aria-hidden="true">🏁</span>
        <span>HORSE <strong>DASH!</strong></span>
      </a>
      <div className="topbar-stats">
        <span className="status-pill"><span className="status-dot" aria-hidden="true" /> CLUBE HÍPICO • ARCADE</span>
        <span className="best-score">PONTOS <strong>{score}</strong></span>
        <span className="best-score">RECORDE <strong>{bestScore}</strong></span>
      </div>
    </header>
  );
}

function HorseSelector({ horses, selectedHorse, onSelect, onUpdate, disabled }) {
  validateComponentProps("HorseSelector", { horses, selectedHorse, onSelect, onUpdate, disabled }, {
    horses: "array", selectedHorse: "string", onSelect: "function", onUpdate: "function", disabled: "boolean",
  });
  return (
    <section className="selection-section" aria-labelledby="select-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PROGRAMA DA PROVA • 8 COMPETIDORES</p>
          <h2 id="select-title">Monte seu grupo</h2>
          <p className="section-intro">Personalize os cavalos e identifique quem está participando. As alterações ficam salvas neste navegador.</p>
        </div>
        <span className="step-label">EDIÇÃO LIVRE</span>
      </div>

      <div className="horse-options">
        {horses.map((horse) => {
          const isSelected = selectedHorse === horse.id;
          return (
            <article className={`horse-card ${isSelected ? "selected" : ""} ${horse.style}`} key={horse.id} style={{ "--horse-accent": horse.color }}>
              <button className="horse-pick" type="button" onClick={() => onSelect(horse.id)} disabled={disabled} aria-pressed={isSelected}>
                <span className="horse-number">#{horse.number}</span>
                <span className="horse-avatar" aria-hidden="true"><HorseIcon color={horse.color} /></span>
                <span className="horse-name">{horse.name}</span>
                <span className="horse-caption">{isSelected ? "SEU COMPETIDOR" : "SELECIONAR"}</span>
              </button>
              <label className="horse-field">Nome do cavalo
                <input value={horse.name} maxLength={22} disabled={disabled} onChange={(event) => onUpdate(horse.id, "name", event.target.value)} aria-label={`Nome do cavalo ${horse.number}`} />
              </label>
              <label className="horse-field">Raça (opcional)
                <input value={horse.breed} maxLength={32} disabled={disabled} onChange={(event) => onUpdate(horse.id, "breed", event.target.value)} aria-label={`Raça do cavalo ${horse.number}`} />
              </label>
              <label className="horse-field">Participante
                <input value={horse.participant} maxLength={22} disabled={disabled} onChange={(event) => onUpdate(horse.id, "participant", event.target.value)} aria-label={`Participante do cavalo ${horse.number}`} />
              </label>
              <label className="horse-field horse-color-field">Cor da pelagem
                <input type="color" value={horse.color} disabled={disabled} onChange={(event) => onUpdate(horse.id, "color", event.target.value)} aria-label={`Cor da pelagem de ${horse.name}`} />
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RaceTrack({ horses, isRacing, winners }) {
  validateComponentProps("RaceTrack", { horses, isRacing, winners }, {
    horses: "array", isRacing: "boolean", winners: "array",
  });
  validateHorseCollection("RaceTrack", horses);
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
          <h2 id="race-title">Pista principal</h2>
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
            aria-valuenow={Math.min(100, Math.round(horse.progress))}
          >
            <span className="lane-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className="lane-ground">
              <div
                className="lane-progress"
                aria-hidden="true"
                style={{ width: `${Math.min(horse.progress, 100)}%` }}
              />
              <div
                className={`runner ${horse.style} ${isRacing ? "running" : ""} ${winnerIds.has(horse.id) ? "winner-runner" : ""}`}
                style={{ left: `${Math.min(horse.progress, 95)}%`, "--horse-color": horse.color }}
              >
                <span className="runner-sprite" aria-hidden="true"><HorseIcon color={horse.color} /></span>
                <span className="runner-name">{horse.name} · {horse.participant}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="track-grass" aria-hidden="true" />
      </div>
      <p className="track-hint">Acompanhe cada competidor até a linha de chegada.</p>
    </section>
  );
}

function ResultPanel({ ranking, selectedHorse, onPlayAgain }) {
  validateComponentProps("ResultPanel", { ranking, selectedHorse, onPlayAgain }, {
    ranking: "array", selectedHorse: "string", onPlayAgain: "function",
  });
  if (ranking.length === 0) return null;

  const firstPlace = ranking.filter((item) => item.position === 1);
  const playerWon = firstPlace.length === 1 && firstPlace[0].horse.id === selectedHorse;
  const isDraw = firstPlace.length > 1;
  const resultLabel = isDraw ? "EMPATE!" : playerWon ? "VITÓRIA!" : "BOA TENTATIVA!";
  const resultDescription = isDraw
    ? "A corrida terminou empatada em primeiro lugar. Nenhum ponto foi adicionado."
    : playerWon
      ? `Seu cavalo venceu! Você ganhou ${POINTS_PER_WIN} pontos.`
      : "Dessa vez não foi o seu cavalo. Tente novamente!";

  return (
    <section className={`result-panel ${playerWon ? "result-win" : "result-again"}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="result-icon" aria-hidden="true">{isDraw ? "🤝" : playerWon ? "🏆" : "🎮"}</span>
      <div className="result-copy">
        <p className="eyebrow">{resultLabel}</p>
        <h2>{resultDescription}</h2>
        <ol className="final-ranking" aria-label="Classificação final da corrida">
          {ranking.map(({ horse, position }) => (
            <li key={horse.id} className={position === 1 ? "rank-first" : ""}>
              <span className="rank-position">{position}º</span>
              <span className="rank-horse">{horse.name} <small>— {horse.participant}</small></span>
              {position === 1 && <span className="rank-label">CHEGADA</span>}
            </li>
          ))}
        </ol>
      </div>
      <button className="play-again-button" type="button" onClick={onPlayAgain}>
        NOVA CORRIDA ↗
      </button>
    </section>
  );
}

function StatisticsPanel({ racesPlayed, wins }) {
  validateComponentProps("StatisticsPanel", { racesPlayed, wins }, {
    racesPlayed: "number", wins: "number",
  });
  return (
    <section className="statistics-card" aria-labelledby="statistics-title">
      <p className="eyebrow" id="statistics-title">SEU HISTÓRICO DE PROVAS</p>
      <div className="statistics-grid">
        <div><strong>{racesPlayed}</strong><span>CORRIDAS</span></div>
        <div><strong>{wins}</strong><span>VITÓRIAS</span></div>
      </div>
    </section>
  );
}

export default function App() {
  const shellRef = useRef(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      shellRef.current?.classList.add("is-ready");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const {
    selectedHorse,
    selectHorse,
    updateHorseProfile,
    horses,
    isRacing,
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
  } = useRaceGame();
  const activeHorse = horses.find((horse) => horse.id === selectedHorse);

  return (
    <main className="app-shell" id="home" ref={shellRef}>
      <Header score={score} bestScore={bestScore} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-tag">★ TRADIÇÃO EQUESTRE • EMOÇÃO NA PISTA ★</span>
          <h1 id="hero-title">THE RACE.<br /><span>THE PRIDE.</span></h1>
          <p>Reúna seus amigos, personalize os competidores e acompanhe a classificação da prova.</p>
          <div className="hero-meta">
            <span>🏇 PROVA ARCADE</span>
            <span aria-hidden="true">•</span>
            <span>🏆 CLASSIFICAÇÃO OFICIAL</span>
            <span aria-hidden="true">•</span>
            <span>✦ CLUBE HÍPICO</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sunburst" />
          <span className="hero-horse"><HorseIcon color={activeHorse?.color ?? "#8b7355"} /></span>
          <span className="hero-spark spark-one">✦</span>
          <span className="hero-spark spark-two">✧</span>
          <span className="hero-speed">VAI!</span>
        </div>
        <div className="hero-bottom-label">ESPORTE, TRADIÇÃO E ENTRETENIMENTO.</div>
      </section>

      <div className="game-layout">
        <div className="game-main">
          <HorseSelector horses={horses} selectedHorse={selectedHorse} onSelect={selectHorse} onUpdate={updateHorseProfile} disabled={isRacing} />
          <RaceTrack horses={horses} isRacing={isRacing} winners={winners} />
          <ResultPanel ranking={ranking} selectedHorse={selectedHorse} onPlayAgain={resetGame} />
        </div>

        <aside className="game-sidebar" aria-label="Painel do jogo">
          {storageWarning && (
            <p className="storage-warning" role="alert">
              O navegador bloqueou o armazenamento local. Você pode continuar jogando, mas sua pontuação e estatísticas talvez não sejam salvas.
            </p>
          )}
          <div className="score-card">
            <p className="eyebrow">SUA PONTUAÇÃO</p>
            <strong aria-live="polite" aria-atomic="true">{score}</strong>
            <span>PONTOS ACUMULADOS</span>
            <div className="score-decoration" aria-hidden="true">🏆</div>
          </div>

          <div className="score-card record-card">
            <p className="eyebrow">RECORDE PESSOAL</p>
            <strong>{bestScore}</strong>
            <span>MELHOR PONTUAÇÃO</span>
            <div className="score-decoration" aria-hidden="true">⭐</div>
          </div>

          <StatisticsPanel racesPlayed={racesPlayed} wins={wins} />

          <div className="controls-card">
            <p className="eyebrow">CENTRAL DA PROVA</p>
            <h3>{isRacing ? "Os cavalos estão correndo!" : ranking.length ? "Pronto para outra?" : "Vamos começar?"}</h3>
            <p className="race-message" role="status" aria-live="polite">{raceMessage}</p>
            <button className="start-button" type="button" onClick={startRace} disabled={isRacing}>
              {isRacing ? "CORRIDA EM ANDAMENTO..." : ranking.length ? "CORRER NOVAMENTE" : "INICIAR CORRIDA"} <span aria-hidden="true">▶</span>
            </button>
            <p className="control-note">A disputa usa pontos recreativos; nomes, raças e participantes ficam salvos neste navegador.</p>
          </div>

          <div className="how-to-card">
            <p className="eyebrow">COMO JOGAR</p>
            <ol>
              <li><span>01</span> Personalize o grupo e escolha seu competidor.</li>
              <li><span>02</span> Aperte “Iniciar corrida”.</li>
              <li><span>03</span> Torça pelo seu campeão!</li>
            </ol>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <span>HORSE DASH! <strong>ARCADE RACING</strong></span>
        <span>MODO GRUPO LOCAL • SEM APOSTAS OU DINHEIRO REAL</span>
      </footer>
    </main>
  );
}
