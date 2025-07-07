import { useState } from "react";
import { createRoom } from "../services/api.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export function CreateRoomModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const player = location.state?.player;
  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Por favor, informe o nome da sala");
      return;
    }
    if (maxPlayers < 2 || maxPlayers > 10) {
      setError("Máximo de jogadores deve ser entre 2 e 10");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newRoom = await createRoom({ name: name.trim(), max_players: maxPlayers });
      setLoading(false);
      navigate("/inicio", { state: { player }});
    } catch (err) {
      setLoading(false);
      setError(err.message || "Erro ao criar sala");
    }
  };

  const handleCancel = () => {
    navigate("/inicio", { state: { player }});
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.h2}>Criar Sala</h2>

        <input
          style={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da sala"
          disabled={loading}
        />

        <input
          style={styles.input}
          type="number"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          min={2}
          max={10}
          placeholder="Máximo de jogadores"
          disabled={loading}
        />

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            style={styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar"}
          </button>

          <button
            style={{ ...styles.button, backgroundColor: "#888" }}
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "white",
    padding: 20,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: 300,
  },
  input: {
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    background: "white",
    color: "black",
  },
  h2: {
    margin: 0,
    fontSize: 20,
    textAlign: "center",
    color: "red",
  },
  button: {
    padding: 10,
    borderRadius: 4,
    border: "none",
    background: "red",
    color: "white",
    cursor: "pointer",
    flex: 1,
  },
  playerInfo: {
    background: "#f0f0f0",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    fontSize: "12px",
  },
};
