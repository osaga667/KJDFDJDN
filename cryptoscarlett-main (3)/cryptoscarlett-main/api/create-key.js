import { Client } from 'pg';

export default async function handler(req, res) {
    const { key, expires } = req.body;
    
    // Basic validation
    if (!key || !expires) {
        res.status(400).json({ success: false, message: 'Key and expiration date are required.' });
        return;
    }

    const client = new Client({
        connectionString: "postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    });
    
    await client.connect();
    
    try {
        // Insert the new key into the PostgreSQL database
        const insertQuery = 'INSERT INTO keys (key, expires) VALUES ($1, $2)';
        await client.query(insertQuery, [key, expires]);

        console.log('Key created successfully:', key);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error creating key:', error);
        res.status(500).json({ success: false, message: 'Failed to create key in the database.' });
    } finally {
        await client.end();
    }
}
