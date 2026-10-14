import { Event } from "./AiGameRoom"
import WebSocket from "ws";
import GameRoom from "./AiGameRoom";

export const gameRoomMap = new Map<WebSocket, GameRoom>()

export class AiGameService {
    static instance: AiGameService
    gameRoomMap = new Map<WebSocket, GameRoom>()

    constructor(){
        if(AiGameService.instance){
            return AiGameService.instance
        }
        AiGameService.instance = this
    }

    onConnect(ws: WebSocket, player1_Id: number | null){
        ws.send(JSON.stringify({ whoseTurn: "start" }))
    }

    onMessage(message: WebSocket.RawData, ws: WebSocket) {
        try {
            const parsedMessage = JSON.parse(String(message))
            if (!parsedMessage.event) {
                throw Error("invalidate data")
            }
            if (parsedMessage.event === "start") {
                this.startGame(ws)
                console.log("Партия начата")
            } else {
                this.madeStep(ws, parsedMessage.event)
                console.log("Сделан ход")
            }
        } catch (err) {
            console.log(err)
        }
    }

    onClose(ws: WebSocket){
        this.deleteRoom(ws)
    }

    createGame(ws: WebSocket, playerId: number | null) {
        if (!this.gameRoomMap.has(ws)) {
            this.gameRoomMap.set(ws, new GameRoom(ws, playerId))
        }
        const room = gameRoomMap.get(ws)
        if (room) {
            room.resetGame()
            ws.send(JSON.stringify({ info: "game is created" }))
        } else {
            new Error("Game room not found")
        }
        console.log("Партия создана в базе данных")
        return room
    }

    startGame(ws: WebSocket) {
        const room = this.gameRoomMap.get(ws)
        if (room) {
            void room.startGame().catch((error) => {
                console.error("Failed to start AI game:", error)
            })
        } else {
            new Error("Game room not found")
        }
        return room
    }

    madeStep(ws: WebSocket, event: Event) {
        const gameRoom = this.gameRoomMap.get(ws)
        if (!gameRoom) {
            new Error("Game room not found")
        }
        gameRoom?.madeStep(event)
    }

    deleteRoom(ws: WebSocket) {
        const gameRoom = this.gameRoomMap.get(ws)
        if (!gameRoom) {
            new Error("Game room not found")
        }
        gameRoom?.closeGame()
        this.gameRoomMap.delete(ws)
    }
}

export const aiGameSerice = new AiGameService()