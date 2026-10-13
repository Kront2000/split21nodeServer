import * as jwt from '../authorization/jwt.service'
import { Users } from "../../entity/Users"
import AppDataSource from "../../AppDataSource"

// export async function getUserData(id: number) {
//     const resp = await AppDataSource.getRepository(Users).findOne({
//         where: {
//             id: id
//         },
//         select: {
//             login: true,
//             score: true,
//             id: true
//         }
//     })
//     return resp
// }

export async function getUserByLogin(login: string) {
    const resp = await AppDataSource.getRepository(Users).findOne({
        where: { login: login }
    })
    return resp
}

// export async function getScoreById(id: number) {
//     const resp = await AppDataSource.getRepository(Users).findOne({
//         where: { id: id },
//     })
//     if (resp) {
//         return resp.score
//     } else {
//         return null
//     }
// }

// export async function getTop10() {
//     const resp = await AppDataSource.getRepository(Users).find({
//         order: {
//             score: 'DESC'
//         },
//         select: {
//             id: true,
//             login: true,
//             score: true
//         },
//         take: 10
//     })
//     return resp
// }

// export async function createUser(login: string, password: string, score: number = 0) {
//     const user = new Users()
//     user.login = login
//     user.password = jwt.hashPassword(password)
//     user.score = score
//     try {
//         const result = await AppDataSource.manager.save(user)
//         console.log(result)
//         return result 
//     } catch (err: any) {
//         if (err.code === '23505') {
//             return null
//         } else {
//             throw err
//         }
//     }
// }

// export async function incrementScoreById(id: number) {
//     try {
//         const resp = await AppDataSource.manager.update(Users, { id: id }, { score: () => "score + 1" })
//         return resp
//     } catch (err) {
//         return null
//     }
// }

// export async function clearScoreById(id: number) {
//     try {
//         const resp = AppDataSource.manager.update(Users, { id: id }, { score: 0 })
//         return resp
//     } catch (err) {
//         return null
//     }
// }


