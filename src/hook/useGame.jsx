import { useEffect, useState } from "react";
import { actionGame, nextPhase, endGame } from "../services/api.jsx";
import gameChannel from "../services/socket.jsx";
import { useNavigate } from "react-router-dom";
import { allPlayersActed, validateAction } from "../utils/gameLogic.js";

export function useGame({ player, room }) {
  const [gameState, setGameState] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const navigate = useNavigate();
  const [playersWhoActed, setPlayersWhoActed] = useState(new Set());

  useEffect(() => {
    if (!room) return;

    const currentPhase = room.gamePhase || 'pre-flop';
    console.log("Current game phase:", currentPhase);
    const pot = gameState?.pot + gameState?.lastAction?.amount;
    console.log("Current pot amount:", pot);

    setGameState({
      roomId: room.id,
      players: room.players || [],
      currentPlayer: null,
      pot: pot,
      communityCards: [],
      gamePhase: currentPhase,
      lastAction: null,
      message: 'Aguardando jogadores...'
    });

    const handleGameUpdate = (data) => {
      console.log("Game update received:", data);
      setGameState(prevState => ({
        ...prevState,
        ...data.game_state,
        pot: data.game_state.pot || prevState.pot,
      }));

      if (data.next_phase) {
        setPlayersWhoActed(new Set());
        setCurrentPlayerIndex(0);
      }
    };

    gameChannel.received = handleGameUpdate;

    return () => {
      gameChannel.received = () => {};
    };
  }, [room.id]);

  const sendAction = async (action, amount = 0) => {
    if (!gameState || !player || !room) return;

    const currentPlayer = gameState.players.find(p => p.id === player.id);
    const validation = validateAction(currentPlayer, action, amount, gameState);

    if (!validation.valid) {
      console.error("Ação inválida:", validation.error);
      setGameState(prev => ({
        ...prev,
        message: `Erro: ${validation.error}`
      }));
      return;
    }

    try {
      const response = await actionGame(room.id, player.id, action, amount);

      setGameState(prev => ({
        ...prev,
        pot: response.game_state?.pot,
        lastAction: { action, amount, player: player.id },
        message: `${player.name} realizou: ${action}${amount > 0 ? ` $${amount}` : ''}`
      }));

      const newPlayersWhoActed = new Set(playersWhoActed);
      newPlayersWhoActed.add(player.id);
      setPlayersWhoActed(newPlayersWhoActed);

      const activePlayers = gameState.players.filter(p => p.status !== 'folded');

      if (allPlayersActed(activePlayers, newPlayersWhoActed)) {
        const currentPhase = gameState.gamePhase;

        setTimeout(async () => {
          try {
            console.log(currentPhase === 'river')
            if (currentPhase === 'river') {
              const response = await endGame(room.id);

              console.log("Fim do jogo:", response);

              setGameState(prev => ({
                ...prev,
                gamePhase: 'showdown',
                communityCards: response.community_cards || [],
              }));

              navigate(`/inicio`, { state: { room } });
            } else {
              const response = await nextPhase(room.id);

              setGameState(prev => ({
                ...prev,
                gamePhase: response.phase,
                pot: response.pot || prev.pot,
                communityCards: response.community_cards || [],
              }));
              setPlayersWhoActed(new Set());
            }
          } catch (error) {
            console.error("Erro ao avançar fase:", error);
          }
        }, 1000);
      }

    } catch (error) {
      console.error("Erro ao enviar ação:", error);
      setGameState(prev => ({
        ...prev,
        message: `Erro ao realizar ação: ${error.message}`
      }));
    }
  };

  return {
    gameState,
    sendAction,
    currentPlayerIndex,
    playersWhoActed: Array.from(playersWhoActed),
  };
}
