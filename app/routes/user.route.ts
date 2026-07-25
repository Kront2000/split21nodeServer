import express from 'express'
import * as jwt from '../services/authorization/jwt.service.js'
import { userScoreRoute } from './userScore.route.js'
import { getUserData } from './../services/user/user.service.js'

export const userRoutes = express.Router()

userRoutes.get("/", (req, res) => {
    try {
        console.log(req.cookies)
        if (!req.cookies || !req.cookies.accessToken || !jwt.verifyToken(req.cookies.accessToken)) {
            res.status(401)
            res.send("Not authorized")
        } else {
            const user = jwt.verifyToken(req.cookies.accessToken)
            if (user) {
                getUserData(user.id).then((data) => {
                    if(data !== null){
                        return res.send(data)
                    }
                })
            }

        }
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})

userRoutes.use("/score", userScoreRoute)