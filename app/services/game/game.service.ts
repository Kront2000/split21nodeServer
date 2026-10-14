import { DeepPartial } from "typeorm"
import AppDataSource from "../../AppDataSource"
import { ACTION, GameMoves } from "../../entity/GameMoves"
import { Games, GameType, STATUS } from "../../entity/Games"
import { Users } from "../../entity/Users"

export async function createGame(player1_id: number, player2_id: number, type: "ai" | "pvp", player1_score: number, player2_score: number) {
    const repository = AppDataSource.getRepository(Games)
    if (player2_id !== 0) {
        const game = repository.create({
            player1_id: { id: player1_id },
            player2_id: { id: player2_id },
            game_type: type === "ai" ? GameType.AI : GameType.PVP,
            player1_score: player1_score,
            player2_score: player2_score,

        })
        return (await repository.save(game)).id
    } else {
        const game = repository.create({
            player1_id: { id: player1_id },
            game_type: type === "ai" ? GameType.AI : GameType.PVP,
            player1_score: player1_score,
            player2_score: player2_score,

        })
        return (await repository.save(game)).id
    }
}

export async function finishGame(whoWin_id: number, game_id: number) {
    const repository = AppDataSource.getRepository(Games)
    const game = await repository.findOneBy({ id: game_id })
    if (game) {
        game.status = STATUS.FINISHED
        if (whoWin_id !== 0) {
            game.winner_id = { id: whoWin_id } as Users
        }
        game.ended_at = new Date()
        repository.save(game)
    }
}

export async function abandonedGame(game_id: number) {
    const repository = AppDataSource.getRepository(Games)
    const game = await repository.findOneBy({ id: game_id })
    if (game && game.status !== STATUS.FINISHED) {
        game.status = STATUS.ABANDONED
        game.ended_at = new Date()
        repository.save(game)
    }
}

export async function madeStep(game_id: number, player_id: number, event: "take" | "pass", stepCount: number, score: number, card?: string) {
    const repository = AppDataSource.getRepository(GameMoves)
    const move = await repository.create({
        game_id: { id: game_id },
        action: event == "take" ? ACTION.TAKE : ACTION.PASS,
        point_after_move: score,
        step_number: stepCount,
        player_id: player_id !== 0 ? { id: player_id } : undefined,
        card_drawn: event === "take" ? card : undefined
    })
    repository.save(move)
}
