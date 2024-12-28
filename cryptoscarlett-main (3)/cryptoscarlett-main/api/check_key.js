import { Client } from 'pg';

export default async function handler(req, res) {
    const { user_id } = req.query; // Get user_id from query parameters

    console.log('Received user_id:', user_id); // Log the received user_id

    if (!user_id) {
        return res.status(400).json({ valid: false, message: 'User ID is required' });
    }

    const client = new Client({
        connectionString: "postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    });

    await client.connect();

    try {
        const result = await client.query(
            'SELECT * FROM keys WHERE user_id = $1 AND expires > NOW()',
            [user_id]
        );

        console.log('Database query result:', result.rows); // Log the query result

        if (result.rows.length > 0) {
            return res.status(200).json({ valid: true }); // User has a valid key
        } else {
            return res.status(200).json({ valid: false, message: 'No valid key found for this user' });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ valid: false, message: 'Database error' });
    } finally {
        await client.end();
    }
}
