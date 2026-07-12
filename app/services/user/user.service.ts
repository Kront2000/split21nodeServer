import { prisma } from './../../lib/prisma'
import * as jwt from '../authorization/jwt.service'

export async function getUserByLogin(login: string) {
    const resp = await prisma.users.findUnique({
        where: { login: login }
    })
    return resp
}

export async function getScoreById(id: number) {
    const resp = await prisma.users.findUnique({
        where: { id: id },
    })
    if(resp){
        return resp.score
    }else{
        return null
    }
}

export async function getTop10() {
    const resp = await prisma.users.findMany({
        orderBy: {
            score: 'desc'
        },
        select: {
            id: true,
            login: true,
            score: true
        }
    })
    return resp
}

export async function createUser(login: string, password: string, score: number = 0) {
    try {
        return await prisma.users.create({
            data: {
                login: login,
                password: jwt.hashPassword(password),
                score: score
            },
            select: {
                id: true,
                login: true,
                score: true
            }

        })
    } catch (err: any) {
        if (err.code === 'P2002') {
            return null
        } else {
            throw err
        }
    }
}

export async function incrementScoreById(id: number) {
    try{
        const resp = await prisma.users.update({
            where: {id: id},
            data: {score: {increment: 1}},
            select: {
                login: true,
                id: true,
                score: true
            }
        })
        return resp
    }catch(err){
        return null
    }
}

export async function clearScoreById(id: number) {
    try{
        const resp = await prisma.users.update({
            where: {id: id},
            data: {score: 0},
            select: {
                login: true,
                id: true,
                score: true
            }
        })
        return resp
    }catch(err){
        return null
    }
}


