import { Between, FindManyOptions, FindOptionsWhere, IsNull, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm"
import AppDataSource from "../../AppDataSource"
import { GameMoves } from "../../entity/GameMoves"
import { Games, GameType } from "../../entity/Games"

export async function getGamesByPlayerId(id: number, type?: string , result?: string , from?: string, to?: string) {

    const where: FindOptionsWhere<Games> = {}

    switch (type) {
        case "ai":
            where.game_type = GameType.AI
            break
        case "pvp":
            where.game_type = GameType.PVP
            break
    }

    switch (result) {
        case "win":
            where.winner_id = {id}
            break
        case "defeat":
            where.winner_id = {id: Not(id)} 
            where.winner_id = IsNull() 
            break
    }

    if (from && to) {
        where.ended_at = Between(new Date(from), new Date(to));
    } else if (from) {
        where.ended_at = MoreThanOrEqual(new Date(from));
    } else if (to) {
        where.ended_at = LessThanOrEqual(new Date(to));
    }

    const resp = await AppDataSource.getRepository(Games).find({
        relations: {
            winner_id: true
        },
        select: {
            id: true,
            game_type: true,
            ended_at: true,
            winner_id: {
                login: true,
                id: true
            },
            status: true
        },
        where: where
    })
    return resp
}

export async function getGameById(id: number) {
    const resp = await AppDataSource.getRepository(GameMoves).find({
        relations: {
            player_id: true,
        },
        select: {
            action: true,
            card_drawn: true,
            created_at: true,
            point_after_move: true,
            player_id: {
                login: true,
            }
        },
        where: {
            game_id: {
                id: id
            }
        },
        order: {
            step_number: "ASC"
        }
    })
    return resp
}