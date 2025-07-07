import { createConsumer } from "@rails/actioncable";

const cable = createConsumer("ws://localhost:3000/cable");

const gameChannel = cable.subscriptions.create("GameChannel", {
  connected() {
    console.log("Conectado ao GameChannel");
  },

  disconnected() {
    console.log("Desconectado do GameChannel");
  },

  received(data) {
    console.log("Mensagem recebida:", data);
  }
});

export default gameChannel;
