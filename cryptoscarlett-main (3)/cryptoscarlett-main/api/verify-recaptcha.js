export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Get the secret key from Vercel environment variables
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
        const response = await fetch(verificationUrl, {
            method: 'POST',
        });
        const data = await response.json();

        if (data.success) {
            // reCAPTCHA verification succeeded
            return res.status(200).json({ success: true });
        } else {
            // reCAPTCHA verification failed
            console.error('reCAPTCHA verification failed:', data['error-codes']);
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed',
                'error-codes': data['error-codes']
            });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
