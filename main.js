// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Check maintenance status from the server
async function checkMaintenanceStatus() {
    try {
        const response = await fetch('/api/dashboard'); // Ensure the endpoint is correct
        const data = await response.json();
        return data.maintenance; // No change here
    } catch (error) {
        console.error('Error fetching maintenance status:', error);
        return false; // Default to not in maintenance mode if there's an error
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    // Get maintenance status from the server
    const isMaintenance = await checkMaintenanceStatus();

    // Show maintenance notification if maintenance mode is on
    if (isMaintenance) {
        document.getElementById('maintenanceNotification').style.display = 'block';
        document.getElementById('login-container').style.display = 'none'; // Hide login container
        return; // Exit the function if maintenance mode is active
    }

    // Ensure the page is accessed via Telegram WebView
    if (!tg.initData || !tg.initDataUnsafe) {
        document.body.innerHTML = '<h1>Access Restricted</h1><p>This page is only accessible through the Telegram app.</p>';
        return;
    }

    // Get the user ID from Telegram Web App data
    const userId = tg.initDataUnsafe.user?.id;
    console.log("User ID from Telegram Web App:", userId);

    if (!userId) {
        document.body.innerHTML = '<h1>Error</h1><p>Unable to retrieve Telegram User ID.</p>';
        return;
    }

    // Check if user is banned
    try {
        const banResponse = await fetch(`/api/check_ban?user_id=${userId}`);
        const banData = await banResponse.json();
        console.log("Ban check response:", banData);

        if (banData.banned) {
            window.location.href = banData.redirect; // Redirect if banned
            return;
        }
    } catch (error) {
        console.error("Error checking ban status:", error);
        document.getElementById('message').innerText = 'An error occurred while checking ban status.';
        return;
    }

    // Check if the user already has a valid key
    try {
        const keyCheckResponse = await fetch(`/api/check_key?user_id=${userId}`);
        const keyCheckData = await keyCheckResponse.json();
        console.log("Key check response:", keyCheckData);

        if (keyCheckData.valid) {
            // Show verification section if the key is valid
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('verify-container').style.display = 'block';
            return;
        }
    } catch (error) {
        console.error("Error checking key validity:", error);
        document.getElementById('message').innerText = 'An error occurred while checking key status.';
    }

    // Handle form submission for key validation
    document.getElementById('keyForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form from reloading the page
        const userKey = document.getElementById('userKey').value;
        console.log("User key submitted:", userKey);

        fetch('/api/validate-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: userKey, user_id: userId })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Validation response:", data);

            if (data.valid) {
                // Show verification section if key is valid
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('verify-container').style.display = 'block';
            } else {
                document.getElementById('message').innerText = data.message || 'Invalid or expired key.';
            }
        })
        .catch(error => {
            console.error('Error validating key:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again later.';
        });
    });

    // Handle CAPTCHA verification
    document.getElementById('captchaForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent form from reloading the page

        // Get the reCAPTCHA response token
        const recaptchaResponse = grecaptcha.getResponse();

        if (!recaptchaResponse) {
            document.getElementById('message').innerText = 'Please complete the CAPTCHA.';
            return;
        }

        try {
            // Send the reCAPTCHA token to your server for verification
            const response = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: recaptchaResponse })
            });

            const data = await response.json();

            if (data.success) {
                // CAPTCHA verification was successful, now show verification section
                document.getElementById('verify-container').style.display = 'block';
                document.getElementById('login-container').style.display = 'none';
            } else {
                // Show an error message if CAPTCHA verification fails
                document.getElementById('message').innerText = 'reCAPTCHA verification failed. Please try again.';
            }
        } catch (error) {
            console.error('Error verifying reCAPTCHA:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again.';
        }
    });
});
