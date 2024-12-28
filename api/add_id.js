import { Pool } from 'pg';

// Set up PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

// API route to add a banned user ID
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        if (typeof user_id !== 'string' && typeof user_id !== 'number') {
            return res.status(400).json({ error: 'User ID must be a string or number' });
        }

        // Attempt to insert user_id into banned_users table
        const result = await pool.query(
            'INSERT INTO banned_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
            [user_id]
        );

        // Check if a row was inserted
        if (result.rowCount > 0) {
            res.status(200).json({ message: '✅ User ID added to banned list!' });
        } else {
            res.status(409).json({ message: '❌ User ID is already in the banned list.' });
        }
    } catch (error) {
        console.error('Error adding banned user ID:', error);
        // Removed specific failure message
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
