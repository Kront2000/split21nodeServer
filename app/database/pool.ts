import { Pool } from 'pg'
import dotenv from 'dotenv';
dotenv.config()

export const pool = await new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    ssl: true
})

if (process.env.SEED) {
    console.log("start seeding...")

    try {
        console.log(await pool.query("DROP TABLE users"));
    } catch (err) {
        console.log(err)
    }

    try {
        console.log(await pool.query("CREATE TABLE users (id SERIAL PRIMARY KEY, login VARCHAR(20) UNIQUE NOT NULL, password VARCHAR(43) NOT NULL, score SMALLINT DEFAULT 0)"))
    } catch (err) {
        console.log(err)
    }

    console.log("finish seeding")
}


