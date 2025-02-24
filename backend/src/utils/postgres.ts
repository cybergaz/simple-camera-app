import postgres from 'postgres';
import 'dotenv/config';

const db_connect = () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.warn("WARNING: DATABASE_URL environment variables are not defined, continuing with default values. (localhost & 5432)");
        }
        // const client = postgres({
        //     host: process.env.POSTGRES_HOST || "localhost",
        //     database: process.env.POSTGRES_DB || "cybergaz",
        //     username: process.env.POSTGRES_USER || "gaz",
        //     port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
        //     password: process.env.POSTGRES_PASSWORD || "cybergaz",
        //     // debug: function(_, query) {
        //     //     console.log("[DATABASE] EXECUTED QUERY:", query);
        //     // },
        // });

        const sql = postgres(process.env.DATABASE_URL!);
        // console.log("process.env.POSTGRES_URL", process.env.POSTGRES_HOST);
        // const db = drizzle({ client: client });
        console.log("[DATABASE] db connection established successfully ✔️");
        return sql
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
const sql = db_connect()


const createTables = async () => {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // await sql`
        // CREATE TABLE IF NOT EXISTS poll_options (
        //     id SERIAL PRIMARY KEY,
        //     option_id INT NOT NULL,
        //     poll_id INT REFERENCES polls(id) ON DELETE CASCADE,
        //     option_text TEXT NOT NULL,
        //     votes_count INT DEFAULT 0
        // );
        // `;

        console.log("Tables created successfully!");
    } catch (error) {
        console.error(error);
    }
}

export { sql, createTables };


