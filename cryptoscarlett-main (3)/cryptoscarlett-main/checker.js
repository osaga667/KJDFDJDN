// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

document.addEventListener("DOMContentLoaded", function () {
    // Ensure the page is accessed via Telegram WebView
    if (!tg.initData || !tg.initDataUnsafe) {
        document.body.innerHTML = '<h1>Access Restricted</h1><p>This page is only accessible through the Telegram app.</p>';
        return;
    }

    // Handle form submission
    document.getElementById('captchaForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the reCAPTCHA response token
        const recaptchaResponse = grecaptcha.getResponse();

        if (!recaptchaResponse) {
            document.getElementById('message').innerText = 'Please complete the CAPTCHA.';
            return;
        }

        try {
            // Send the token to your server for verification
            const response = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: recaptchaResponse }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('reCAPTCHA verified successfully. Redirecting to blockchain.html');
                // Check if the user is logged in and redirect to blockchain.html
                window.location.href = 'assets/blockchain.html';
            } else {
                console.error('Verification failed:', data.message);
                document.getElementById('message').innerText = 'reCAPTCHA verification failed. Please try again.';
            }
        } catch (error) {
            console.error('Error during verification:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again.';
        }
    });
});
