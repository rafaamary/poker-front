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
    return <p>Dados da sala ou do jogador não encontrados.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Sala: {room.name}</h1>
      <p>Jogador: {player.name}</p>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          onClick={handleLeaveRoom}
          style={{ ...buttonStyle, backgroundColor: "#888" }}
          disabled={loading}
        >
          Sair da Sala
        </button>

        <button
          onClick={handleStartGame}
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? "Processando..." : "Iniciar Jogo"}
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: 6,
  border: "none",
  backgroundColor: "red",
  color: "white",
  cursor: "pointer",
};
