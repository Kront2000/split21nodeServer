import express from 'express'
import * as jwt from '../services/authorization/jwt.service'
import * as userService from '../services/user/user.service'


export const authRoute = express.Router()

authRoute.post("/register", async (req, res) => {
    try {
        if (!req.body) {
            res.status(400)
            return res.end("Incorrect data")
        } else if (!req.body.login || req.body.login.length < 4) {
            res.status(400)
            return res.end("The login is missing or shorter than 4 characters")
        } else if (!req.body.password || req.body.login.length < 8) {
            res.status(400)
            return res.end("Password is missing or less than 8 characters long")
        } 

        const user = await userService.createUser(req.body.login, req.body.password)
        if (user === null) {
            res.status(400)
            return res.end("user already exist")
        }
        const token = jwt.getToken({ id: user.id, login: user.login })
        res.cookie('accessToken', token, {
            secure: false, 
            sameSite: 'lax',
            path: "/"
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
            secure: true
        });
        return res.send("Login was successful.");
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("server error")
    }
})