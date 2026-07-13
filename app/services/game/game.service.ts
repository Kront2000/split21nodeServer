import { SessionObject, sessionMap, Card } from "./gameSession.service";

import getAction from "../getAction.service";
import WebSocket from "ws";

type Event = "take" | "pass"

interface MadeStepResponse {
    enemyEvent?: Event,
    win?: "none" | "user" | "enemy",
    winMessage?: string,
    userDeck?: Card[],
    takeCard?: Card,
    countOfDeckEnemy?: number,
    enemyMessage?: string,
    whoseTurn?: string,
}

export function startGame(playerWebSocketId: number, ws: WebSocket): void {
    if (sessionMap.size < 1 || !sessionMap.has(playerWebSocketId)) {
        sessionMap.set(playerWebSocketId, new SessionObject(playerWebSocketId))
    }
    const sessionObject = sessionMap.get(playerWebSocketId)
    if (!sessionObject) {
        console.log(playerWebSocketId)
        console.log(ws)
        console.log(sessionMap)
        throw Error("error")
    }
    sessionObject.resetGame()
    let card = sessionObject.enemyTakeCard();
    sessionObject.setHistoryOfGame("Начало игры");
    sessionObject.setHistoryOfGame(`Противник получил - ${card.name} ${card.suit}`)
    card = sessionObject.userTakeCard();
    ws.send(JSON.stringify({
        takeCard: card,
        whoseTurn: "user",
        countOfDeckEnemy: sessionObject.cardsOfEnemy.length
    }))
}

export async function madeStep(event: Event, playerWebSocketId: number, ws: WebSocket): Promise<void> {
    const sessionObject = sessionMap.get(playerWebSocketId)
    if (!sessionObject) {
        throw Error("error")
    }
    sessionObject.setWhoseTurn("enemy")
    ws.send(JSON.stringify({ whoseTurn: "enemy" }))
    if (event == "take") {
        const card = sessionObject.userTakeCard()
        sessionObject.setHistoryOfGame("Пользователь взял карту")
        if (sessionObject.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0) > 21) {
            ws.send(JSON.stringify({
                win: "enemy",
                winMessage: "Вы набрали больше чем 21 очко. Вы проиграли :("
            }))
            sessionMap.delete(playerWebSocketId)
        } else {
            if (sessionObject.enemyIsPass) {
                ws.send(JSON.stringify({
                    win: "none",
                    takeCard: card,
                    userDeck: sessionObject.cardsOfUser,
                    countOfDeckEnemy: sessionObject.cardsOfEnemy.length
                }))
            } else {
                const res = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                if (res.event == "take" && !sessionObject.enemyIsPass) {
                    const card = sessionObject.enemyTakeCard()
                    ws.send(JSON.stringify({ enemyMessage: res.message }))
                    if (sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0) > 21) {
                        ws.send(JSON.stringify({
                            win: "user",
                            winMessage: "Противник набрал больше 21-го очка. Вы выйграли!! :)"
                        }))
                        sessionMap.delete(playerWebSocketId)
                    } else {
                        sessionObject.setHistoryOfGame(`Противник получает карту ${card.suit} ${card.name}`)
                        sessionObject.setWhoseTurn('user')
                        ws.send(JSON.stringify({ enemyEvent: "take", countOfDeckEnemy: sessionObject.cardsOfEnemy.length, whoseTurn: 'user' }))
                    }
                } else {
                    ws.send(JSON.stringify({ enemyEvent: "pass", enemyMessage: res.message, whoseTurn: "user" }))
                    sessionObject.setEnemyIsPass()
                    sessionObject.setWhoseTurn("user")
                }
            }
        }

    } else if (event == "pass") {
        sessionObject.setHistoryOfGame("Игрок пасс")
        if (sessionObject.enemyIsPass) {
            if (sessionObject.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0) > sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)) {
                ws.send(JSON.stringify({
                    win: "enemy",
                    winMessage: "Вы набрали больше очко чем противник. Вы выйграли :)"
                }))
                sessionMap.delete(playerWebSocketId)
            } else {
                ws.send(JSON.stringify({
                    win: "enemy",
                    winMessage: "Противник набрал больше очко чем вы. Вы проиграли :("
                }))
                sessionMap.delete(playerWebSocketId)
            }
        } else {
            const res = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
            if (res.event == "take") {
                const card = sessionObject.enemyTakeCard()
                ws.send(JSON.stringify({ enemyMessage: res.message }))
                if (sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0) > 21) {
                    ws.send(JSON.stringify({
                        win: "user",
                        winMessage: "Противник набрал больше 21-го очка. Вы выйграли!! :)"
                    }))
                    sessionMap.delete(playerWebSocketId)
                } else {
                    ws.send(JSON.stringify({
                        enemyEvent: "take",
                        countOfDeckEnemy: sessionObject.cardsOfEnemy
                    }))
                }
            } else if (res.event == "pass") {
                if (sessionObject.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0) > sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)) {
                    ws.send(JSON.stringify({
                        win: "user",
                        winMessage: "Вы набрали больше очко чем противник. Вы выйграли :)"
                    }))
                    sessionMap.delete(playerWebSocketId)
                } else {
                    ws.send(JSON.stringify({
                        win: "enemy",
                        winMessage: "Противник набрал больше очко чем вы. Вы проиграли :("
                    }))
                    sessionMap.delete(playerWebSocketId)
                }
            }
        }
    }
}