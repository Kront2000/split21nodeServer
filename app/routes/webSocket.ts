import WebSocket, { WebSocketServer } from 'ws';
import * as aiGameService from "../services/game/ai.game.service"
import * as jwt from "./../services/authorization/jwt.service"
import { server } from './../main'

function onSocketError(err: any) {
  console.error(err);
}

interface WebSocketData {
  playerId: number | undefined
  ws: WebSocket
}

// export const webSocketMap = new Map<number, WebSocketData>()

export function startWebSocket() {
  const wss = new WebSocketServer({ noServer: true });
  console.log("Вебсокет сервер запущен...")
  wss.on('connection', (ws, req,) => {
    let playerId: number | null = null
    let typeOfGame: "ai" | "pvp" | "qr" | null = null
    let roomId: number | null = null

    const params = new URL(req.url ?? "", `http://${req.headers.host}`).searchParams;

    const token = params.get("token");

    if (token) {
      const payload = jwt.verifyToken(token);
      playerId = payload ? payload.id ?? null : null;
    }

    const gameType = params.get("type");
    if (gameType === "ai" || gameType === "pvp" || gameType === "qr") {
      typeOfGame = gameType;
    }

    const room = params.get("room");
    if (room !== null) {
      const parsedRoomId = Number(room);
      roomId = Number.isInteger(parsedRoomId) ? parsedRoomId : null;
    }

    if (gameType === "ai") {
      aiGameService.createGame(ws, playerId)
    }

    ws.send(JSON.stringify({ whoseTurn: "start" }))

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(String(message))
        if (!parsedMessage.event) {
          throw Error("invalidate data")
        }
        if (parsedMessage.event === "start") {
          aiGameService.startGame(ws)
          console.log("Партия начата")
        } else {
          aiGameService.madeStep(ws, parsedMessage.event)
          console.log("Сделан ход")
        }
      } catch (err) {
        console.log(err)
      }
    });

    ws.on('close', () => {
      aiGameService.deleteRoom(ws)
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
