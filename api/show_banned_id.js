import { Pool } from 'pg';

// Set up PostgreSQL connection
const pool = new Pool({
    connectionString: 'postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
});

// API route to show all banned user IDs
export default async function handler(req, res) {
    try {
        const result = await pool.query('SELECT user_id FROM banned_users');
        const bannedUserIds = result.rows.map(row => row.user_id);
        
        // Respond with a structured object
        res.status(200).json({ success: true, bannedUsers: bannedUserIds });
    } catch (error) {
        console.error('Error fetching banned user IDs:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
