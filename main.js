import express from 'express'
import { enemyRouter } from './app/routes/enemy.route.js'

const app = express()
const PORT = 8080

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
    console.log("Запрос")
    res.set({ "Access-Control-Allow-Origin": "*" })
    next()
})

app.use('/enemy', enemyRouter)


app.listen(PORT, () => {
    console.log("Сервер запущен...")
})