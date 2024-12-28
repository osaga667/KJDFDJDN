import { Pool } from 'pg';

// Set up PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

// API route to remove a banned user ID
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Ensure user_id is a string or number
        if (typeof user_id !== 'string' && typeof user_id !== 'number') {
            return res.status(400).json({ error: 'User ID must be a string or number' });
        }

        // Remove user_id from banned_users table
        const result = await pool.query('DELETE FROM banned_users WHERE user_id = $1', [user_id]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: '✅ User ID removed from banned list!' });
        } else {
            res.status(404).json({ message: '❌ User ID not found in banned list.' });
        }
    } catch (error) {
        console.error('Error removing banned user ID:', error);
        // Removed specific failure message
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
