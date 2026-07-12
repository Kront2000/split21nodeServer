import { Pool } from 'pg'

const pool = await new Pool().connect()

console.log(pool.query("CREATE TABLE user (id SERIAL PRIMARY KEY, login VARCHAR(20))"))

