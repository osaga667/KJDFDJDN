import { Client } from 'pg';

export default async function handler(req, res) {
    // Ensure the request is a POST with valid data
    if (req.method !== 'POST') {
        return res.status(405).json({ valid: false, message: 'Method Not Allowed' });
    }

    const { key, user_id } = req.body; // Get key and user_id from the request body

    if (!key || !user_id) {
        return res.status(400).json({ valid: false, message: 'Key and User ID are required' });
    }

    const client = new Client({
        connectionString: "postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    });

    await client.connect();

   
    try {
        // Check if the key exists and is valid (either no expiration or has not expired, and either no user or is already assigned to this user)
        const result = await client.query(
            'SELECT * FROM keys WHERE key = $1 AND (expires IS NULL OR expires > NOW()) AND (user_id IS NULL OR user_id = $2)',
            [key, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ valid: false, message: 'Invalid or expired key' });
        }

        // If the key doesn't have a user_id, assign the user_id and set expiration (e.g., 30 days from now)
        if (!result.rows[0].user_id) {
            const newExpiration = new Date();
            newExpiration.setDate(newExpiration.getDate() + 30); // Set expiration to 30 days from now

            await client.query(
                'UPDATE keys SET user_id = $1, expires = $2 WHERE key = $3',
                [user_id, newExpiration, key]
            );
        }
        // Respond with success but don't redirect; handle the front-end flow to show the CAPTCHA section
        return res.status(200).json({ valid: true, message: 'Key is valid' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ valid: false, message: 'Database error' });
    } finally {
        await client.end();
    }
}
