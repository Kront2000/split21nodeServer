import WebSocket, { WebSocketServer } from 'ws';
import { aiGameSerice, AiGameService } from "../services/game/ai.game.service"
import * as jwt from "./../services/authorization/jwt.service"
import { server } from './../main'
import { PVPGameService, pvpGameService } from '../services/game/pvp.game.service';

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

    let service: AiGameService | PVPGameService

    if (gameType === "ai") {
      service = aiGameSerice
      service.createGame(ws, playerId)
    } else if (gameType === "pvp"){
      service = pvpGameService
      service.findGame(ws, playerId)
    }

    ws.on('message', (message) => {
      service.onMessage(message, ws)
    });

    ws.on('close', () => {
      service.onClose(ws)
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
