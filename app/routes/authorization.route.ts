import express from 'express'
import * as jwt from '../services/authorization/jwt.service'
import * as userService from '../services/user/user.service'


export const authRoute = express.Router()

authRoute.post("/register", async (req, res) => {
    try {
        console.log(req.body)
        if (!req.body) {
            res.status(400)
            return res.end("Incorrect data")
        } else if (!req.body.login) {
            res.status(400)
            return res.end("Login is missing")
        } else if (!req.body.password) {
            res.status(400)
            return res.end("Password is missing")
        }

        const user = await userService.createUser(req.body.login, req.body.password)
        if (user === null) {
            res.status(400)
            return res.end("user already exist")
        }
        const token = jwt.getToken({ id: user.id, login: user.login })
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: true
        });
        return res.send("Registration was successful.");
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("server error")
    }
})

authRoute.post("/login", async (req, res) => {
    try {
        if (!req.body || !req.body.login || !req.body.password) {
            res.status(400)
            return res.end("Incorrect data")
        }
        let user = await userService.getUserByLogin(req.body.login)

        if (!user || jwt.hashPassword(req.body.password) !== user.password) {
            res.status(400)
            return res.send("Invalid username or password")
        }
        const token = jwt.getToken({ id: user.id, login: user.login })
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: true
        });
        return res.send("Login was successful.");
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("server error")
    }
})