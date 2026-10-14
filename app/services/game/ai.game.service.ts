import { Event } from "./AiGameRoom"
import WebSocket from "ws";
import GameRoom from "./AiGameRoom";

export const gameRoomMap = new Map<WebSocket, GameRoom>()


export function createGame(ws: WebSocket, playerId: number | null) {
    if (!gameRoomMap.has(ws)) {
        gameRoomMap.set(ws, new GameRoom(ws, playerId))
    }
    const room = gameRoomMap.get(ws)
    if (room) {
        room.resetGame()
        ws.send(JSON.stringify({info: "game is created"}))
    } else {
        new Error("Game room not found")
    }
    console.log("Партия создана в базе данных")
    return room
}

export function startGame(ws: WebSocket) {
    const room = gameRoomMap.get(ws)
    if (room) {
        void room.startGame().catch((error) => {
            console.error("Failed to start AI game:", error)
        })
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
    const gameRoom = gameRoomMap.get(ws)
    if (!gameRoom) {
        new Error("Game room not found")
    }
    gameRoom?.closeGame()
    gameRoomMap.delete(ws)
}
