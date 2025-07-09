import { createConsumer } from "@rails/actioncable";

const cable = createConsumer("ws://localhost:3000/cable");

let gameChannel = null;
let isConnected = false;
let pendingCommands = [];
let currentSubscriptionId = null;

export function createGameChannel(roomId, playerId = null) {
  console.log(`Criando canal para sala ${roomId}${playerId ? ` com jogador ${playerId}` : ''}`);

  if (gameChannel) {
    console.log("Desconectando canal anterior");
    try {
      gameChannel.unsubscribe();
    } catch (error) {
      console.warn("Erro ao desconectar canal anterior (ignorado):", error);
    }
    gameChannel = null;
    isConnected = false;
    pendingCommands = [];
    currentSubscriptionId = null;
  }

  const subscriptionId = `GameChannel_${roomId}_${playerId}_${Date.now()}`;
  currentSubscriptionId = subscriptionId;

  const channelParams = { channel: "GameChannel" };
  if (roomId) channelParams.room_id = roomId;
  if (playerId) channelParams.player_id = playerId;

  console.log(`Criando canal com parâmetros:`, channelParams);

  gameChannel = cable.subscriptions.create(channelParams, {
    connected() {
      console.log(`Conectado ao GameChannel (${subscriptionId})`);
      isConnected = true;

      setTimeout(() => {
        if (currentSubscriptionId === subscriptionId && pendingCommands.length > 0) {
          console.log(`Processando ${pendingCommands.length} comandos pendentes`);
          const commandsToProcess = [...pendingCommands];
          pendingCommands = [];

          commandsToProcess.forEach(command => {
            console.log(`Executando comando pendente:`, command);
            try {
              this.perform(command.action, command.data);
            } catch (error) {
              console.error(`Erro ao executar comando pendente:`, error);
            }
          });
        }
      }, 1500);
    },

    disconnected() {
      console.log(`Desconectado do GameChannel (${subscriptionId})`);
      isConnected = false;
    },

    received(data) {
      console.log("Mensagem recebida via WebSocket:", data);
      if (this.onMessage) {
        this.onMessage(data);
      }
    },

    sendCommand(action, data = {}) {
      console.log(`Enviando comando: ${action}`, data);

      if (currentSubscriptionId !== subscriptionId) {
        console.warn(`Tentativa de enviar comando em subscrição inválida`);
        return;
      }

      const cleanData = { ...data };
      delete cleanData.action;

      if (isConnected) {
        try {
          this.perform(action, cleanData);
        } catch (error) {
          console.error(`Erro ao enviar comando ${action}:`, error);
        }
      } else {
        console.log(`Comando em fila: ${action}`, cleanData);
        pendingCommands.push({ action, data: cleanData });
      }
    }
  });

  gameChannel._subscriptionId = subscriptionId;
  return gameChannel;
}

export function subscribeToGameUpdates(roomId, playerId, callback) {
  const channel = createGameChannel(roomId, playerId);
  if (channel) {
    channel.onMessage = callback;
  }
  return channel;
}

export function unsubscribeFromGame() {
  if (gameChannel) {
    console.log(`Desconectando canal`);
    try {
      gameChannel.unsubscribe();
    } catch (error) {
      console.warn("Erro ao desconectar:", error);
    }
    gameChannel = null;
    isConnected = false;
    pendingCommands = [];
    currentSubscriptionId = null;
  }
}

export function joinRoomViaWebSocket(roomId, playerId) {
  console.log(`Tentativa de entrar na sala ${roomId}`);

  if (!gameChannel) {
    console.log(`Canal não existe, criando automaticamente...`);
    createGameChannel(roomId, playerId);
  }

  if (gameChannel && isConnected) {
    console.log(`Entrando na sala ${roomId}`);
    gameChannel.sendCommand('join_room', { room_id: roomId });
  } else if (gameChannel) {
    console.log(`Adicionando join_room à fila`);
    pendingCommands.push({ action: 'join_room', data: { room_id: roomId } });
  } else {
    console.error("Falha ao criar canal WebSocket");
  }
}

export function startGameViaWebSocket(roomId) {
  console.log(`Tentativa de iniciar jogo na sala ${roomId}`);

  if (!gameChannel) {
    console.error("Canal WebSocket não criado. Use subscribeToGameUpdates primeiro.");
    return;
  }

  if (gameChannel && isConnected) {
    console.log(`Iniciando jogo na sala ${roomId}`);
    gameChannel.sendCommand('start_game', { room_id: roomId });
  } else {
    console.log(`Adicionando start_game à fila`);
    pendingCommands.push({ action: 'start_game', data: { room_id: roomId } });
  }
}

export function sendActionViaWebSocket(roomId, playerId, action, amount = 0) {
  if (!gameChannel) {
    console.error("Canal WebSocket não criado");
    return;
  }

  if (gameChannel && isConnected) {
    gameChannel.sendCommand('player_action', {
      room_id: roomId,
      player_id: playerId,
      action_type: action,
      amount: amount
    });
  } else {
    pendingCommands.push({
      action: 'player_action',
      data: { room_id: roomId, action_type: action, amount: amount }
    });
  }
}

export function requestGameState(roomId, playerId = null) {
  console.log(`Tentativa de solicitar estado do jogo para sala ${roomId}${playerId ? ` com player ${playerId}` : ''}`);

  if (!gameChannel) {
    console.log(`Canal não existe para requestGameState, criando automaticamente...`);
    const newChannel = createGameChannel(roomId, playerId);
    if (!newChannel) {
      console.error("Falha ao criar canal WebSocket para requestGameState");
      return;
    }

    setTimeout(() => {
      if (gameChannel && isConnected) {
        console.log(`Solicitando estado do jogo após criação do canal`);
        gameChannel.sendCommand('get_game_state', { room_id: roomId });
      } else {
        console.log(`Adicionando get_game_state à fila após criação do canal`);
        pendingCommands.push({ action: 'get_game_state', data: { room_id: roomId } });
      }
    }, 2000);
    return;
  }

  if (gameChannel && isConnected) {
    console.log(`Solicitando estado do jogo para sala ${roomId}`);
    gameChannel.sendCommand('get_game_state', { room_id: roomId });
  } else if (gameChannel) {
    console.log(`Adicionando get_game_state à fila`);
    pendingCommands.push({ action: 'get_game_state', data: { room_id: roomId } });
  } else {
    console.error("Canal WebSocket não criado");
  }
}

export function authenticatePlayer(playerId) {
  if (!gameChannel) {
    console.error("Canal WebSocket não criado");
    return;
  }

  if (gameChannel && isConnected) {
    gameChannel.sendCommand('authenticate', { player_id: playerId });
  } else {
    pendingCommands.push({ action: 'authenticate', data: { player_id: playerId } });
  }
}

export function cleanupAllSubscriptions() {
  console.log(`Limpando todas as subscrições WebSocket`);

  try {
    if (gameChannel) {
      gameChannel.unsubscribe();
    }

    if (cable && cable.subscriptions) {
      cable.subscriptions.subscriptions.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn("Erro ao limpar subscrição:", error);
        }
      });
    }
  } catch (error) {
    console.warn("Erro durante limpeza:", error);
  }

  gameChannel = null;
  isConnected = false;
  pendingCommands = [];
  currentSubscriptionId = null;
}

export default {
  createGameChannel,
  subscribeToGameUpdates,
  unsubscribeFromGame,
  cleanupAllSubscriptions,
  authenticatePlayer,
  requestGameState,
  startGameViaWebSocket,
  sendActionViaWebSocket,
  joinRoomViaWebSocket
};
