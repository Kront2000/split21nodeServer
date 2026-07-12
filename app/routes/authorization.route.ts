import express from 'express'
import * as jwt from '../services/authorization/jwt.service'


export const authRoute = express.Router()

authRoute.post("/regist", async (req, res) => {
    try {
        if (!req.body || !req.body?.login || !req.body?.password) {
            res.status(400)
            res.send("Incorrect data")
        }
        let response = await pool.query({ text: 'SELECT id FROM users WHERE login = $1', values: [req.body.login] })
        if (response.rows.length > 0) {
            res.status(400)
            res.send("login alredy exist")
        } else {
            let user = await pool.query({ text: "INSERT INTO users (login, password) values ($1, $2) RETURNING id", values: [req.body.login, jwt.hashPassword(req.body.password)] })
            const token = `${jwt.getToken({ login: req.body.login, id: user.rows[0].id })}`
            res.cookie('accessToken', token, { httpOnly: true, secure: true })
            res.send("Registration was successful.")
        }

    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})

authRoute.post("/login", async (req, res) => {
    try {
        if (!req.body || !req.body?.login || !req.body?.password) {
            res.status(400)
            res.send("Incorrect data")
        }
        let user = await pool.query({ text: "SELECT * FROM users WHERE login = $1", values: [req.body.login] })
        if (user.rows.length < 1 || jwt.hashPassword(req.body.password) !== user.rows[0].password) {
            res.status(400)
            res.send("Invalid username or password")
        } else {
            const token = `${jwt.getToken({ login: req.body.login, id: user.rows[0].id })}`
            res.cookie('accessToken', token, { httpOnly: true, secure: true })
            res.send("Login was successful.")
        }
        res.end()
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("server error")
    }
})