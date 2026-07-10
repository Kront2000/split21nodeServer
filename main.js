import express from 'express'
import { enemyRoute } from './app/routes/enemy.route.js'
import { authRoute } from './app/routes/authorization.route.js'
import { userRoutes } from './app/routes/user.route.js'
import cookieParser from 'cookie-parser'

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


app.listen(PORT, () => {
    console.log("Сервер запущен...")
})