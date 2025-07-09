import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { leaveRoom } from "../services/api.jsx";
import { subscribeToGameUpdates, startGameViaWebSocket, joinRoomViaWebSocket, cleanupAllSubscriptions } from "../services/socket.jsx";

export function RoomModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const player = location.state?.player;
  const room = location.state?.room;

  const [loading, setLoading] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  const [shouldCleanup, setShouldCleanup] = useState(true);

  useEffect(() => {
    if (!room) return;

    const handleRoomUpdates = (data) => {
      console.log('RoomModal recebeu update:', data);

      if (data.type === 'game_started') {
        console.log('Jogo iniciado! Dados recebidos:', data.data);
        setGameStarting(true);
        setShouldCleanup(false);

        setTimeout(() => {
          const gameData = data.data;

          console.log('Navegando para /game com dados:', {
            player,
            room,
            game: gameData
          });

          navigate("/game", {
            state: {
              player,
              room,
              game: gameData
            }
          });
        }, 1000);
      }

      if (data.type === 'player_joined') {
        console.log('👤 Jogador entrou na sala:', data.data.player);
      }
    };


    const channel = subscribeToGameUpdates(room.id, player?.id, handleRoomUpdates);

    if (channel && player?.id) {
      setTimeout(() => {
        console.log(`Tentando entrar na sala ${room.id} com jogador ${player.id}`);
        joinRoomViaWebSocket(room.id, player.id);
      }, 1500);
    }

    return () => {
      if (shouldCleanup) {
        console.log(`Limpando conexões WebSocket do RoomModal`);
        cleanupAllSubscriptions();
      } else {
        console.log(`Mantendo conexões WebSocket para o GameModal`);
      }
    };
  }, [room, player, navigate]);

  const handleLeaveRoom = async () => {
    setLoading(true);
    try {
      await leaveRoom(room.id, player.id);
      alert("Você saiu da sala com sucesso!");
      navigate("/inicio", { state: { player } });
    } catch (error) {
      alert("Erro ao sair da sala: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (room, player) => {
    setLoading(true);
    try {
      startGameViaWebSocket(room.id, player);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!player || !room) {
    return <p style={styles.errorText}>Dados da sala ou do jogador não encontrados.</p>;
  }

  if (gameStarting) {
    return (
      <div style={styles.gameStartingContainer}>
        <h2 style={styles.gameStartingText}>🎮 Jogo iniciado!</h2>
        <p style={styles.gameStartingSubtext}>Redirecionando para o jogo...</p>
      </div>
    );
  }

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.roomName}>Sala: {room.name}</h1>
        <p style={styles.playerName}>Jogador: {player.name}</p>
        <div style={styles.playersInfo}>
          <p style={styles.playersCount}>
            Jogadores na sala: {room.players?.length || 0}/{room.max_players || 2}
          </p>
          {room.players && room.players.length > 1 && (
            <p style={styles.readyToPlay}>Pronto para jogar!</p>
          )}
          {room.players && room.players.length === 1 && (
            <p style={styles.waitingForPlayers}>Aguardando outros jogadores...</p>
          )}
        </div>
      </header>

      <div style={styles.buttonsContainer}>
        <button
          onClick={handleLeaveRoom}
          style={{ ...styles.actionButton, backgroundColor: "#888", cursor: loading ? "default" : "pointer", pointerEvents: loading ? "none" : "auto" }}
          disabled={loading}
        >
          Sair da Sala
        </button>

        <button
          onClick={() => handleStartGame(room, player)}
          style={{ ...styles.actionButton, cursor: loading ? "default" : "pointer", pointerEvents: loading ? "none" : "auto" }}
          disabled={loading}
        >
          {loading ? "Processando..." : "Iniciar Jogo"}
        </button>
      </div>
    </>
  );
}

const styles = {
  header: {
    textAlign: "center",
    marginBottom: 40,
    borderBottom: "2px solid #00d0ff",
    paddingBottom: 12,
    width: "100%",
    maxWidth: 400,
  },
  roomName: {
    margin: 0,
    fontSize: 28,
    fontWeight: "bold",
    color: "#00d0ff",
  },
  playerName: {
    marginTop: 6,
    fontSize: 18,
    color: "#00d0ff",
  },
  playersInfo: {
    marginTop: 15,
    padding: "10px",
    backgroundColor: "rgba(0, 208, 255, 0.1)",
    borderRadius: "8px",
    border: "1px solid #00d0ff",
  },
  playersCount: {
    margin: 0,
    fontSize: 14,
    color: "#00d0ff",
    fontWeight: "bold",
  },
  readyToPlay: {
    margin: "5px 0 0 0",
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  waitingForPlayers: {
    margin: "5px 0 0 0",
    fontSize: 14,
    color: "#ffa500",
    fontWeight: "bold",
  },
  buttonsContainer: {
    display: "flex",
    gap: 20,
    width: "100%",
    maxWidth: 400,
    justifyContent: "center",
  },
  actionButton: {
    flex: 1,
    padding: "14px 0",
    fontSize: 16,
    fontWeight: "bold",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    textTransform: "uppercase",
    backgroundColor: "#00d0ff",
    color: "#fff",
    transition: "background-color 0.3s ease",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Arial, sans-serif",
  },
  gameStartingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "rgba(0, 208, 255, 0.1)",
    borderRadius: "12px",
    border: "2px solid #00d0ff",
  },
  gameStartingText: {
    fontSize: "28px",
    color: "#00d0ff",
    margin: 0,
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  gameStartingSubtext: {
    fontSize: "16px",
    color: "#00d0ff",
    marginTop: "10px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
};
