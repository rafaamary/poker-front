const API_URL = "http://localhost:3000";
import axios from "axios";

export async function createPlayer(name) {
  try {
    const response = await axios.post(`${API_URL}/players`, { name });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao criar jogador");
  }
}

export async function deletePlayer(playerId) {
  try {
    const response = await axios.delete(`${API_URL}/players/${playerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao deletar jogador");
  }
}

export async function roomsList() {
  try {
    const response = await axios.get(`${API_URL}/rooms`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao buscar salas");
  }
}

export async function createRoom(roomData) {
  try {
    const response = await axios.post(`${API_URL}/rooms`, roomData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao criar sala");
  }
}

export async function joinRoom(roomId, playerId) {
  try {
    const response = await axios.post(`${API_URL}/rooms/${roomId}/join`, { player_id: playerId });
    return response.data;
  } catch (error) {
    console.log("Erro ao entrar na sala:", error);
    throw new Error(error.response?.data?.message || "Erro ao entrar na sala");
  }
}

export async function leaveRoom(roomId, playerId) {
  try {
    const response = await axios.post(`${API_URL}/rooms/${roomId}/leave`, { player_id: playerId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao sair da sala");
  }
}

export async function startGame(roomId) {
  try {
    const response = await axios.post(`${API_URL}/rooms/${roomId}/start`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao iniciar o jogo");
  }
}

export async function actionGame(roomId, playerId, action, amount) {
  try {
    const response = await axios.post(`${API_URL}/rooms/${roomId}/action`, { player_id: playerId, action, amount });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao realizar ação no jogo");
  }
}

export async function nextPhase(roomId) {
  try {
    const response = await axios.post(`${API_URL}/rooms/${roomId}/next-phase`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao avançar para a próxima fase");
  }
}

export async function endGame(roomId) {
  try {
    const response = await axios.post(`${API_URL}/rooms/${roomId}/end`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erro ao encerrar o jogo");
  }
}