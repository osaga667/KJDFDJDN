import { Pool } from 'pg';

// Set up PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

// API route to get banned user IDs
export default async function handler(req, res) {
    try {
        const result = await pool.query('SELECT user_id FROM banned_users');
        const bannedUserIds = result.rows.map(row => row.user_id);
        res.status(200).json(bannedUserIds);
    } catch (error) {
        console.error('Error fetching banned users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
