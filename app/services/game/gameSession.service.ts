import { eventNames } from "node:cluster";

export function randomaizer(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

export interface Card {
    id: number;
    name: string;
    suit: string;
    value: number;
}

type WhoseTurnEnum = 'user' | 'enemy'

export class SessionObject {
    playerWebSocketId: number = 0
    hasStart = false
    whoseTurn: WhoseTurnEnum = "user"
    stepCount = 0
    historyOfGame: string[] = []
    cardsOfUser: Card[] = []
    cardsOfEnemy: Card[] = []
    userIsPass = false
    enemyIsPass = false
    mainDeck: Card[] = []

    constructor(playerWebSocketId: number) {
        this.mainDeck = deck
        this.playerWebSocketId = playerWebSocketId
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
        this.mainDeck = deck
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
    startGame() {
        this.hasStart = true
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

}

export const sessionMap = new Map<number, SessionObject>()

const deck = [
    // === PEAKS (ПИКИ) ===
    { id: 1, name: "7", suit: "peaks", value: 7 },
    { id: 2, name: "7", suit: "peaks", value: 7 },
    { id: 3, name: "8", suit: "peaks", value: 8 },
    { id: 4, name: "8", suit: "peaks", value: 8 },
    { id: 5, name: "9", suit: "peaks", value: 9 },
    { id: 6, name: "9", suit: "peaks", value: 9 },
    { id: 7, name: "10", suit: "peaks", value: 10 },
    { id: 8, name: "10", suit: "peaks", value: 10 },
    { id: 9, name: "J", suit: "peaks", value: 2 },
    { id: 10, name: "J", suit: "peaks", value: 2 },
    { id: 11, name: "Q", suit: "peaks", value: 3 },
    { id: 12, name: "Q", suit: "peaks", value: 3 },
    { id: 13, name: "K", suit: "peaks", value: 4 },
    { id: 14, name: "K", suit: "peaks", value: 4 },
    { id: 15, name: "T", suit: "peaks", value: 11 },
    { id: 16, name: "T", suit: "peaks", value: 11 },

    // === HEARTS (ЧЕРВИ) ===
    { id: 17, name: "7", suit: "hearts", value: 7 },
    { id: 18, name: "7", suit: "hearts", value: 7 },
    { id: 19, name: "8", suit: "hearts", value: 8 },
    { id: 20, name: "8", suit: "hearts", value: 8 },
    { id: 21, name: "9", suit: "hearts", value: 9 },
    { id: 22, name: "9", suit: "hearts", value: 9 },
    { id: 23, name: "10", suit: "hearts", value: 10 },
    { id: 24, name: "10", suit: "hearts", value: 10 },
    { id: 25, name: "J", suit: "hearts", value: 2 },
    { id: 26, name: "J", suit: "hearts", value: 2 },
    { id: 27, name: "Q", suit: "hearts", value: 3 },
    { id: 28, name: "Q", suit: "hearts", value: 3 },
    { id: 29, name: "K", suit: "hearts", value: 4 },
    { id: 30, name: "K", suit: "hearts", value: 4 },
    { id: 31, name: "T", suit: "hearts", value: 11 },
    { id: 32, name: "T", suit: "hearts", value: 11 },

    // === DIAMONDS (БУБНЫ) ===
    { id: 33, name: "7", suit: "diamonds", value: 7 },
    { id: 34, name: "7", suit: "diamonds", value: 7 },
    { id: 35, name: "8", suit: "diamonds", value: 8 },
    { id: 36, name: "8", suit: "diamonds", value: 8 },
    { id: 37, name: "9", suit: "diamonds", value: 9 },
    { id: 38, name: "9", suit: "diamonds", value: 9 },
    { id: 39, name: "10", suit: "diamonds", value: 10 },
    { id: 40, name: "10", suit: "diamonds", value: 10 },
    { id: 41, name: "J", suit: "diamonds", value: 2 },
    { id: 42, name: "J", suit: "diamonds", value: 2 },
    { id: 43, name: "Q", suit: "diamonds", value: 3 },
    { id: 44, name: "Q", suit: "diamonds", value: 3 },
    { id: 45, name: "K", suit: "diamonds", value: 4 },
    { id: 46, name: "K", suit: "diamonds", value: 4 },
    { id: 47, name: "T", suit: "diamonds", value: 11 },
    { id: 48, name: "T", suit: "diamonds", value: 11 },

    // === CLUBS (КРЕСТИ) ===
    { id: 49, name: "7", suit: "clubs", value: 7 },
    { id: 50, name: "7", suit: "clubs", value: 7 },
    { id: 51, name: "8", suit: "clubs", value: 8 },
    { id: 52, name: "8", suit: "clubs", value: 8 },
    { id: 53, name: "9", suit: "clubs", value: 9 },
    { id: 54, name: "9", suit: "clubs", value: 9 },
    { id: 55, name: "10", suit: "clubs", value: 10 },
    { id: 56, name: "10", suit: "clubs", value: 10 },
    { id: 57, name: "J", suit: "clubs", value: 2 },
    { id: 58, name: "J", suit: "clubs", value: 2 },
    { id: 59, name: "Q", suit: "clubs", value: 3 },
    { id: 60, name: "Q", suit: "clubs", value: 3 },
    { id: 61, name: "K", suit: "clubs", value: 4 },
    { id: 62, name: "K", suit: "clubs", value: 4 },
    { id: 63, name: "T", suit: "clubs", value: 11 },
    { id: 64, name: "T", suit: "clubs", value: 11 }
]