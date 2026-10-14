import { Event } from "./PVPGameRoom"
import WebSocket from "ws";
import PVPGameRoom from "./PVPGameRoom";



interface PlayerInQueue {
    ws: WebSocket,
    player_id?: number
}

export class PVPGameService {
    static instance: PVPGameService
    playerQueue: PlayerInQueue[] = []
    gameRoomMap = new Map<WebSocket[], PVPGameRoom>()

    constructor() {
        if (PVPGameService.instance) {
            return PVPGameService.instance
        }
        PVPGameService.instance = this
    }

    onConnect(ws: WebSocket, player_Id: number | null) {
        ws.send(JSON.stringify({ whoseTurn: "start", info: "finding enemy" }))
        this.findGame(ws, player_Id)
        console.log("player is connected")
    }

    onMessage(message: WebSocket.RawData, ws: WebSocket) {
        try {
            const parsedMessage = JSON.parse(String(message))
            if (!parsedMessage.event) {
                throw Error("invalidate data")
            }
            if (parsedMessage.event === "start") {
                let gameRoom: PVPGameRoom | null = null
                for (let arr of this.gameRoomMap) {
                    if (arr[0].includes(ws)) {
                        gameRoom = arr[1]
                    }
                }
                gameRoom?.playerIsReady(ws)
            } else {
                this.madeStep(ws, parsedMessage.event)
                console.log("Сделан ход")
            }


        } catch (err) {
            console.log(err)
        }
    }

    onClose(ws: WebSocket) {
        this.playerQueue.forEach((value, key) => {
            if (value.ws === ws){
                console.log(this.playerQueue)
                this.playerQueue.splice(key, 1)
                console.log(this.playerQueue)
                return
            }
        })
        
        this.deleteRoom(ws)
    }

    findGame(ws: WebSocket, player_id: number | null) {
        if (this.playerQueue.length === 0) {
            this.playerQueue.push({ ws: ws, player_id: player_id ? player_id : undefined })
            console.log("Добавили в очередь")
            console.log(this.playerQueue)
        } else {
            const player2 = this.playerQueue.shift()
            if (player2) {
                this.gameRoomMap.set([ws, player2.ws], new PVPGameRoom(ws, player_id, player2.ws, player2.player_id ?? null))
                console.log(this.playerQueue)
                console.log("Очередь после того как нашли пользователя")
                console.log(ws === player2.ws)
                ws.send(JSON.stringify({ info: "enemy is founded", whoseTurn: "start" }))
                player2.ws.send(JSON.stringify({ info: "enemy is founded", whoseTurn: "start" }))
            } else {
                console.log("Пользователь не найден в очереди pvp.game.service")
            }
        }
    }

    madeStep(ws: WebSocket, event: Event) {
        let gameRoom: PVPGameRoom | null = null
        for (let arr of this.gameRoomMap) {
            if (arr[0].includes(ws)) {
                gameRoom = arr[1]
            }
        }
        if (!gameRoom) {
            new Error("Game room not found")
        }
        gameRoom?.madeStep(event, ws)
    }

    deleteRoom(ws: WebSocket) {
        let gameRoom: PVPGameRoom | null = null
        let key: WebSocket[] | null = null
        for (let arr of this.gameRoomMap) {
            if (arr[0].includes(ws)) {
                gameRoom = arr[1]
                key = arr[0]
            }
        }
        if (!gameRoom || !key) {
            new Error("Game room not found")
        } else {
            gameRoom?.closeGame()
            this.gameRoomMap.delete(key)
        }
    }
}

export const pvpGameService = new PVPGameService()


