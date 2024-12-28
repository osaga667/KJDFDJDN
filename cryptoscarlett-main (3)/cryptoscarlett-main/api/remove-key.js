import { Client } from 'pg';

export default async function handler(req, res) {
    const { key } = req.body;

    if (!key) {
        res.status(400).json({ success: false, message: 'Key is required.' });
        return;
    }

    const client = new Client({
        connectionString: "postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
    });

    await client.connect();

    try {
        // Automatically remove expired keys before checking for the specific key
        const removeExpiredQuery = 'DELETE FROM keys WHERE expires < NOW()';
        await client.query(removeExpiredQuery);

        // Proceed to remove the specified key
        const deleteQuery = 'DELETE FROM keys WHERE key = $1';
        const result = await client.query(deleteQuery, [key]);

        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Key not found.' });
        } else {
            res.status(200).json({ success: true, message: 'Key removed successfully.' });
        }
    } catch (error) {
        console.error('Error removing key:', error);
        res.status(500).json({ success: false, message: 'Failed to remove key.' });
    } finally {
        await client.end();
    }
}
