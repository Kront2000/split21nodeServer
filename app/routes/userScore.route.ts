import express from 'express'
import { pool } from '../lib/pool.js'

export const userScoreRoute = express.Router()

//Счётчик выйгранных партий подряд
userScoreRoute.put("/add/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            res.status(400)
            res.send("Incorrect data")
        } else {
            const response = await pool.query({ text: 'UPDATE users SET score = score + 1 WHERE id = $1', values: [req.params.id] })
            if(response.rowCount < 1){
                res.status(404)
                res.send("User not found")
            }else{
                res.send("succesful")
            }
        }
    } catch (err) {
        res.status(500)
        res.send("Server error")
    }
})

userScoreRoute.put("/clear/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            res.status(400)
            res.send("Incorrect data")
        } else {
            const response = await pool.query({ text: 'UPDATE users SET score = 0 WHERE id = $1', values: [req.params.id] })
            if(response.rowCount < 1){
                res.status(404)
                res.send("User not found")
            }else{
                res.send("succesful")
            }
            
        }
    } catch (err) {
        res.status(500)
        res.send("Server error")
    }
})

userScoreRoute.get("/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            res.status(400)
            res.send("Incorrect data")
        } else {
            let score = await pool.query({ text: 'SELECT score FROM users WHERE id = $1', values: [req.params.id] })
            if (score.rows.length < 1) {
                res.status(404)
                res.send("user not found")
            } else {
                res.send(score.rows[0])
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("Server error")
    }
})

userScoreRoute.get("/", async (req, res) => {
    try {
        let score = await pool.query('SELECT id, login, score FROM users ORDER BY score DESC LIMIT 10')
        res.send(score.rows)
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("Server error")
    }
})