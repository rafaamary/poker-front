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

  const handleCreateRoom = (player) => {
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
    <>
      <h1 style={styles.title}>Bem-vindo, {player?.name || "jogador"}!</h1>

      <div style={styles.buttonsRow}>
        <button
          onClick={handleDeletePlayer}
          style={{ ...styles.button, backgroundColor: "#666" }}
        >
          Excluir Jogador
        </button>

        <button onClick={() => handleCreateRoom(player)} style={styles.button}>
          Criar Sala
        </button>
      </div>

      <h2 style={styles.subtitle}>Salas existentes:</h2>
      {rooms.length === 0 ? (
        <p style={styles.noRoomsText}>Nenhuma sala encontrada.</p>
      ) : (
        <ul style={styles.roomList}>
          {rooms.map((room) => (
            <li key={room.id} style={styles.roomItem}>
              <span>{room.name}</span>
              <button
                onClick={() => handleEnterRoom(room, player)}
                style={{ ...styles.button, marginLeft: 10, padding: "6px 16px" }}
              >
                Entrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const styles = {
  title: {
    fontSize: 28,
    marginBottom: 20,
    color: "#00d0ff",
    textAlign: "center",
  },
  buttonsRow: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 40,
    marginBottom: 10,
    fontSize: 22,
    color: "#00d0ff",
    borderBottom: "2px solid #00d0ff",
    paddingBottom: 6,
  },
  noRoomsText: {
    fontStyle: "italic",
    color: "#ccc",
    textAlign: "center",
  },
  roomList: {
    listStyle: "none",
    padding: 0,
  },
  roomItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#112d4e",
    padding: "10px 15px",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 18,
  },
  button: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#00d0ff",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
    transition: "background-color 0.3s ease",
  },
};
