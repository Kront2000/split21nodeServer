import WebSocket from "ws";
import { randomaizer } from './../../utils/randomaizer'
import { deck } from './gameConsts'
import getAction from "../getAction.service";
import * as userService from './../user/user.service'
import { gameRoomMap } from './game.service';

export interface Card {
    id: number;
    name: string;
    suit: string;
    value: number;
}

interface SendMessage {
    enemyEvent?: Event,
    win?: "none" | "user" | "enemy",
    winMessage?: string,
    userDeck?: Card[],
    takeCard?: Card,
    countOfDeckEnemy?: number,
    enemyMessage?: string,
    whoseTurn?: string,
}

type WhoseTurnEnum = 'user' | 'enemy'

export type Event = "take" | "pass"

export default class GameRoom {
    ws: WebSocket
    playerId: number | null
    hasStart = false
    whoseTurn: WhoseTurnEnum = "user"
    stepCount = 0
    historyOfGame: string[] = []
    cardsOfUser: Card[] = []
    cardsOfEnemy: Card[] = []
    userIsPass = false
    enemyIsPass = false
    mainDeck: Card[] = []

    constructor(ws: WebSocket, playerId: number | null) {
        this.mainDeck = deck
        this.ws = ws
        this.playerId = playerId
    }

    get valueOfEnemyDeck() {
        return this.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)
    }
    get valueOfUserDeck() {
        return this.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0)
    }

    resetGame() {
        this.hasStart = false
        this.whoseTurn = "user"
        this.stepCount = 0
        this.historyOfGame = []
        this.cardsOfUser = []
        this.cardsOfEnemy = []
        this.userIsPass = false
        this.enemyIsPass = false
        this.mainDeck = []
        this.mainDeck = deck.slice()
    }

    async startGame() {
        if (!this.hasStart) {
            let card = this.enemyTakeCard();
            this.setHistoryOfGame("Начало игры");
            this.setHistoryOfGame(`Противник получил - ${card.name} ${card.suit}`)
            card = this.userTakeCard();
            this.ws.send(JSON.stringify({
                takeCard: card,
                whoseTurn: "user",
                userDeck: this.cardsOfUser,
                countOfDeckEnemy: this.cardsOfEnemy.length
            }))
        }
    }

    enemyTakeCard() {
        let index = randomaizer(0, this.mainDeck.length - 1);
        const card = this.mainDeck[index]
        this.addCardToEnemyDeck(this.mainDeck[index]);
        this.deleteCardFromMainDeck(index);
        return card
    }
    userTakeCard() {
        let index = randomaizer(0, this.mainDeck.length - 1);
        const card = this.mainDeck[index]
        this.addCardToUserDeck(this.mainDeck[index]);
        this.deleteCardFromMainDeck(index);
        return card
    }
    setUserIsPass() {
        this.userIsPass = true
    }
    setEnemyIsPass() {
        this.enemyIsPass = true
    }
    deleteCardFromMainDeck(id: number) {
        this.mainDeck = this.mainDeck.filter((card) => card.id !== id)
    }
    addCardToUserDeck(card: Card) {
        this.cardsOfUser.push(card)
    }
    addCardToEnemyDeck(card: Card) {
        this.cardsOfEnemy.push(card)
    }
    incrementStepCount() {
        this.stepCount += 1
    }
    setWhoseTurn(who: WhoseTurnEnum) {
        this.whoseTurn = who
    }

    setHistoryOfGame(event: string) {
        this.historyOfGame.push(event)
    }

    async win(who: "user" | "enemy" | "none", message: string) {
        const finalRes = await getAction(this.historyOfGame, this.valueOfEnemyDeck)
        this.ws.send(JSON.stringify({
            enemyMessage: finalRes.message,
            win: who,
            winMessage: "Вы набрали больше чем 21 очко. Вы проиграли :("
        }))
        if (this.playerId && who == 'enemy') {
            userService.clearScoreById(this.playerId)
        } else if (this.playerId && who == 'user') {
            userService.incrementScoreById(this.playerId)
        }
        gameRoomMap.delete(this.ws)
    }

    async send(props: SendMessage) {
        this.ws.send(JSON.stringify(props))
    }

    async madeStep(event: Event): Promise<void> {
        console.log(this.playerId)
        this.setWhoseTurn("enemy")
        this.ws.send(JSON.stringify({ whoseTurn: "enemy" }))
        if (event == "take") {
            const card = this.userTakeCard()
            this.ws.send(JSON.stringify({ takeCard: card, userDeck: this.cardsOfUser, }))
            this.setHistoryOfGame("Пользователь взял карту")
            if (this.valueOfUserDeck > 21) {
                this.setHistoryOfGame("Игрок набрал больше 21-го очка. Игрок проиграл")


            } else {
                if (this.enemyIsPass) {
                    this.ws.send(JSON.stringify({ takeCard: card, userDeck: this.cardsOfUser, countOfDeckEnemy: this.cardsOfEnemy.length }))
                } else {
                    const res = await getAction(this.historyOfGame, this.valueOfEnemyDeck)
                    if (res.event == "take" && !this.enemyIsPass) {
                        const card = this.enemyTakeCard()
                        this.ws.send(JSON.stringify({ enemyMessage: res.message }))
                        if (this.valueOfEnemyDeck > 21) {
                            this.setHistoryOfGame("Противник набрал больше 21-го очка. Игрок выйграл")
                            this.win("user", "Противник набрал больше 21-го очка. Вы выйграли!! :)")
                        } else {
                            this.setHistoryOfGame(`Противник получает карту ${card.suit} ${card.name}`)
                            this.setWhoseTurn('user')
                            this.ws.send(JSON.stringify({ enemyEvent: "take", countOfDeckEnemy: this.cardsOfEnemy.length, whoseTurn: 'user' }))
                        }
                    } else {
                        this.ws.send(JSON.stringify({ enemyEvent: "pass", enemyMessage: res.message, whoseTurn: "user" }))
                        this.setEnemyIsPass()
                        this.setWhoseTurn("user")
                    }
                }
            }

        } else if (event == "pass") {
            this.setHistoryOfGame("Игрок пасс")
            if (this.enemyIsPass) {
                if (this.valueOfUserDeck > this.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)) {
                    this.setHistoryOfGame("Игрок набрал больше очков чем у противника. Игрок выйграл")
                    this.win("user", "Вы набрали больше очков чем противник. Вы выйграли :)")
                } else {
                    this.setHistoryOfGame("Противник набрал больше очков чем игрок. Игрок проиграл")
                    this.win("enemy", "Противник набрал больше очко чем вы. Вы проиграли :(")
                }
            } else {
                const res = await getAction(this.historyOfGame, this.valueOfEnemyDeck)
                if (res.event == "take") {
                    const card = this.enemyTakeCard()
                    this.ws.send(JSON.stringify({ enemyMessage: res.message }))
                    if (this.valueOfEnemyDeck > 21) {
                        this.setHistoryOfGame("Противник набрал больше 21-го очка. Игрок выйграл")
                        this.win("user", "Противник набрал больше 21-го очка. Вы выйграли!! :)")
                    } else {
                        this.ws.send(JSON.stringify({ enemyEvent: "take", countOfDeckEnemy: this.cardsOfEnemy.length }))
                        await setTimeout(() => { this.madeStep("pass") }, 3000)
                    }
                } else if (res.event == "pass") {
                    if (this.valueOfUserDeck > this.valueOfEnemyDeck) {
                        this.setHistoryOfGame("Игрок набрал больше очков чем у противника. Игрок выйграл")
                        this.win("user", "Вы набрали больше очко чем противник. Вы выйграли :)")
                    } else {
                        this.setHistoryOfGame("Противник набрал больше очков чем игрок. Игрок проиграл")
                        this.win("enemy", "Противник набрал больше очко чем вы. Вы проиграли :(")
                    }
                }
            }
        }
    }

}

