import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { leaveRoom, startGame } from "../services/api.jsx";

export function RoomModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const player = location.state?.player;
  const room = location.state?.room;

  const [loading, setLoading] = useState(false);

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

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const game = await startGame(room.id);
      alert("Jogo iniciado com sucesso!");
      navigate("/game", { state: { player, room, game } });
    } catch (error) {
      alert("Erro ao iniciar o jogo: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!player || !room) {
    return <p style={styles.errorText}>Dados da sala ou do jogador não encontrados.</p>;
  }

  return (
    <>
      <header style={styles.header}>
        <h1 style={styles.roomName}>Sala: {room.name}</h1>
        <p style={styles.playerName}>Jogador: {player.name}</p>
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
          onClick={handleStartGame}
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
};
