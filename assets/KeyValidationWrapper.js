const checkKey = async () => {
    try {
        const tg = window.Telegram?.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id;

        if (!userId) {
            console.log('No user ID found');
            redirectToIndex();
            return;
        }

        // Retrieve the key from localStorage
        const key = localStorage.getItem('userKey');

        // Proceed with the API call
        const response = await fetch('/api/validate-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, user_id: userId }),
        });

        const data = await response.json();

        if (!data.valid) {
            console.log('Invalid or expired key');
            redirectToIndex();
        }
    } catch (error) {
        console.error('Error checking key:', error);
        redirectToIndex();
    }
};
