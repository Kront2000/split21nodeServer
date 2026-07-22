import express from 'express'
import { authRoute } from './routes/authorization.route.js'
import { enemyRoute } from './routes/enemy.route'
import { startWebSocket } from './routes/webSocket.js'
import { userRoutes } from './routes/user.route'
import cookieParser from 'cookie-parser'
import http from 'http'

const app = express()
const PORT = 8080
let secret = 'qwerty';

app.use(cookieParser(secret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log("Запрос")
    res.set({ "Access-Control-Allow-Origin": "*" })
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

app.use('/enemy', enemyRoute)
app.use('/auth', authRoute)
app.use('/user', userRoutes)


export const server = http.createServer(app);

server.listen(PORT, () => {
    console.log("Сервер запущен...")
})

startWebSocket();