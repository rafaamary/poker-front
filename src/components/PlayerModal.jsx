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
    <>
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
    </>
  );
}

const styles = {
modal: {
    background: "#112d4e",
    padding: 24,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: 320,
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
    color: "#fff",
  },
  h2: {
    margin: 0,
    fontSize: 22,
    textAlign: "center",
    color: "#00d0ff",
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #2a5d8f",
    background: "#1a3a6d",
    color: "white",
    fontSize: 16,
    outline: "none",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#00d0ff",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "background-color 0.3s ease",
  },
  errorText: {
    color: "#ff6b6b",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
};