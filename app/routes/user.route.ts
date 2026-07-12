import express from 'express'
import * as jwt from '../services/authorization/jwt.service.js'
import { userScoreRoute } from './userScore.route.js'

export const userRoutes = express.Router()

userRoutes.get("/", (req, res) => {
    try {
        console.log(req.cookies)
        if (!req.cookies || !req.cookies.accessToken || !jwt.verifyToken(req.cookies.accessToken)) {
            res.status(401)
            res.send("Not authorized")
        } else {
            res.send(jwt.verifyToken(req.cookies.accessToken))
        }
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})

userRoutes.use("/score", userScoreRoute)