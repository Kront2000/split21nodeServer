import express from 'express'
import * as userService from '../services/user/user.service'
export const userScoreRoute = express.Router()

//Счётчик выйгранных партий подряд
userScoreRoute.put("/add/:id", async (req, res) => {
    try {
        if(!req.params || !req.params.id){
            res.status(400)
            return res.send("Incorrect data")
        }
        const response = await userService.incrementScoreById(Number(req.params.id))
        if (response === null) {
            res.status(404)
            return res.send("User not found")
        }
        return res.send("succesful")

    } catch (err: any) {
        console.log(err)
        res.status(500)
        return res.send(err.message)
    }
})

userScoreRoute.put("/clear/:id", async (req, res) => {
    try {
        if(!req.params || !req.params.id){
            res.status(400)
            return res.send("Incorrect data")
        }
        const response = await userService.clearScoreById(Number(req.params.id))
        if (response === null) {
            res.status(404)
            return res.send("User not found")
        }
        return res.send("succesful")

    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("Server error")
    }
})

userScoreRoute.get("/:id", async (req, res) => {
    try {
        if(!req.params || !req.params.id){
            res.status(400)
            return res.send("Incorrect data")
        }
        const response = await userService.getScoreById(Number(req.params.id))
        if (response === null) {
            res.status(404)
            return res.send("User not found")
        }
        return res.send(response)
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("Server error")
    }
})

userScoreRoute.get("/", async (req, res) => {
    try {
        const response = await userService.getTop10()
        if (response === null) {
            res.status(404)
            return res.send("Users not found")
        }
        return res.send(response)
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("Server error")
    }
})