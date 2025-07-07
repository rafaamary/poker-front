import { useState } from "react";
import { createPlayer } from "../services/api.jsx";
import { useNavigate } from "react-router-dom";

export function PlayerModal() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name) return;

    setLoading(true);
    setError(null);

    try {
      const player = await createPlayer(name);

      setLoading(false);
      navigate('/inicio', {
        state: { player },
      });
    } catch (err) {
      setLoading(false);
      setError(err.message || "Erro ao criar jogador");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.h2}>Qual o seu nome?</h2>
        <input
          style={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome"
          disabled={loading}
        />
        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading || !name}
        >
          {loading ? "Carregando..." : "Entrar"}
        </button>
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
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
  },
};
