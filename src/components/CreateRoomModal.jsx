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

  const handleSubmit = async (player) => {
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
      await createRoom({ name: name.trim(), max_players: maxPlayers });
      setLoading(false);
      navigate("/inicio", { state: { player }});
    } catch (err) {
      setLoading(false);
      setError(err.message || "Erro ao criar sala");
    }
  };

  const handleCancel = (player) => {
    navigate("/inicio", { state: { player }});
  };

  return (
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

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttonsRow}>
        <button
          style={styles.button}
          onClick={() => handleSubmit(player)}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar"}
        </button>

        <button
          style={{ ...styles.button, backgroundColor: "#666" }}
          onClick={() => handleCancel(player)}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

const styles = {
  modal: {
    background: "#112d4e",
    padding: 20,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    width: 320,
    color: "white",
    fontFamily: 'Arial, sans-serif',
    boxShadow: "0 0 15px rgba(0, 208, 255, 0.4)",
  },
  h2: {
    margin: 0,
    fontSize: 24,
    textAlign: "center",
    color: "#00d0ff",
  },
  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #00d0ff",
    background: "#164a72",
    color: "white",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s",
  },
  error: {
    color: "#ff6b6b",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
  },
  buttonsRow: {
    display: "flex",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: "12px 0",
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
