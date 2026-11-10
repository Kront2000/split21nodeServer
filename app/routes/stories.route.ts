import express from 'express'
import * as storiesService from '../services/sories/stories.service'

export const storiesRoute = express.Router()

storiesRoute.get("/games-of-player/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            res.status(400)
            return res.send("Incorrect data")
        } else {
            const type = typeof req.query.type == "string" ? req.query.type : undefined
            const result = typeof req.query.result == "string" ? req.query.result : undefined
            const from = typeof req.query.from == "string" ? req.query.from : undefined
            const to = typeof req.query.to == "string" ? req.query.to : undefined
            const response = await storiesService.getGamesByPlayerId(Number(req.params.id), type, result, from, to)
            if (response === null) {
                res.status(404)
                return res.send("User not found")
            }
            return res.send(response)
        }
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})

storiesRoute.get("/game-moves/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            res.status(400)
            return res.send("Incorrect data")
        } else {
            const response = await storiesService.getGameById(Number(req.params.id))
            if (response === null) {
                res.status(404)
                return res.send("Game not found")
            }
            return res.send(response)
        }
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})
