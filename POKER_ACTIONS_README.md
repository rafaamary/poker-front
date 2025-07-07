# Funcionalidade de Ações do Poker

## ✅ Implementado

### 1. Integração com Backend
- **Envio de ações**: Todas as ações (check, call, raise, fold) são enviadas para o backend via API
- **WebSocket**: Configurado para receber atualizações em tempo real do estado do jogo
- **Validação**: Ações são validadas antes de serem enviadas

### 2. Gerenciamento de Turnos
- **Controle de turnos**: O sistema rastreia qual jogador deve agir
- **Indicadores visuais**: 
  - 🎯 indica o jogador atual
  - ✓ indica jogadores que já agiram
  - Bordas coloridas para diferentes estados

### 3. Progressão de Fases
- **Detecção automática**: Quando todos os jogadores ativos agiram, o sistema automaticamente avança para a próxima fase
- **Reset de turnos**: A cada nova fase, o controle de quem já agiu é resetado
- **Delay inteligente**: Pequeno delay antes de avançar fase para melhor experiência do usuário

### 4. APIs Utilizadas

#### `actionGame(roomId, playerId, action, amount)`
- Envia uma ação do jogador para o backend
- **Parâmetros**: 
  - `roomId`: ID da sala
  - `playerId`: ID do jogador
  - `action`: Tipo da ação (check, call, raise, fold)
  - `amount`: Valor da aposta (opcional)

#### `nextPhase(roomId)`
- Avança o jogo para a próxima fase
- **Parâmetro**: `roomId`: ID da sala
- **Chamado automaticamente** quando todos jogaram

### 5. Estados do Jogo

#### Fases do Jogo:
- `waiting`: Aguardando jogadores
- `pre-flop`: Antes das cartas comunitárias
- `flop`: Primeiras 3 cartas comunitárias
- `turn`: 4ª carta comunitária
- `river`: 5ª carta comunitária
- `showdown`: Revelação das cartas

#### Ações Disponíveis:
- `check`: Passar a vez sem apostar
- `call`: Igualar a aposta atual
- `raise`: Aumentar a aposta
- `fold`: Desistir da mão

### 6. Validações Implementadas

- **Check**: Só permitido se não há aposta para igualar
- **Call**: Só permitido se há aposta para igualar
- **Raise**: Verifica se o jogador tem chips suficientes
- **Fold**: Sempre permitido
- **Jogador ativo**: Verifica se o jogador pode agir (não foldou, etc.)

### 7. Interface Melhorada

- **Indicadores visuais** para estado dos jogadores
- **Mensagens informativas** sobre ações e erros
- **Fase atual** exibida na mesa
- **Última ação** de cada jogador
- **Desabilitação inteligente** dos botões quando não é sua vez

## 🔄 Fluxo de Funcionamento

1. **Jogador clica em uma ação** (check, call, raise, fold)
2. **Validação local** da ação
3. **Envio para o backend** via API
4. **Atualização local temporária** do estado
5. **Marcação do jogador** como tendo agido
6. **Verificação automática** se todos agiram
7. **Se todos agiram**: Chama `nextPhase()` automaticamente
8. **Reset do controle** de turnos para a nova fase
9. **Recebimento via WebSocket** do novo estado do jogo

## 🎮 Como Usar

```jsx
// No componente GameModal, os botões já estão configurados:
<button disabled={!isYourTurn} onClick={() => sendAction("check")}>Check</button>
<button disabled={!isYourTurn} onClick={() => sendAction("raise", 50)}>Bet $50</button>
<button disabled={!isYourTurn} onClick={() => sendAction("call")}>Call</button>
<button disabled={!isYourTurn} onClick={() => sendAction("fold")}>Fold</button>
```

## 🚀 Próximos Passos

Para completar a implementação:

1. **Backend**: Garantir que as rotas `/rooms/:id/action` e `/rooms/:id/next-phase` estejam implementadas
2. **WebSocket**: Configurar o GameChannel no backend para broadcast das atualizações
3. **Teste**: Testar com múltiplos jogadores em uma sala
4. **Refinamentos**: Adicionar mais validações e melhorar a UI conforme necessário
