import WebSocket, { WebSocketServer } from 'ws';
import * as game from "../services/game/game.service"
import { SessionObject, sessionMap, Card } from './../services/game/gameSession.service';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * (Math.pow(10, max)))
}

export const webSocketMap = new Map<number, WebSocket>()

const wss = new WebSocketServer({ port: 8000 });
console.log("Вебсокет сервер запущен...")
wss.on('connection', (ws, req,) => {
  console.log('Новый клиент подключился!');
  console.log(sessionMap)
  const index = getRandomInt(10);
  webSocketMap.set(index, ws);
  game.startGame(index, ws)

  ws.on('message', (message) => {
    try {
      console.log(sessionMap)
      console.log(`Получено сообщение: ${message}`);
      const parsedMessage = JSON.parse(String(message))
      if (!parsedMessage.event) {
        throw Error("invalidate data")
      } else if (parsedMessage.event === "restart") {
        game.startGame(index, ws)
      } else {
        game.madeStep(parsedMessage.event, index, ws)
      }

    } catch (err) {
      console.log(err)
    }

  });

  ws.on('close', () => {
    console.log('Клиент отключился');
    sessionMap.delete(index)
    console.log(sessionMap)
  });
});