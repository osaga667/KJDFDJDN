import { Client } from 'pg';

export default async function handler(req, res) {
    const client = new Client({
        connectionString: "postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    });

    await client.connect();

    try {
        const selectQuery = 'SELECT key, expires, user_id FROM keys';
        const result = await client.query(selectQuery);
        
        const currentDate = new Date(); // Current date/time

        // Store the keys for response
        const keys = [];
        const expiredKeys = []; // Array to hold expired keys for deletion

        result.rows.forEach(row => {
            const expiresDate = new Date(row.expires); // Convert string to Date object
            const expired = expiresDate < currentDate; // Compare expiration date to current date
            const statusEmoji = expired ? '⛔' : '✅';
            const statusColor = expired ? 'red' : 'green';
            const userId = row.user_id ? row.user_id : 'Not assigned';
            
            // Add to keys array for response
            keys.push({
                key: row.key,
                expires: row.expires,
                expired: expired,
                user_id: userId,
                status: `${statusEmoji} ${expired ? 'Expired' : 'Active'}`, // Add emoji and status text
                color: statusColor // Include color for frontend
            });

            // If the key is expired, add it to the expiredKeys array for deletion
            if (expired) {
                expiredKeys.push(row.key); // Store the key to delete later
            }
        });

        // If there are expired keys, remove them from the database
        if (expiredKeys.length > 0) {
            const deleteQuery = 'DELETE FROM keys WHERE key = ANY($1)';
            await client.query(deleteQuery, [expiredKeys]);
        }

        // Return the current state of keys, including the status of each key
        res.status(200).json({ success: true, keys });
    } catch (error) {
        console.error('Error retrieving keys:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve keys.' });
    } finally {
        await client.end();
    }
}
