import "reflect-metadata"
import { DataSource } from "typeorm"
import { Users } from "./entity/Users"
import { GameMoves } from "./entity/GameMoves";
import { UserStats } from "./entity/UserStats";
import { Games } from "./entity/Games";
import dotenv from 'dotenv';
dotenv.config()

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    entities: [Users, Games, GameMoves, UserStats],
    synchronize: true,
    logging: false,
    ssl: {
        rejectUnauthorized: false
    },
    
})

export default AppDataSource