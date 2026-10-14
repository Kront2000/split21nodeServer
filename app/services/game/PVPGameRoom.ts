// import WebSocket from "ws";
// import { randomaizer } from '../../utils/randomaizer'
// import { deck } from './gameConsts'
// import getAction from "../getAction.service";
// import * as userService from '../user/user.service'
// import * as gameService from './game.service'
// import { gameRoomMap } from './ai.game.service';



// export interface Card {
//     id: number;
//     name: string;
//     suit: string;
//     value: number;
// }

// interface SendMessage {
//     enemyEvent?: Event,
//     win?: "none" | "user" | "enemy",
//     winMessage?: string,
//     userDeck?: Card[],
//     takeCard?: Card,
//     countOfDeckEnemy?: number,
//     enemyMessage?: string,
//     whoseTurn?: string,
//     info?: string
// }

// type WhoseTurnEnum = 'player1' | 'player2'

// export type Event = "take" | "pass"

// export default class AiGameRoom {
//     ws: WebSocket
//     player1_Id: number | null
//     player2_Id: number | null
//     hasStart = false
//     whoseTurn: WhoseTurnEnum = "user"
//     stepCount = 0
//     historyOfGame: string[] = []
//     cardsOfUser: Card[] = []
//     cardsOfEnemy: Card[] = []
//     userIsPass = false
//     enemyIsPass = false
//     mainDeck: Card[] = []
//     raitingOfPlayerBeforeGame: number = 0
//     gameId: number = 0

//     constructor(ws1: WebSocket, player1_Id: number | null = null, ws2: WebSocket, player2_Id: number | null) {
//         this.mainDeck = deck
//         this.ws = ws
//         this.player1_Id = player1_Id
//         this.player2_Id = player2_Id
//     }

//     get valueOfEnemyDeck() {
//         return this.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)
//     }
//     get valueOfUserDeck() {
//         return this.cardsOfUser.reduce((prev, curr) => { return prev += curr.value }, 0)
//     }

//     closeGame() {
//         gameService.abandonedGame(this.gameId)
//     }

//     resetGame() {
//         this.hasStart = false
//         this.whoseTurn = "user"
//         this.stepCount = 0
//         this.historyOfGame = []
//         this.cardsOfUser = []
//         this.cardsOfEnemy = []
//         this.userIsPass = false
//         this.enemyIsPass = false
//         this.mainDeck = []
//         this.mainDeck = deck.slice()
//     }

//     async startGame() {
//         if (!this.hasStart) {
//             if (this.playerId) {
//                 const data = await userService.getRatingById(this.playerId, "ai")
//                 this.raitingOfPlayerBeforeGame = data ? data : 0
//                 if (this.playerId)
//                     this.gameId = await gameService.createGame(this.playerId, 0, "ai", this.raitingOfPlayerBeforeGame, 0)
//             }
//             this.hasStart = true
//             let card = this.enemyTakeCard();
//             this.setHistoryOfGame("Начало игры");
//             this.setHistoryOfGame(`Противник получил - ${card.name} ${card.suit}`)
//             card = this.userTakeCard();
//             this.send({
//                 takeCard: card,
//                 whoseTurn: "user",
//                 userDeck: this.cardsOfUser,
//                 countOfDeckEnemy: this.cardsOfEnemy.length
//             })

//         }
//     }

//     enemyTakeCard() {
//         let index = randomaizer(0, this.mainDeck.length - 1);
//         const card = this.mainDeck[index]
//         this.addCardToEnemyDeck(this.mainDeck[index]);
//         this.mainDeck.splice(index, 1)
//         if (this.playerId) {
//             gameService.madeStep(this.gameId, 0, "take", this.stepCount, this.valueOfEnemyDeck, card.name + " " + card.suit)
//         }
//         this.stepCount += 1
//         return card
//     }
//     //КОСЯК
//     userTakeCard() {
//         let index = randomaizer(0, this.mainDeck.length - 1);
//         const card = this.mainDeck[index]
//         this.addCardToUserDeck(this.mainDeck[index]);
//         this.mainDeck.splice(index, 1)
//         if (this.playerId) {
//             gameService.madeStep(this.gameId, this.playerId, "take", this.stepCount, this.valueOfUserDeck, card.name + " " + card.suit)
//         }
//         this.stepCount += 1
//         return card
//     }
//     setUserIsPass() {
//         this.userIsPass = true
//     }
//     setEnemyIsPass() {
//         this.enemyIsPass = true
//     }
//     deleteCardFromMainDeck(id: number) {
//         this.mainDeck = this.mainDeck.filter((card) => card.id !== id)
//     }
//     addCardToUserDeck(card: Card) {
//         this.cardsOfUser.push(card)
//     }
//     addCardToEnemyDeck(card: Card) {
//         this.cardsOfEnemy.push(card)
//     }
//     incrementStepCount() {
//         this.stepCount += 1
//     }
//     setWhoseTurn(who: WhoseTurnEnum) {
//         this.whoseTurn = who
//     }

//     setHistoryOfGame(event: string) {
//         this.historyOfGame.push(event)
//     }

//     async win(who: "user" | "enemy" | "none", message: string) {
//         const finalRes = await getAction(this.historyOfGame, this.valueOfEnemyDeck)
//         this.ws.send(JSON.stringify({
//             enemyMessage: finalRes.message,
//             win: who,
//             winMessage: message
//         }))
//         if (this.playerId && who == 'enemy') {
//             userService.setRatingById(this.playerId, userService.calculatePoints(this.raitingOfPlayerBeforeGame, false), "ai")
//             gameService.finishGame(0, this.gameId)
//         } else if (this.playerId && who == 'user') {
//             userService.setRatingById(this.playerId, userService.calculatePoints(this.raitingOfPlayerBeforeGame, true), "ai")
//             gameService.finishGame(this.playerId, this.gameId)
//         }
//         console.log(this.cardsOfEnemy)
//         gameRoomMap.delete(this.ws)
//     }

//     send(props: SendMessage) {
//         this.ws.send(JSON.stringify({ countMainDeck: this.mainDeck.length, ...props }))
//     }

//     async madeStep(event: Event): Promise<void> {
//         console.log(this.playerId)
//         this.setWhoseTurn("enemy")
//         this.ws.send(JSON.stringify({ whoseTurn: "enemy" }))
//         if (event == "take") {
//             const card = this.userTakeCard()
//             this.send({ takeCard: card, userDeck: this.cardsOfUser, })
//             this.setHistoryOfGame("Пользователь взял карту")
//             if (this.valueOfUserDeck > 21) {
//                 this.setHistoryOfGame("Игрок набрал больше 21-го очка. Игрок проиграл")
//                 this.win("enemy", "Вы набрали больше 21-го очка. Вы проиграли :("); return;

//             } else {
//                 if (this.enemyIsPass) {
//                     if (!this.enemyIsPass && this.playerId) {
//                         gameService.madeStep(this.gameId, 0, "pass", this.stepCount, this.valueOfEnemyDeck)
//                         this.stepCount++
//                     }
//                     this.enemyIsPass = true
//                     this.send({ takeCard: card, userDeck: this.cardsOfUser, countOfDeckEnemy: this.cardsOfEnemy.length })
//                 } else {
//                     const res = await getAction(this.historyOfGame, this.valueOfEnemyDeck)
//                     if (res.event == "take" && !this.enemyIsPass) {
//                         const card = this.enemyTakeCard()
//                         this.send({ enemyMessage: res.message })
//                         if (this.valueOfEnemyDeck > 21) {
//                             this.setHistoryOfGame("Противник набрал больше 21-го очка. Игрок выйграл")
//                             this.win("user", "Противник набрал больше 21-го очка. Вы выйграли!! :)")
//                         } else {
//                             this.setHistoryOfGame(`Противник получает карту ${card.suit} ${card.name}`)
//                             this.setWhoseTurn('user')
//                             this.send({ enemyEvent: "take", countOfDeckEnemy: this.cardsOfEnemy.length, whoseTurn: 'user' })
//                         }
//                     } else {
//                         this.send({ enemyEvent: "pass", enemyMessage: res.message, whoseTurn: "user" })
//                         this.setEnemyIsPass()
//                         this.setWhoseTurn("user")
//                     }
//                 }
//             }

//         } else if (event == "pass") {
//             if (!this.userIsPass && this.playerId) {
//                 gameService.madeStep(this.gameId, this.playerId, "pass", this.stepCount, this.valueOfUserDeck)
//                 this.stepCount++
//             }
//             this.userIsPass = true
//             this.setHistoryOfGame("Игрок пасс")
//             if (this.enemyIsPass) {
//                 if (this.valueOfUserDeck > this.cardsOfEnemy.reduce((prev, curr) => { return prev += curr.value }, 0)) {
//                     this.setHistoryOfGame("Игрок набрал больше очков чем у противника. Игрок выйграл")
//                     this.win("user", "Вы набрали больше очков чем противник. Вы выйграли :)")
//                 } else {
//                     this.setHistoryOfGame("Противник набрал больше очков чем игрок. Игрок проиграл")
//                     this.win("enemy", "Противник набрал больше очко чем вы. Вы проиграли :(")
//                 }
//             } else {
//                 const res = await getAction(this.historyOfGame, this.valueOfEnemyDeck)
//                 if (res.event == "take") {
//                     this.enemyTakeCard()
//                     this.send({ enemyMessage: res.message })
//                     if (this.valueOfEnemyDeck > 21) {
//                         this.setHistoryOfGame("Противник набрал больше 21-го очка. Игрок выйграл")
//                         this.win("user", "Противник набрал больше 21-го очка. Вы выйграли!! :)")
//                     } else {
//                         this.send({ enemyEvent: "take", countOfDeckEnemy: this.cardsOfEnemy.length })
//                         setTimeout(() => { this.madeStep("pass") }, 3000)
//                     }
//                 } else if (res.event == "pass") {
//                     if (!this.enemyIsPass && this.playerId) {
//                         gameService.madeStep(this.gameId, 0, "pass", this.stepCount, this.valueOfEnemyDeck)
//                         this.stepCount++
//                     }
//                     this.enemyIsPass = true
//                     if (this.valueOfUserDeck > this.valueOfEnemyDeck) {
//                         this.setHistoryOfGame("Игрок набрал больше очков чем у противника. Игрок выйграл")
//                         this.win("user", "Вы набрали больше очко чем противник. Вы выйграли :)")
//                     } else {
//                         this.setHistoryOfGame("Противник набрал больше очков чем игрок. Игрок проиграл")
//                         this.win("enemy", "Противник набрал больше очко чем вы. Вы проиграли :(")
//                     }
//                 }
//             }
//         }
//     }

// }

