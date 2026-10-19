import { Event } from "./AiGameRoom"
import WebSocket from "ws";
import AiGameRoom from "./AiGameRoom";

export const gameRoomMap = new Map<WebSocket, AiGameRoom>()

export class AiGameService {
    static instance: AiGameService
    gameRoomMap = new Map<WebSocket, AiGameRoom>()

    constructor() {
        if (AiGameService.instance) {
            return AiGameService.instance
        }
        AiGameService.instance = this
    }

    onConnect(ws: WebSocket, player1_Id: number | null) {
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                this.createGame(ws, player1_Id)
                ws.send(JSON.stringify({ info: "enemy is founded", whoseTurn: "start" }))
            }
        }, 1000)

    }

    onMessage(message: WebSocket.RawData, ws: WebSocket) {
        try {
            const parsedMessage = JSON.parse(String(message))
            if (!parsedMessage.event) {
                throw Error("invalidate data")
            }
            if (parsedMessage.event === "start") {
                console.log("Start")
                const gameRoom = this.gameRoomMap.get(ws)
                if (gameRoom) {
                    gameRoom.playerIsReady()
                    console.log("start start")
                } else {
                    console.log(this.gameRoomMap)
                }
            } else {
                this.madeStep(ws, parsedMessage.event)
                console.log("Сделан ход")
            }
        } catch (err) {
            console.log(err)
        }
    }

    onClose(ws: WebSocket) {
        this.deleteRoom(ws)
    }

    createGame(ws: WebSocket, playerId: number | null) {
        if (!this.gameRoomMap.has(ws)) {
            this.gameRoomMap.set(ws, new AiGameRoom(ws, playerId))
        }
        const room = this.gameRoomMap.get(ws)
        if (room) {
            room.resetGame()
            console.log("Партия создана в базе данных")
            ws.send(JSON.stringify({ info: "game is created" }))
        } else {
            new Error("Game room not found")
        }
        
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
        console.log("delete room")
        const gameRoom = this.gameRoomMap.get(ws)
        if (!gameRoom) {
            new Error("Game room not found")
        }
        gameRoom?.closeGame()
        this.gameRoomMap.delete(ws)
    }
}

export const aiGameSerice = new AiGameService()