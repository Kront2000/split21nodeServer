import WebSocket from "ws";
import { randomaizer } from '../../utils/randomaizer'
import { deck } from './gameConsts'
import getAction from "../getAction.service";
import * as userService from '../user/user.service'
import * as gameService from './game.service'
import { PVPGameService, pvpGameService } from "./pvp.game.service";



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
    info?: string,
    enemyName?: string,
    enemyRating?: string
}

type WhoseTurnEnum = 'player1' | 'player2'

export type Event = "take" | "pass"

export default class AiGameRoom {
    ws1: WebSocket
    ws2: WebSocket
    player1_Id: number = 0
    player2_Id: number = 0
    hasStart = false
    whoseTurn: WhoseTurnEnum = "player1"
    stepCount = 0
    historyOfGame: string[] = []
    cardsOfPlayer1: Card[] = []
    cardsOfPlayer2: Card[] = []
    player1IsPass = false
    player2IsPass = false
    mainDeck: Card[] = []
    raitingOfPlayer1BeforeGame: number = 0
    raitingOfPlayer2BeforeGame: number = 0
    gameId: number = 0
    ratingPlayer1BeforeGame: number = 0
    ratingPlayer2BeforeGame: number = 0
    player1_isReady: boolean = false
    player2_isReady: boolean = false

    constructor(ws1: WebSocket, player1_Id: number | null = null, ws2: WebSocket, player2_Id: number | null) {
        this.mainDeck = deck
        this.ws1 = ws1
        this.ws2 = ws2
        this.player1_Id = player1_Id ? player1_Id : 0
        this.player2_Id = player2_Id ? player2_Id : 0
        console.log("Комната создана. player1_id: " + player1_Id + " player2_Id: " + player2_Id + "Кол-во комнат: " + PVPGameService.instance.gameRoomMap.size)
    }

    playerIsReady(ws: WebSocket) {
        if (ws == this.ws1) {
            this.player1_isReady = true
        } else if (ws == this.ws2) {
            this.player2_isReady = true
        }
        if (this.player1_isReady === true && this.player2_isReady === true) {
            this.startGame()
        }
    }

    get valueOfPlayer1Deck() {
        return this.cardsOfPlayer1.reduce((prev, curr) => { return prev += curr.value }, 0)
    }
    get valueOfPlayer2Deck() {
        return this.cardsOfPlayer1.reduce((prev, curr) => { return prev += curr.value }, 0)
    }

    closeGame() {
        gameService.abandonedGame(this.gameId)
        this.send({info: "game over"}, 'player1')
        this.send({info: "game over"}, 'player2')
    }

    resetGame() {
        this.hasStart = false
        this.whoseTurn = "player1"
        this.stepCount = 0
        this.historyOfGame = []
        this.cardsOfPlayer1 = []
        this.cardsOfPlayer2 = []
        this.player1IsPass = false
        this.player2IsPass = false
        this.mainDeck = []
        this.mainDeck = deck.slice()
    }

    async startGame() {
        if (!this.hasStart) {
            if (this.player1_Id || this.player2_Id) {
                if (this.player1_Id) {
                    this.ratingPlayer1BeforeGame = await userService.getRatingById(this.player1_Id, "pvp") ?? 0
                }
                if (this.player2_Id) {
                    this.ratingPlayer2BeforeGame = await userService.getRatingById(this.player2_Id, "pvp") ?? 0
                }
                this.gameId = await gameService.createGame(this.player1_Id ? this.player1_Id : 0, this.player2_Id ? this.player2_Id : 0, "pvp", this.ratingPlayer1BeforeGame, this.ratingPlayer2BeforeGame)

            }

            if (this.player1_Id) {
                userService.getUserData(this.player1_Id).then((data) => {
                    this.send({
                        enemyName: data?.login,
                        enemyRating: (this.ratingPlayer1BeforeGame).toString()
                    }, "player2")
                })
            } else {
                this.send({
                    enemyName: "Guest",
                }, "player2")
            }

            if (this.player2_Id) {
                userService.getUserData(this.player2_Id).then((data) => {
                    this.send({
                        enemyName: data?.login,
                        enemyRating: (this.ratingPlayer2BeforeGame).toString()
                    }, "player1")
                })
            } else {
                this.send({
                     enemyName: "Guest",
                }, "player1")
            }

            this.hasStart = true
            let card = this.player2TakeCard();
            this.setHistoryOfGame("Начало игры");
            this.setHistoryOfGame(`Игрок 2 получил - ${card.name} ${card.suit}`)

            card = this.player1TakeCard();

            this.send({
                takeCard: card,
                whoseTurn: "user",
                userDeck: this.cardsOfPlayer1,
                countOfDeckEnemy: this.cardsOfPlayer2.length,
            }, "player1")

            this.send({
                takeCard: card,
                whoseTurn: "enemy",
                userDeck: this.cardsOfPlayer2,
                countOfDeckEnemy: this.cardsOfPlayer1.length
            }, "player2")

        }
    }

    player1TakeCard() {
        let index = randomaizer(0, this.mainDeck.length - 1);
        const card = this.mainDeck[index]
        this.addCardToPlayer1Deck(this.mainDeck[index]);
        this.mainDeck.splice(index, 1)
        if (this.player1_Id) {
            gameService.madeStep(this.gameId, 0, "take", this.stepCount, this.valueOfPlayer1Deck, card.name + " " + card.suit)
        }
        this.stepCount += 1
        return card
    }
    //КОСЯК
    player2TakeCard() {
        let index = randomaizer(0, this.mainDeck.length - 1);
        const card = this.mainDeck[index]
        this.addCardToPlayer2Deck(this.mainDeck[index]);
        this.mainDeck.splice(index, 1)
        if (this.player2_Id) {
            gameService.madeStep(this.gameId, 0, "take", this.stepCount, this.valueOfPlayer2Deck, card.name + " " + card.suit)
        }
        this.stepCount += 1
        return card
    }
    setPlayer1IsPass() {
        this.player1IsPass = true
    }
    setPlayer2IsPass() {
        this.player2IsPass = true
    }
    deleteCardFromMainDeck(id: number) {
        this.mainDeck = this.mainDeck.filter((card) => card.id !== id)
    }
    addCardToPlayer1Deck(card: Card) {
        this.cardsOfPlayer1.push(card)
    }
    addCardToPlayer2Deck(card: Card) {
        this.cardsOfPlayer2.push(card)
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

    async win(who: "player1" | "player2" | "none") {
        if (this.player1_Id && who == 'player2') {
            userService.setRatingById(this.player1_Id, userService.calculatePoints(this.raitingOfPlayer1BeforeGame, false), "pvp")
            gameService.finishGame(this.player2_Id, this.gameId)
        } else if (this.player1_Id && who == 'player1') {
            userService.setRatingById(this.player1_Id, userService.calculatePoints(this.raitingOfPlayer1BeforeGame, true), "pvp")
            gameService.finishGame(this.player1_Id, this.gameId)
        }
        if (this.player2_Id && who == 'player2') {
            userService.setRatingById(this.player2_Id, userService.calculatePoints(this.raitingOfPlayer2BeforeGame, false), "pvp")
            gameService.finishGame(this.player2_Id, this.gameId)
        } else if (this.player1_Id && who == 'player1') {
            userService.setRatingById(this.player1_Id, userService.calculatePoints(this.raitingOfPlayer2BeforeGame, true), "pvp")
            gameService.finishGame(this.player1_Id, this.gameId)
        }
    }

    send(props: SendMessage, to: "player1" | "player2") {
        if (to === "player1") {
            this.ws1.send(JSON.stringify({ countMainDeck: this.mainDeck.length, ...props }))
        } else {
            this.ws2.send(JSON.stringify({ countMainDeck: this.mainDeck.length, ...props }))
        }

    }

    async madeStep(event: Event, ws: WebSocket) {
        if (ws == this.ws1 && this.whoseTurn === "player1") {
            this.madeStepPlayer1(event)
        } else if (ws == this.ws2 && this.whoseTurn === "player2") {
            this.madeStepPlayer2(event)
        }
    }

    async madeStepPlayer1(event: Event): Promise<void> {
        this.setWhoseTurn("player2")
        this.ws1.send(JSON.stringify({ whoseTurn: "player2" }))
        if (event == "take") {
            const card = this.player1TakeCard()
            this.send({ takeCard: card, userDeck: this.cardsOfPlayer1, }, "player1")
            this.setHistoryOfGame("Игрок 1 взял карту")
            if (this.valueOfPlayer1Deck > 21) {
                this.setHistoryOfGame("Игрок 1 набрал больше 21-го очка. Игрок проиграл")
                console.log("21")
                this.win("player2");
                this.send({ win: "enemy", winMessage: "Вы набрали больше 21-го очка. Вы проиграли :(" }, "player1")
                this.send({ win: "user", winMessage: "Противник набрал больше 21-го очка. Вы выйграли!! :)" }, "player2")
                return;
            } else {
                if (this.player2IsPass) {
                    if (!this.player2IsPass && this.player1_Id) {
                        gameService.madeStep(this.gameId, this.player2_Id, "pass", this.stepCount, this.valueOfPlayer2Deck)
                        this.stepCount++
                    }
                    this.player2IsPass = true
                    this.send({ takeCard: card, userDeck: this.cardsOfPlayer1, countOfDeckEnemy: this.cardsOfPlayer2.length }, "player1")
                } else {
                    this.setWhoseTurn("player2")
                    this.send({ whoseTurn: "enemy" }, "player1")
                    this.send({ whoseTurn: "user" }, "player2")
                }
            }

        } else if (event == "pass") {
            if (!this.player1IsPass && this.player1_Id) {
                gameService.madeStep(this.gameId, this.player1_Id, "pass", this.stepCount, this.valueOfPlayer1Deck)
                this.stepCount++
            }
            this.player1IsPass = true
            this.setHistoryOfGame("Игрок 1 пасс")
            if (this.player2IsPass) {
                if (this.valueOfPlayer1Deck > this.cardsOfPlayer2.reduce((prev, curr) => { return prev += curr.value }, 0)) {
                    this.setHistoryOfGame("Игрок 1 набрал больше очков чем игрок 2. Игрок 1 выйграл")
                    this.win("player1")
                    this.send({ win: "user", winMessage: "Вы набрали больше очков чем противник. Вы выйграли :)" }, "player1")
                    this.send({ win: "enemy", winMessage: "Противник набрал больше очко чем вы. Вы проиграли :(" }, "player2")
                } else {
                    this.setHistoryOfGame("Игрок 2 набрал больше очков чем игрок 1. Игрок 1 проиграл")
                    this.win("player2")
                    this.send({ win: "user", winMessage: "Вы набрали больше очков чем противник. Вы выйграли :)" }, "player2")
                    this.send({ win: "enemy", winMessage: "Противник набрал больше очко чем вы. Вы проиграли :(" }, "player1")

                }
            } else {
                this.setWhoseTurn("player2")
                this.send({ whoseTurn: "enemy" }, "player1")
                this.send({ whoseTurn: "user" }, "player2")
            }
        }
    }

    async madeStepPlayer2(event: Event): Promise<void> {
        this.setWhoseTurn("player1")
        this.ws2.send(JSON.stringify({ whoseTurn: "player1" }))
        if (event == "take") {
            const card = this.player2TakeCard()
            this.send({ takeCard: card, userDeck: this.cardsOfPlayer2, }, "player2")
            this.setHistoryOfGame("Игрок 2 взял карту")
            if (this.valueOfPlayer2Deck > 21) {
                this.setHistoryOfGame("Игрок 2 набрал больше 21-го очка. Игрок 2 проиграл")
                this.win("player1");
                this.send({ win: "enemy", winMessage: "Вы набрали больше 21-го очка. Вы проиграли :(" }, "player2")
                this.send({ win: "user", winMessage: "Противник набрал больше 21-го очка. Вы выйграли!! :)" }, "player1")
                return;
            } else {
                if (this.player1IsPass) {
                    if (!this.player1IsPass && this.player2_Id) {
                        gameService.madeStep(this.gameId, this.player1_Id, "pass", this.stepCount, this.valueOfPlayer1Deck)
                        this.stepCount++
                    }
                    this.player1IsPass = true
                    this.send({ takeCard: card, userDeck: this.cardsOfPlayer2, countOfDeckEnemy: this.cardsOfPlayer1.length }, "player2")
                } else {
                    this.setWhoseTurn("player1")
                    this.send({ whoseTurn: "enemy" }, "player2")
                    this.send({ whoseTurn: "user" }, "player1")
                }
            }

        } else if (event == "pass") {
            if (!this.player2IsPass && this.player2_Id) {
                gameService.madeStep(this.gameId, this.player2_Id, "pass", this.stepCount, this.valueOfPlayer2Deck)
                this.stepCount++
            }
            this.player2IsPass = true
            this.setHistoryOfGame("Игрок 2 пасс")
            if (this.player1IsPass) {
                if (this.valueOfPlayer2Deck > this.cardsOfPlayer1.reduce((prev, curr) => { return prev += curr.value }, 0)) {
                    this.setHistoryOfGame("Игрок 2 набрал больше очков чем игрок 1. Игрок 2 выйграл")
                    this.win("player2")
                    this.send({ win: "user", winMessage: "Вы набрали больше очков чем противник. Вы выйграли :)" }, "player2")
                    this.send({ win: "enemy", winMessage: "Противник набрал больше очко чем вы. Вы проиграли :(" }, "player1")
                } else {
                    this.setHistoryOfGame("Игрок 1 набрал больше очков чем игрок 2. Игрок 2 проиграл")
                    this.win("player1")
                    this.send({ win: "user", winMessage: "Вы набрали больше очков чем противник. Вы выйграли :)" }, "player1")
                    this.send({ win: "enemy", winMessage: "Противник набрал больше очко чем вы. Вы проиграли :(" }, "player2")

                }
            } else {
                this.setWhoseTurn("player1")
                this.send({ whoseTurn: "enemy" }, "player2")
                this.send({ whoseTurn: "user" }, "player1")
            }
        }
    }

}

