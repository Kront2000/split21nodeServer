import { SessionObject, sessionMap } from "./gameSession.service";
import getAction from "../getAction.service";
import WebSocket from "ws";
import * as userService from "./../user/user.service"

type Event = "take" | "pass"

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
        userDeck: sessionObject.cardsOfUser,
        countOfDeckEnemy: sessionObject.cardsOfEnemy.length
    }))
}

export async function madeStep(event: Event, playerWebSocketId: number, ws: WebSocket, playerId: number | undefined): Promise<void> {
    const sessionObject = sessionMap.get(playerWebSocketId)
    if (!sessionObject) {
        throw Error("Данная сессия не найдена")
    }
    sessionObject.setWhoseTurn("enemy")
    ws.send(JSON.stringify({ whoseTurn: "enemy" }))
    if (event == "take") {
        const card = sessionObject.userTakeCard()
        ws.send(JSON.stringify({
            takeCard: card,
            userDeck: sessionObject.cardsOfUser,
        }))
        sessionObject.setHistoryOfGame("Пользователь взял карту")
        if (sessionObject.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0) > 21) {
            sessionObject.setHistoryOfGame("Игрок набрал больше 21-го очка. Игрок проиграл")
            const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
            ws.send(JSON.stringify({
                enemyMessage: finalRes.message,
                win: "enemy",
                winMessage: "Вы набрали больше чем 21 очко. Вы проиграли :("
            }))
            if (playerId) {
                userService.clearScoreById(playerId)
            }
            sessionMap.delete(playerWebSocketId)
        } else {
            if (sessionObject.enemyIsPass) {
                ws.send(JSON.stringify({
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
                        sessionObject.setHistoryOfGame("Противник набрал больше 21-го очка. Игрок выйграл")
                        const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                        ws.send(JSON.stringify({
                            enemyMessage: finalRes.message,
                            win: "user",
                            winMessage: "Противник набрал больше 21-го очка. Вы выйграли!! :)"
                        }))
                        if (playerId) {
                            userService.incrementScoreById(playerId)
                        }
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
                sessionObject.setHistoryOfGame("Игрок набрал больше очков чем у противника. Игрок выйграл")
                const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                ws.send(JSON.stringify({
                    enemyMessage: finalRes.message,
                    win: "enemy",
                    winMessage: "Вы набрали больше очков чем противник. Вы выйграли :)"
                }))
                if (playerId) {
                    userService.incrementScoreById(playerId)
                }
                sessionMap.delete(playerWebSocketId)
            } else {
                sessionObject.setHistoryOfGame("Противник набрал больше очков чем игрок. Игрок проиграл")
                const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                ws.send(JSON.stringify({
                    enemyMessage: finalRes.message,
                    win: "enemy",
                    winMessage: "Противник набрал больше очко чем вы. Вы проиграли :("
                }))
                if (playerId) {
                    userService.clearScoreById(playerId)
                }
                sessionMap.delete(playerWebSocketId)
            }
        } else {
            const res = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
            if (res.event == "take") {
                const card = sessionObject.enemyTakeCard()
                ws.send(JSON.stringify({ enemyMessage: res.message }))
                if (sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0) > 21) {
                    sessionObject.setHistoryOfGame("Противник набрал больше 21-го очка. Игрок выйграл")
                    const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                    ws.send(JSON.stringify({
                        enemyMessage: finalRes.message,
                        win: "user",
                        winMessage: "Противник набрал больше 21-го очка. Вы выйграли!! :)"
                    }))
                    if (playerId) {
                        userService.incrementScoreById(playerId)
                    }
                    sessionMap.delete(playerWebSocketId)
                } else {
                    ws.send(JSON.stringify({
                        enemyEvent: "take",
                        countOfDeckEnemy: sessionObject.cardsOfEnemy.length
                    }))
                    await setTimeout(() => { madeStep("pass", playerWebSocketId, ws, playerId) }, 3000)
                }
            } else if (res.event == "pass") {
                if (sessionObject.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0) > sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)) {
                    sessionObject.setHistoryOfGame("Игрок набрал больше очков чем у противника. Игрок выйграл")
                    const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                    ws.send(JSON.stringify({
                        enemyMessage: finalRes.message,
                        win: "user",
                        winMessage: "Вы набрали больше очко чем противник. Вы выйграли :)"
                    }))
                    if (playerId) {
                        userService.incrementScoreById(playerId)
                    }
                    sessionMap.delete(playerWebSocketId)
                } else {
                    sessionObject.setHistoryOfGame("Противник набрал больше очков чем игрок. Игрок проиграл")
                    const finalRes = await getAction(sessionObject.historyOfGame, sessionObject.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0))
                    ws.send(JSON.stringify({
                        enemyMessage: finalRes.message,
                        win: "enemy",
                        winMessage: "Противник набрал больше очко чем вы. Вы проиграли :("
                    }))
                    if (playerId) {
                        userService.clearScoreById(playerId)
                    }
                    sessionMap.delete(playerWebSocketId)
                }
            }
        }
    }
}