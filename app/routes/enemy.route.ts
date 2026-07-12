import express, { Request, Response } from 'express'
import getAction from './../services/getAction.service'

export const enemyRoute = express.Router()

enemyRoute.post('/', async (req: Request, res: Response) => {
    try {
        if (req.body && req.body.historyOfGame && req.body.historyOfVictories != undefined && req.body.score) {
            let result = await getAction(req.body.historyOfGame, req.body.score);
            const resultStringfy = JSON.stringify(result)
            res.send(resultStringfy)
        } else {
            console.log(req.body)
            res.status(400)
            res.send("Not all parameters are specified in the request.")
        }
    } catch (err) {
        console.log(err)
        res.status(500).end()
    }
})