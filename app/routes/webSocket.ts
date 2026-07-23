import WebSocket, { WebSocketServer } from 'ws';
import * as gameService from "../services/game/game.service"
import * as jwt from "./../services/authorization/jwt.service"
import { server } from './../main'

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
    let playerId: number | null
    if (req.url && req.url.split('token=')[1]) {
      console.log(jwt.verifyToken(req.url.split('token=')[1]))
      let payload = jwt.verifyToken(req.url.split('token=')[1])
      playerId = payload ? payload.id : null
    }
    ws.send(JSON.stringify({ whoseTurn: "start" }))

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(String(message))
        if (!parsedMessage.event) {
          throw Error("invalidate data")
        }
        if (parsedMessage.event === "start") {
          gameService.startGame(ws, playerId)
        } else {
          gameService.madeStep(ws, parsedMessage.event)
        }
      } catch (err) {
        console.log(err)
      }
    });
    ws.on('close', () => {
      gameService.deleteRoom(ws)
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
