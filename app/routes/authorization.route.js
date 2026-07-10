import express from 'express'
import * as jwt from '../services/authorization/jwt.service.js'

export const authRoute = express.Router()

authRoute.post("/login", (req, res) => {
    try {
        if (!req.body || !req.body?.login || !req.body?.password) {
            res.status(400)
            res.send("Incorrect data")
        }
        const token = `${jwt.getToken(req.body.login)}`
        res.cookie('accessToken', token, { httpOnly: true, secure: true })
        res.send("Authorization was successful.")
    } catch(err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})