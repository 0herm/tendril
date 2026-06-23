import pg from 'pg'
import config from '@config'

const { HOST, PORT, USER, PASSWORD, DB } = config.database
const { Pool } = pg

export default new Pool({
    host: HOST,
    port: PORT ? Number(PORT) : undefined,
    user: USER,
    password: PASSWORD,
    database: DB,
})
