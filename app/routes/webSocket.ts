import WebSocket, { WebSocketServer } from 'ws';
import * as game from "../services/game/game.service"
import { sessionMap } from './../services/game/gameSession.service';
import * as jwt from "./../services/authorization/jwt.service"
import { server } from './../main'


function getRandomInt(max: number) {
  return Math.floor(Math.random() * (Math.pow(10, max)))
}

function onSocketError(err: any) {
  console.error(err);
}

interface WebSocketData {
  playerId: number | undefined
  ws: WebSocket
}

export const webSocketMap = new Map<number, WebSocketData>()

export function startWebSocket() {
  const wss = new WebSocketServer({ noServer: true });
  console.log("Вебсокет сервер запущен...")
  wss.on('connection', (ws, req,) => {
    let playerId: number | undefined
    if (req.url && req.url.split('token=')[1]) {
      let payload = jwt.verifyToken(req.url.split('token=')[1])
      if (payload) {
        playerId = payload.id
      }
    }
    const index = getRandomInt(10);
    webSocketMap.set(index, { playerId: playerId, ws: ws });
    ws.send(JSON.stringify({ whoseTurn: "start" }))

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(String(message))
        if (!parsedMessage.event) {
          throw Error("invalidate data")
        } else if (parsedMessage.event === "start") {
          game.startGame(index, ws)
        } else {
          game.madeStep(parsedMessage.event, index, ws, playerId)
        }

      } catch (err) {
        console.log(err)
      }

    });

    ws.on('close', () => {
      sessionMap.delete(index)
    });
  });

  server.on('upgrade', function upgrade(request, socket, head) {

    socket.on('error', onSocketError);
    socket.removeListener('error', onSocketError);

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });

}
