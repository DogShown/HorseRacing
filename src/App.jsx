import React, { useEffect, useRef } from "react";
import { POINTS_PER_WIN } from "./game/constants.js";
import { useRaceGame } from "./hooks/useRaceGame.js";

function HorseIcon({ color = "#c9a45c", className = "" }) {
  return <span className={className} role="img" aria-label="Cavalo" style={{ "--horse-color": color }}>🐎</span>;
}

function Header({ score, bestScore }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Horse Dash, início">
        <span className="brand-mark" aria-hidden="true">HD</span>
        <span className="brand-word">HORSE <strong>DASH</strong><i>CLUBE DE CORRIDAS</i></span>
      </a>
      <nav className="topbar-nav" aria-label="Navegação principal">
        <a href="#competitors">Competidores</a><a href="#race-track">Pista</a><a href="#leaderboard">Classificação</a>
      </nav>
      <div className="topbar-stats">
        <span className="topbar-score">PONTOS <strong>{score}</strong></span>
        <span className="topbar-score">RECORDE <strong>{bestScore}</strong></span>
      </div>
    </header>
  );
}

function HorseSelector({ horses, selectedHorse, onSelect, onUpdate, disabled }) {
  return (
    <section className="selection-section" id="competitors" aria-labelledby="select-title">
      <div className="section-heading">
        <div><p className="eyebrow">01 / FORME SUA PROVA</p><h2 id="select-title">Escolha os competidores</h2><p className="section-intro">Oito cavalos na pista. Escolha o seu e personalize o grupo.</p></div>
        <span className="section-count">{horses.length} PARTICIPANTES</span>
      </div>
      <div className="horse-options">
        {horses.map((horse) => {
          const isSelected = selectedHorse === horse.id;
          return (
            <article className={`horse-card ${isSelected ? "selected" : ""}`} key={horse.id} style={{ "--horse-accent": horse.color }}>
              <button className="horse-pick" type="button" onClick={() => onSelect(horse.id)} disabled={disabled} aria-pressed={isSelected}>
                <span className="horse-number">Nº {horse.number}</span>
                <span className="horse-avatar"><HorseIcon color={horse.color} /></span>
                <span className="horse-name">{horse.name}</span>
                <span className="horse-detail">{horse.breed || "Raça não informada"}</span>
                <span className="horse-caption">{isSelected ? "✓ SEU ESCOLHIDO" : "ESCOLHER CAVALO"}</span>
              </button>
              <details className="horse-editor">
                <summary>Editar competidor</summary>
                <div className="horse-editor-fields">
                  <label className="horse-field">Nome<input value={horse.name} maxLength={22} disabled={disabled} onChange={(e) => onUpdate(horse.id, "name", e.target.value)} /></label>
                  <label className="horse-field">Raça<input value={horse.breed} maxLength={32} disabled={disabled} onChange={(e) => onUpdate(horse.id, "breed", e.target.value)} /></label>
                  <label className="horse-field">Participante<input value={horse.participant} maxLength={22} disabled={disabled} onChange={(e) => onUpdate(horse.id, "participant", e.target.value)} /></label>
                  <label className="horse-field horse-color-field">Pelagem<input type="color" value={horse.color} disabled={disabled} onChange={(e) => onUpdate(horse.id, "color", e.target.value)} /></label>
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RaceTrack({ horses, isRacing, winners }) {
  const winnerIds = new Set(winners.map((horse) => horse.id));
  const status = isRacing ? "AO VIVO" : winners.length > 1 ? "EMPATE" : winners.length === 1 ? "PROVA ENCERRADA" : "AGUARDANDO LARGADA";
  return (
    <section className="track-section" id="race-track" aria-labelledby="race-title">
      <div className="section-heading track-heading">
        <div><p className="eyebrow">02 / A DISPUTA</p><h2 id="race-title">Pista principal</h2></div>
        <span className={`race-status ${isRacing ? "live" : ""}`} role="status" aria-live="polite"><span />{status}</span>
      </div>
      <div className={`race-track ${isRacing ? "racing" : ""}`}>
        <div className="track-atmosphere"><span>HIPÓDROMO HORSE DASH</span><span>LINHA DE CHEGADA <b>🏁</b></span></div>
        <div className="track-start" aria-hidden="true">LARGADA</div>
        <div className="track-finish" aria-hidden="true">🏁</div>
        {horses.map((horse, index) => (
          <div className="lane" key={horse.id} role="progressbar" aria-label={`Progresso de ${horse.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(horse.progress))}>
            <span className="lane-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="lane-ground">
              <div className="lane-progress" style={{ width: `${Math.min(horse.progress, 100)}%` }} />
              <div className={`runner ${isRacing ? "running" : ""} ${winnerIds.has(horse.id) ? "winner-runner" : ""}`} style={{ left: `${Math.min(horse.progress, 95)}%`, "--horse-color": horse.color }}>
                <span className="runner-sprite"><HorseIcon color={horse.color} /></span><span className="runner-name">{horse.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="track-hint">Cada competidor parte em igualdade de condições. Acompanhe a disputa até a bandeirada.</p>
    </section>
  );
}

function ResultPanel({ ranking, selectedHorse, onPlayAgain }) {
  if (!ranking.length) return null;
  const first = ranking.filter((item) => item.position === 1);
  const playerWon = first.length === 1 && first[0].horse.id === selectedHorse;
  const isDraw = first.length > 1;
  return (
    <section className={`result-panel ${playerWon ? "result-win" : "result-again"}`} role="status" aria-live="polite">
      <span className="result-icon">{isDraw ? "🤝" : playerWon ? "🏆" : "🏇"}</span>
      <div className="result-copy"><p className="eyebrow">{isDraw ? "PROVA EMPATADA" : playerWon ? "VITÓRIA NA PISTA" : "RESULTADO DA PROVA"}</p><h2>{isDraw ? "Temos um empate!" : playerWon ? `Seu cavalo venceu! +${POINTS_PER_WIN} pontos` : `${first[0]?.horse.name ?? "Prova finalizada"} ficou em primeiro lugar`}</h2>
        <ol className="final-ranking">{ranking.map(({ horse, position }) => <li key={horse.id} className={position === 1 ? "rank-first" : ""}><span className="rank-position">{position}º</span><span className="rank-horse">{horse.name} <small>— {horse.participant}</small></span>{position === 1 && <span className="rank-label">CHEGADA</span>}</li>)}</ol>
      </div>
      <button className="play-again-button" onClick={onPlayAgain} type="button">NOVA CORRIDA ↗</button>
    </section>
  );
}

function Leaderboard({ horses, participantScores }) {
  const rows = [...horses].sort((a, b) => (participantScores[b.id] ?? 0) - (participantScores[a.id] ?? 0) || a.number - b.number);
  return (
    <section className="leaderboard-card" id="leaderboard">
      <div className="leaderboard-heading"><div><p className="eyebrow">PLACAR DO GRUPO</p><h3>Ranking de participantes</h3></div><span>🏆</span></div>
      <ol className="leaderboard-list">
        {rows.map((horse, index) => <li key={horse.id} className={index === 0 && (participantScores[horse.id] ?? 0) > 0 ? "leader-first" : ""}>
          <span className="leader-position">{String(index + 1).padStart(2, "0")}</span><span className="leader-horse-icon" style={{ "--horse-accent": horse.color }}>🐎</span>
          <span className="leader-person"><strong>{horse.participant || "Participante"}</strong><small>{horse.name}</small></span><strong className="leader-points">{participantScores[horse.id] ?? 0}<small> pts</small></strong>
        </li>)}
      </ol>
      <p className="leaderboard-note">O vencedor de cada prova recebe 100 pontos recreativos. O placar fica salvo neste navegador.</p>
    </section>
  );
}

function StatisticsPanel({ racesPlayed, wins }) {
  return <section className="statistics-card"><p className="eyebrow">SEU HISTÓRICO</p><div className="statistics-grid"><div><strong>{racesPlayed}</strong><span>PROVAS</span></div><div><strong>{wins}</strong><span>VITÓRIAS</span></div></div></section>;
}

export default function App() {
  const shellRef = useRef(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => shellRef.current?.classList.add("is-ready"));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const { selectedHorse, selectHorse, updateHorseProfile, horses, isRacing, winners, ranking, score, bestScore, racesPlayed, wins, participantScores, storageWarning, raceMessage, startRace, resetGame } = useRaceGame();
  return (
    <main className="app-shell" id="home" ref={shellRef}>
      <Header score={score} bestScore={bestScore} />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> TEMPORADA ABERTA · EDIÇÃO ARCADE</span>
          <h1 id="hero-title">A EMOÇÃO<br /><span>ESTÁ NA PISTA.</span></h1>
          <p>Reúna seu grupo, escolha os competidores e descubra quem cruza a linha de chegada.</p>
          <div className="hero-actions"><a className="hero-cta" href="#competitors">ESCOLHER MEU CAVALO <span>↗</span></a><span className="hero-caption">GRÁTIS · SEM CADASTRO · JOGUE COM AMIGOS</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-orbit" /><div className="hero-number">01<span>/08</span></div><span className="hero-horse">🐎</span><span className="hero-ribbon">HORSE DASH CLUB</span></div>
        <div className="hero-foot"><span>TRADIÇÃO EQUESTRE, COMPETIÇÃO E DIVERSÃO.</span><span>EST. 2026</span></div>
      </section>

      <section className="first-visit" aria-label="Como começar a jogar">
        <div className="first-visit-heading"><span className="first-visit-icon">✦</span><div><p className="eyebrow">SUA PRIMEIRA CORRIDA</p><h2>É fácil entrar na disputa.</h2><p>Em menos de um minuto, seu grupo já pode estar na pista.</p></div></div>
        <div className="first-visit-steps">
          <article><span className="step-number">01</span><div><strong>Escolha</strong><small>Selecione um cavalo para representar você.</small></div></article>
          <article><span className="step-number">02</span><div><strong>Convide o grupo</strong><small>Personalize os nomes dos participantes no mesmo dispositivo.</small></div></article>
          <article><span className="step-number">03</span><div><strong>Dê a largada</strong><small>Acompanhe a corrida e some pontos no ranking.</small></div></article>
        </div>
        <a className="first-visit-link" href="#competitors">COMEÇAR AGORA <span>↓</span></a>
      </section>

      <div className="game-layout">
        <div className="game-main">
          <HorseSelector horses={horses} selectedHorse={selectedHorse} onSelect={selectHorse} onUpdate={updateHorseProfile} disabled={isRacing} />
          <RaceTrack horses={horses} isRacing={isRacing} winners={winners} />
          <ResultPanel ranking={ranking} selectedHorse={selectedHorse} onPlayAgain={resetGame} />
        </div>
        <aside className="game-sidebar" aria-label="Central da prova">
          {storageWarning && <p className="storage-warning" role="alert">O navegador bloqueou o armazenamento local. Você pode continuar jogando, mas os dados talvez não sejam salvos.</p>}
          <div className="controls-card" id="race-console"><p className="eyebrow">CENTRAL DA PROVA</p><h3>{isRacing ? "A disputa começou!" : ranking.length ? "Pronto para a revanche?" : "Sua corrida começa aqui."}</h3><p className="race-message" role="status" aria-live="polite">{raceMessage}</p><button className="start-button" type="button" onClick={startRace} disabled={isRacing}>{isRacing ? "PROVA EM ANDAMENTO..." : ranking.length ? "NOVA LARGADA" : "INICIAR CORRIDA"} <span>▶</span></button><p className="control-note">Modo grupo local · sem apostas ou dinheiro real.</p></div>
          <div className="score-card"><p className="eyebrow">SUA PONTUAÇÃO</p><strong>{score}</strong><span>PONTOS ACUMULADOS</span><div className="score-decoration">🏆</div></div>
          <div className="score-card record-card"><p className="eyebrow">RECORDE PESSOAL</p><strong>{bestScore}</strong><span>MELHOR PONTUAÇÃO</span><div className="score-decoration">✦</div></div>
          <StatisticsPanel racesPlayed={racesPlayed} wins={wins} />
          <Leaderboard horses={horses} participantScores={participantScores} />
          <div className="how-to-card"><p className="eyebrow">COMO FUNCIONA</p><ol><li><span>01</span> Escolha seu cavalo.</li><li><span>02</span> Identifique os participantes.</li><li><span>03</span> Inicie a prova e acompanhe o placar.</li></ol></div>
        </aside>
      </div>
      <footer className="footer"><span>HORSE DASH <strong>CLUBE DE CORRIDAS ARCADE</strong></span><span>MODO GRUPO LOCAL · SEM APOSTAS OU DINHEIRO REAL</span></footer>
    </main>
  );
}
