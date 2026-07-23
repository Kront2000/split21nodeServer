import { Event } from "./GameRoom"
import WebSocket from "ws";
import GameRoom from "./GameRoom";

export const gameRoomMap = new Map<WebSocket, GameRoom>()


export function startGame(ws: WebSocket, playerId: number | null) {
    if (!gameRoomMap.has(ws)) {
        gameRoomMap.set(ws, new GameRoom(ws, playerId))
    }
    const room = gameRoomMap.get(ws)
    if (room) {
        room.resetGame()
        room.startGame()
    } else {
        new Error("Game room not found")
    }
    return room
}

export function madeStep(ws: WebSocket, event: Event) {
    const gameRoom = gameRoomMap.get(ws)
    if (!gameRoom) {
        new Error("Game room not found")
    }
    gameRoom?.madeStep(event)

}

export function deleteRoom(ws: WebSocket){
    gameRoomMap.delete(ws)
}

