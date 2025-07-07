import { useLocation } from 'react-router-dom';
import { useGame } from '../hook/useGame.jsx';
import Card from './Card.jsx';

export function GameModal() {
  const location = useLocation();
  const { player, room, game } = location.state || {};
  const { gameState, sendAction, playersWhoActed } = useGame({ player, room });

  if (!gameState || !player) return <p>Carregando jogo...</p>;

  const isYourTurn = gameState.currentPlayer === player.id ||
                     (!gameState.currentPlayer && !playersWhoActed.includes(player.id));

  const currentPlayer = game.initial_state.players.find(p => p.id === player.id);

  if (!gameState.players.find(p => p.id === player.id)) {
    gameState.players.push({
      id: player.id,
      name: player.name,
      chips: 1000,
      cards: currentPlayer.cards,
    });
  }

  const yourPlayer = gameState.players.find(p => p.id === player.id);
  const opponents = gameState.players.filter(p => p.id !== player.id);

  if (!yourPlayer) {
    return <p>Erro: Jogador não encontrado</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        {opponents.map((p, index) => {
          const hasActed = playersWhoActed.includes(p.id);
          const isCurrentPlayer = gameState.currentPlayer === p.id;

          return (
            <div key={p.id || index} style={{
              ...styles.opponent,
              border: isCurrentPlayer ? '2px solid #00d0ff' : hasActed ? '2px solid #4CAF50' : '2px solid transparent',
              borderRadius: '8px',
              padding: '8px'
            }}>
              <div style={styles.cardRow}>
                <Card value="?" />
                <Card value="?" />
              </div>
              <p style={styles.opponentName}>
                {p.name || 'Jogador'}
                {hasActed && ' ✓'}
                {isCurrentPlayer && ' 🎯'}
              </p>
              <p style={styles.opponentChips}>${p.chips || 0}</p>
              {p.lastAction && (
                <p style={styles.lastAction}>
                  {p.lastAction.action} {p.lastAction.amount > 0 && `$${p.lastAction.amount}`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.table}>
        <div style={styles.pot}>Pot: ${gameState.pot?.toFixed(2) || '0.00'}</div>
        <div style={styles.gamePhase}>Fase: {gameState.gamePhase || 'pre-flop'}</div>
        <div style={styles.cards}>
          {(gameState.communityCards || []).map((card, i) => (
            <Card key={i} value={card} />
          ))}
          {Array(5 - (gameState.communityCards?.length || 0)).fill(0).map((_, i) => (
            <Card key={`empty-${i}`} value="?" />
          ))}
        </div>
        {gameState.message && (
          <div style={styles.gameMessage}>{gameState.message}</div>
        )}
      </div>


      <div style={styles.yourSection}>
        <h3>
          {isYourTurn ? "Sua Vez!" : "Aguardando..."}
          {playersWhoActed.includes(player.id) && " ✓"}
        </h3>
        <p>Chips: ${yourPlayer?.chips || 0}</p>
        <div style={styles.cardRow}>
          {(yourPlayer?.cards || []).map((card, i) => (
            <Card key={i} value={card} />
          ))}
          {Array(Math.max(0, 2 - (yourPlayer?.cards?.length || 0))).fill(0).map((_, i) => (
            <Card key={`empty-player-${i}`} value="?" />
          ))}
        </div>
        {yourPlayer?.lastAction && (
          <p style={styles.lastAction}>
            Última ação: {yourPlayer.lastAction.action}
            {yourPlayer.lastAction.amount > 0 && ` $${yourPlayer.lastAction.amount}`}
          </p>
        )}
      </div>

      <div style={styles.actions}>
        <button disabled={!isYourTurn} onClick={() => sendAction("check")}>Check</button>
        <button disabled={!isYourTurn} onClick={() => sendAction("raise", 50)}>Bet $50</button>
        <button disabled={!isYourTurn} onClick={() => sendAction("fold")}>Fold</button>
        <button disabled={!isYourTurn} onClick={() => sendAction("call")}>Call</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    background: "#e5e5e5",
    minHeight: "100vh",
    padding: 20,
    textAlign: "center",
  },
  topRow: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    marginBottom: 20,
  },
  opponent: {
    textAlign: "center",
  },
  opponentName: {
    margin: 0,
    fontWeight: "bold",
    color: "#333",
  },
  opponentChips: {
    margin: 0,
    fontSize: "0.8em",
    color: "#777",
  },
  table: {
    background: "#2e2e2e",
    borderRadius: "50%",
    width: 400,
    height: 180,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "inset 0 0 15px #000",
  },
  pot: {
    color: "#00d0ff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gamePhase: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  gameMessage: {
    color: "#ffff00",
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  lastAction: {
    margin: 0,
    fontSize: "0.7em",
    color: "#888",
    fontStyle: "italic",
  },
  cards: {
    display: "flex",
    gap: 6,
  },
  yourSection: {
    marginTop: 30,
    background: "#fff",
    padding: 10,
    borderRadius: 8,
    width: 280,
    margin: "20px auto 0",
    color: "#333",
  },
  cardRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: 10,
  },
  actions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
};

