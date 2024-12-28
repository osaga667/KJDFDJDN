import { Pool } from 'pg';

// Set up PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

// API route to check if a user is banned
export default async function handler(req, res) {
    // Ensure it's a GET request
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const result = await pool.query('SELECT * FROM banned_users WHERE user_id = $1', [userId]);
        const isBanned = result.rows.length > 0; // Check if any row is returned

        if (isBanned) {
            return res.status(200).json({ banned: true, redirect: 'assets/ban.html' });
        } else {
            return res.status(200).json({ banned: false });
        }
    } catch (error) {
        console.error('Error checking ban status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
