import express from 'express'
import { authRoute } from './routes/authorization.route.js'
import { enemyRoute } from './routes/enemy.route'
import { startWebSocket } from './routes/webSocket.js'
import { userRoutes } from './routes/user.route'
import cookieParser from 'cookie-parser'
import http from 'http'

const app = express()
const PORT = 8080

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/enemy', enemyRoute)
app.use('/auth', authRoute)
app.use('/user', userRoutes)


export const server = http.createServer(app);

server.listen(PORT, () => {
    console.log("Сервер запущен...")
})

startWebSocket();