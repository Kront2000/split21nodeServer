import * as jwt from '../authorization/jwt.service'
import { Users } from "../../entity/Users"
import AppDataSource from "../../AppDataSource"
import { UserStats } from '../../entity/UserStats'

export async function getUserData(id: number) {
    const resp = await AppDataSource.getRepository(Users).findOne({
        where: {
            id: id
        },
        select: {
            login: true,
            user_stats: true,
            id: true
        },
        relations: {
            user_stats: true
        }
    })
    return resp
}

export async function getUserByLogin(login: string) {
    const resp = await AppDataSource.getRepository(Users).findOne({
        where: { login: login }
    })
    return resp
}

export async function getRatingById(id: number, typeOfRating: "ai" | "pvp") {
    const resp = await AppDataSource.getRepository(UserStats).findOne({
        where: { id: id },
    })
    if (resp && typeOfRating == "ai") {
        return resp.rating_ai
    } else if (resp && typeOfRating == "pvp")
        return resp?.rating_pvp
    else {
        return null
    }
}

export async function getTop10(typeOfRating: "ai" | "pvp") {
    if (typeOfRating === "ai") {
        const resp = await AppDataSource.getRepository(UserStats).find({
            order: {
                rating_ai: 'DESC'
            },
            select: {
                id: true,
                rating_ai: true,
                users: {
                    login: true
                }
            },
            take: 10
        })
        return resp
    } else {
        const resp = await AppDataSource.getRepository(UserStats).find({
            order: {
                rating_pvp: 'DESC'
            },
            select: {
                id: true,
                rating_ai: true,
                users: {
                    login: true
                }
            },
            take: 10
        })
        return resp
    }
}

export async function createUser(login: string, password: string) {
    try {
        return await AppDataSource.transaction(async (manager) => {
            const user = manager.create(Users, {
                login: login,
                password: jwt.hashPassword(password)
            })
            await manager.save(user)

            const user_stats = manager.create(UserStats, {
                id: user.id,
            })
            await manager.save(user_stats)
            return user
        })
    
    } catch (err: any) {
        if (err.code === '23505') {
            return null
        } else {
            throw err
        }
    }
}

export async function setRatingById(id: number, value: number, typeOfRating: "ai" | "pvp") {
    try {
        const resp = await AppDataSource.manager.update(UserStats, { id: id }, { rating_ai: value })
        return resp
    } catch (err) {
        return null
    }
}


export function calculatePoints(
  points: number,
  isWinner: boolean
): number {
    let result = isWinner ? points += 5 : points -=10 
    return result >= 0 ? result : 0
}


