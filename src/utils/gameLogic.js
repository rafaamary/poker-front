// Utilitários para lógica do jogo de poker

export const GAME_PHASES = {
  PRE_FLOP: 'pre-flop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown'
};

export const ACTIONS = {
  CHECK: 'check',
  CALL: 'call',
  RAISE: 'raise',
  FOLD: 'fold',
  ALL_IN: 'all_in'
};

/**
 * Verifica se todos os jogadores ativos já agiram na rodada atual
 * @param {Array} players - Lista de jogadores
 * @param {Set} playersWhoActed - Set com IDs dos jogadores que já agiram
 * @returns {boolean}
 */
export function allPlayersActed(players, playersWhoActed) {
  const activePlayers = players.filter(player => 
    player.status !== 'folded' &&
    player.status !== 'all_in' &&
    player.chips > 0
  );
  
  return activePlayers.every(player => playersWhoActed.has(player.id));
}

/**
 * Determina a próxima fase do jogo
 * @param {string} currentPhase - Fase atual do jogo
 * @returns {string}
 */
export function getNextPhase(currentPhase) {
  const phases = Object.values(GAME_PHASES);
  const currentIndex = phases.indexOf(currentPhase);
  
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return GAME_PHASES.SHOWDOWN;
  }
  
  return phases[currentIndex + 1];
}

/**
 * Valida se uma ação é válida para o jogador atual
 * @param {Object} player - Jogador que está fazendo a ação
 * @param {string} action - Ação a ser validada
 * @param {number} amount - Valor da aposta (se aplicável)
 * @param {Object} gameState - Estado atual do jogo
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateAction(player, action, amount, gameState) {
  if (!player || player.status === 'folded') {
    return { valid: false, error: 'Jogador não pode agir' };
  }

  switch (action) {
    case ACTIONS.CHECK:
      // Só pode dar check se não há aposta para igualar
      if (gameState.currentBet > player.currentBet) {
        return { valid: false, error: 'Não é possível dar check, há uma aposta para igualar' };
      }
      return { valid: true };

    case ACTIONS.CALL:
      // Só pode dar call se há uma aposta para igualar
      if (gameState.currentBet <= player.currentBet) {
        return { valid: false, error: 'Não há aposta para igualar' };
      }
      return { valid: true };

    case ACTIONS.RAISE:
      if (amount <= 0) {
        return { valid: false, error: 'Valor da aposta deve ser maior que zero' };
      }
      if (amount > player.chips) {
        return { valid: false, error: 'Não há chips suficientes' };
      }
      return { valid: true };

    case ACTIONS.FOLD:
      return { valid: true };

    case ACTIONS.ALL_IN:
      return { valid: true };

    default:
      return { valid: false, error: 'Ação inválida' };
  }
}
