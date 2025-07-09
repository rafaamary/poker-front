import { useEffect, useState } from "react";
import { actionGame, nextPhase, endGame } from "../services/api.jsx";
import { subscribeToGameUpdates, requestGameState, sendActionViaWebSocket, cleanupAllSubscriptions } from "../services/socket.jsx";
import { useNavigate } from "react-router-dom";
import { allPlayersActed, validateAction } from "../utils/gameLogic.js";

export function useGame({ player, room, game }) {
  const [gameState, setGameState] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const navigate = useNavigate();
  const [playersWhoActed, setPlayersWhoActed] = useState(new Set());

  useEffect(() => {
    if (!room) {
      console.error('useGame: room não fornecida');
      return;
    }

    if (!player) {
      console.error('useGame: player não fornecido');
      return;
    }

    console.log('useGame: Configurando estado inicial...');

    const currentPhase = room.gamePhase || 'pre-flop';
    const pot = gameState?.pot + gameState?.lastAction?.amount;

    setGameState({
      roomId: room.id,
      players: room.players || [],
      currentPlayer: game?.initial_state?.current_player,
      pot: pot,
      communityCards: [],
      gamePhase: currentPhase,
      lastAction: null,
      message: 'Conectando ao jogo...'
    });

    const handleGameUpdate = (data) => {
      console.log("Dados recebidos via WebSocket:", data);

      if (data.type === 'game_started') {
        console.log("Jogo iniciado via WebSocket:", data.data);
        setGameState(prevState => ({
          ...prevState,
          currentPlayer: data.data.initial_state?.current_player,
          pot: data.data.game?.pot || 0,
          players: data.data.players || prevState.players,
          gamePhase: data.data.current_phase?.phase || 'pre-flop',
          communityCards: data.data.current_phase?.community_cards || [],
          message: 'Jogo iniciado!'
        }));
        return;
      }

      if (data.type === 'game_state_response') {
        console.log("Estado do jogo recebido:", data.data);
        setGameState(prevState => ({
          ...prevState,
          currentPlayer: data.data.current_player,
          pot: data.data.pot,
          players: data.data.players,
          gamePhase: data.data.phase,
          communityCards: data.data.community_cards,
          message: 'Jogo conectado!'
        }));
        return;
      }

      if (data.type === 'player_action') {
        setGameState(prevState => ({
          ...prevState,
          pot: data.data.game_state.pot,
          currentPlayer: data.data.game_state.current_player || prevState.currentPlayer,
          communityCards: data.data.game_state.community_cards || prevState.communityCards,
          gamePhase: data.data.game_state.phase || prevState.gamePhase,
          players: prevState.players.map(p =>
            p.id === data.data.player.id
              ? { ...p, chips: data.data.player.chips }
              : p
          ),
          lastAction: {
            action: data.data.action.action_type,
            amount: data.data.action.amount,
            player: data.data.player.id
          },
          message: `${data.data.player.name} realizou: ${data.data.action.action_type}${data.data.action.amount > 0 ? ` $${data.data.action.amount}` : ''}`
        }));
        return;
      }

      if (data.type === 'phase_changed' || data.type === 'phase_change') {
        console.log("Mudança de fase recebida:", data);
        setGameState(prevState => ({
          ...prevState,
          gamePhase: data.data?.phase || data.phase,
          communityCards: data.data?.community_cards || data.community_cards || prevState.communityCards,
          pot: data.data?.pot || prevState.pot,
          message: `Nova fase: ${data.data?.phase || data.phase}`
        }));
        setPlayersWhoActed(new Set());
        setCurrentPlayerIndex(0);
        return;
      }

      if (data.players && data.community_cards !== undefined && data.current_player !== undefined) {
        console.log("Atualizando estado do jogo com dados diretos:", data);
        setGameState(prevState => ({
          ...prevState,
          players: data.players,
          communityCards: data.community_cards,
          currentPlayer: data.current_player,
          pot: data.pot || prevState.pot,
          gamePhase: data.phase || prevState.gamePhase,
          message: 'Estado atualizado'
        }));
        return;
      }

      if (data.game_state) {
        setGameState(prevState => {
          const updatedState = {
            ...prevState,
            ...data.game_state,
            pot: data.game_state.pot || prevState.pot,
            currentPlayer: data.game_state.current_player || prevState.currentPlayer,
            communityCards: data.game_state.community_cards || prevState.communityCards,
            gamePhase: data.game_state.phase || prevState.gamePhase,
          };

          if (data.game_state.players) {
            updatedState.players = data.game_state.players;
          }

          return updatedState;
        });

        if (data.next_phase) {
          setPlayersWhoActed(new Set());
          setCurrentPlayerIndex(0);
        }
      }
    };

    const channel = subscribeToGameUpdates(room.id, player?.id, handleGameUpdate);

    if (!channel) {
      console.error('Falha ao criar canal WebSocket no useGame');
      return;
    }

    setTimeout(() => {
      if (player?.id) {
        console.log(`useGame: Solicitando estado do jogo para sala ${room.id} com player ${player.id}`);
        requestGameState(room.id, player.id);
      }
    }, 2500);

    return () => {
      console.log(`Limpando conexões WebSocket do useGame`);
      cleanupAllSubscriptions();
    };
  }, [room.id, player.id]);

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
      sendActionViaWebSocket(room.id, player.id, action, amount);

      setGameState(prev => ({
        ...prev,
        message: `Enviando ação: ${action}${amount > 0 ? ` $${amount}` : ''}...`
      }));

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
