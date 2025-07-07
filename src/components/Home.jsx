import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { roomsList, deletePlayer, joinRoom } from "../services/api.jsx";

export function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const player = location.state?.player;

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const rooms = await roomsList();
      setRooms(rooms);
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = () => {
    navigate("/criar-sala", { state: { player } });
  };

  const handleEnterRoom = async (room, player) => {
    try {
      await joinRoom(room.id, player.id);
      navigate(`/sala`, { state: { player, room } });
    } catch (error) {
      alert("Erro ao entrar na sala!");
      console.error(error);
    }
  };

  const handleDeletePlayer = async () => {
    const confirm = window.confirm("Tem certeza que deseja sair?");
    if (!confirm) return;

    try {
      await deletePlayer(player.id);
      navigate("/");
    } catch (error) {
      alert("Erro ao excluir jogador");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bem-vindo, {player?.name || "jogador"}!</h1>

      <button
        onClick={handleDeletePlayer}
        style={{ ...buttonStyle, backgroundColor: "gray" }}
      >
        Excluir Jogador
      </button>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleCreateRoom} style={buttonStyle}>
          Criar Sala
        </button>
      </div>

      <h2 style={{ marginTop: 40 }}>Salas existentes:</h2>
      {rooms.length === 0 ? (
        <p>Nenhuma sala encontrada.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.id} style={{ marginBottom: 10 }}>
              <span>{room.name}</span>
              <button
                onClick={() => handleEnterRoom(room, player)}
                style={{ ...buttonStyle, marginLeft: 10 }}
              >
                Entrar
              </button>
            </li>
          ))}
        </ul>
      )}
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
