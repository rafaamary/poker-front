import { useLocation } from 'react-router-dom';
import { useGame } from '../hook/useGame.jsx';
import Card from './Card.jsx';

export function GameModal() {
  const location = useLocation();
  const { player, room, game } = location.state || {};
  const { gameState, sendAction, playersWhoActed } = useGame({ player, room });

  if (!gameState || !player) return <p>Carregando jogo...</p>;

  const isYourTurn =
    gameState.currentPlayer === player.id ||
    (!gameState.currentPlayer && !playersWhoActed.includes(player.id));

  const currentPlayer = game?.initial_state?.players?.find((p) => p.id === player.id) || {
    id: player.id,
    name: player.name,
    chips: 1000,
    cards: []
  };

  let yourPlayer = gameState.players.find((p) => p.id === player.id);

  if (!yourPlayer) {
    yourPlayer = {
      id: player.id,
      name: player.name,
      chips: currentPlayer?.chips || 1000,
      cards: currentPlayer?.cards || [],
      status: 'active'
    };
    gameState.players.push(yourPlayer);
  }

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.roomName}>{room.name}</h1>
        <div style={styles.gamePhase}>FASE: {gameState.gamePhase?.toUpperCase() || 'PRE-FLOP'}</div>
      </header>

      <main style={styles.gameArea}>
        <div style={styles.table}>
          <div style={styles.pot}>
            <span>Pot ${Number(gameState.pot || 0).toFixed(2)}</span>
          </div>

          <div style={styles.communityCards}>
            {(gameState.communityCards || []).map((card, i) => (
              <Card key={i} value={card} />
            ))}
            {Array(5 - (gameState.communityCards?.length || 0))
              .fill(0)
              .map((_, i) => (
                <Card key={i} value='back' />
              ))}
          </div>
        </div>

        <section style={styles.playerArea}>
          <div style={styles.yourCards}>
            {(yourPlayer?.cards || []).map((card, i) => (
              <Card key={i} value={card} />
            ))}
            {Array(Math.max(0, 2 - (yourPlayer?.cards?.length || 0)))
              .fill(0)
              .map((_, i) => (
                <Card key={`empty-player-${i}`} value="?" />
              ))}
          </div>

          <div style={styles.turnIndicator}>{isYourTurn ? 'Sua Vez!' : 'AGUARDANDO...'}</div>

          <div style={styles.yourInfo}>
            <span style={styles.yourName}>{yourPlayer.name || 'Você'}</span>
            <span style={styles.yourChips}>${yourPlayer?.chips || 0}</span>
          </div>

          <div style={styles.actions}>
            <button
              style={{
                ...styles.actionButton,
                ...styles.button,
                ...(isYourTurn ? {} : styles.disabledButton)
              }}
              disabled={!isYourTurn}
              onClick={() => sendAction('check')}
            >
              CHECK
            </button>
            <button
              style={{
                ...styles.actionButton,
                ...styles.button,
                ...(isYourTurn ? {} : styles.disabledButton)
              }}
              disabled={!isYourTurn}
              onClick={() => sendAction('raise', 50)}
            >
              RAISE
            </button>
            <button
              style={{
                ...styles.actionButton,
                ...styles.button,
                ...(isYourTurn ? {} : styles.disabledButton)
              }}
              disabled={!isYourTurn}
              onClick={() => sendAction('fold')}
            >
              FOLD
            </button>
            <button
              style={{
                ...styles.actionButton,
                ...styles.button,
                ...(isYourTurn ? {} : styles.disabledButton)
              }}
              disabled={!isYourTurn}
              onClick={() => sendAction('call')}
            >
              CALL
            </button>
          </div>
        </section>
      </main>

      {gameState.message && <div style={styles.gameMessage}>{gameState.message}</div>}
    </>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(135deg, #0f3460, #16537e)',
    height: '100vh',
    width: '100vw',
    color: '#fff',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
  },
  header: {
    padding: '10px 0 8px',
    textAlign: 'center',
    borderBottom: '1px solid #00d0ff',
  },
  roomName: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#00d0ff',
  },
  gamePhase: {
    fontSize: '14px',
    marginTop: 4,
    color: '#00d0ff',
  },
  gameArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '20px',
  },
  table: {
    position: 'relative',
    background: '#222',
    borderRadius: '180px',
    width: '550px',
    height: '250px',
    border: '5px solid #888',
    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pot: {
    position: 'absolute',
    top: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#00d0ff',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#fff',
    zIndex: 5,
  },
  communityCards: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCardSlot: {
    width: '60px',
    height: '90px',
    border: '2px dashed #555',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerArea: {
    marginTop: '40px',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
    position: 'relative',
  },
  yourCards: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },
  turnIndicator: {
    marginTop: '8px',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#00d0ff',
  },
  yourInfo: {
    marginTop: '6px',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    fontSize: '16px',
    color: '#00d0ff',
  },
  yourName: {
    fontWeight: 'bold',
  },
  yourChips: {},
  actions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  actionButton: {
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    minWidth: '80px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#333',
    color: '#777',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  gameMessage: {
    position: 'absolute',
    bottom: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#ffff00',
    fontSize: '14px',
    fontStyle: 'italic',
    textAlign: 'center',
    zIndex: 10,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ff6b6b',
    fontSize: '16px',
    padding: '20px',
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#00d0ff',
    fontSize: '16px',
    padding: '20px',
    textAlign: 'center',
  },
};
