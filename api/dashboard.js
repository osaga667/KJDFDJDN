import { Client } from 'pg';

const connectionString = "postgres://default:j3VrnWaBy1SA@ep-withered-wildflower-a4gz07xa.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require";

async function connectToDatabase() {
    const client = new Client({ connectionString });
    await client.connect();
    return client;
}

async function getMaintenanceStatus(client) {
    const maintenanceQuery = 'SELECT is_maintenance FROM settings LIMIT 1';
    const maintenanceResult = await client.query(maintenanceQuery);
    return maintenanceResult.rows[0]?.is_maintenance; // Optional chaining to avoid errors
}

async function getDashboardData(client) {
    const keysQuery = 'SELECT COUNT(*) AS total_keys FROM keys';
    const activeUsersQuery = `
        SELECT user_id, MAX(last_activity) AS last_activity 
        FROM user_activity 
        GROUP BY user_id
    `;
    const keySelectQuery = 'SELECT key, expires FROM keys';

    const [keysResult, activeUsersResult, keys] = await Promise.all([
        client.query(keysQuery),
        client.query(activeUsersQuery),
        client.query(keySelectQuery)
    ]);

    const currentDate = new Date();

    // Check for expired keys
    const processedKeys = keys.rows.map(row => ({
        key: row.key,
        expires: row.expires,
        expired: new Date(row.expires) < currentDate // Add expired status
    }));

    const activeUsers = activeUsersResult.rows.map(user => ({
        user_id: user.user_id,
        last_activity: user.last_activity
    }));

    return {
        keys: processedKeys,
        totalKeys: parseInt(keysResult.rows[0].total_keys, 10),
        activeUsers: activeUsers.length,
        userActivity: activeUsers,
    };
}

export default async function handler(req, res) {
    const client = await connectToDatabase();

    try {
        if (req.method === 'GET') {
            const isMaintenance = await getMaintenanceStatus(client); // Correct variable
            const dashboardData = await getDashboardData(client);

         res.status(200).json({
    success: true,
    ...dashboardData,
    maintenance: isMaintenance, // Change 'maintenanceMode' to 'maintenance'
});
        } else if (req.method === 'POST') {
            const currentStatus = await getMaintenanceStatus(client); // No change here
            const newStatus = !currentStatus; // Toggle the current status
            await client.query('UPDATE settings SET is_maintenance = $1', [newStatus]);

            res.status(200).json({ success: true, maintenance: newStatus });
        } else {
            res.status(405).json({ success: false, message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    } finally {
        await client.end();
    }
}
