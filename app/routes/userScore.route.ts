import express from 'express'
import * as userService from '../services/user/user.service'
export const userScoreRoute = express.Router()

userScoreRoute.get("/pvp/:id", async (req, res) => {
    try {
        if(!req.params || !req.params.id){
            res.status(400)
            return res.send("Incorrect data")
        }
        const response = await userService.getRatingById(Number(req.params.id), "pvp")
        if (response === null) {
            res.status(404)
            return res.send("User not found")
        }
        console.log(response)
        return res.send(response)
    } catch (err) {
        console.log(err)
        res.status(500)
        return res.send("Server error")
    }
})

userScoreRoute.get("/ai/:id", async (req, res) => {
    try {
        if(!req.params || !req.params.id){
            res.status(400)
            return res.send("Incorrect data")
        }
        console.log(req.params.id)
        const response = await userService.getRatingById(Number(req.params.id), "ai")
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

userScoreRoute.get("/ai", async (req, res) => {
    try {
        const response = await userService.getTop10("ai")
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

userScoreRoute.get("/pvp", async (req, res) => {
    try {
        const response = await userService.getTop10("pvp")
        console.log(response)
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