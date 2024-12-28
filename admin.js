function toggleSection(sectionId) {
    const sections = document.querySelectorAll(".toggle-section");
    sections.forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

function displayMessage(element, message, success = true) {
    element.textContent = message;
    element.style.color = success ? 'green' : 'red'; // Optional: color-code messages
}

document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.getElementById("login-btn");
    const adminPanel = document.getElementById("admin-panel");
    const loginSection = document.getElementById("login-section");
    const loginMessage = document.getElementById("login-message");
    const currentMaintenanceStatus = document.getElementById("current-maintenance-status");


    loginBtn.addEventListener("click", function() {
        const enteredKey = document.getElementById("admin-key").value;
        const validKey = "nhacid@00001@winner@konkhmer";

        if (enteredKey === validKey) {
            loginSection.style.display = "none";
            adminPanel.style.display = "block";
            fetchDashboardData(); // Fetch dashboard data on successful login
            fetchCurrentMaintenanceStatus(); // Fetch current maintenance status
        } else {
            displayMessage(loginMessage, "Invalid key. Please try again.", false);
        }
    });

    // Toggle sections
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const sectionId = link.getAttribute("data-section");
            toggleSection(sectionId);
        });
    });

    // Fetch dashboard data
    async function fetchDashboardData() {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();

            if (data.success) {
                document.getElementById("active-users-count").textContent = data.activeUsers;
                document.getElementById("total-keys-count").textContent = data.totalKeys;
            } else {
                console.error("Failed to fetch dashboard data.");
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }

    // Fetch current maintenance status
    async function fetchCurrentMaintenanceStatus() {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();

            if (data.success) {
                const isInMaintenance = data.maintenance;
                document.getElementById("current-maintenance-status").innerHTML = Maintenance Mode is <strong>${isInMaintenance ? "ON" : "OFF"}</strong>.;
            } else {
                console.error("Failed to fetch maintenance status.");
            }
        } catch (error) {
            console.error("Error fetching maintenance status:", error);
        }
    }

    // Key management functionalities
    const createKeyBtn = document.getElementById("create-key-btn");
    const listKeysBtn = document.getElementById("list-keys-btn");
    const removeKeyBtn = document.getElementById("remove-key-btn");
    const keyInput = document.getElementById("key-input");
    const newKeyInput = document.getElementById("new-key");
    const expirationDateInput = document.getElementById("expiration-date");
    const createKeyMessage = document.getElementById("create-key-message");
    const keyListContainer = document.getElementById("key-list");

    // Create key handler
    createKeyBtn.addEventListener("click", async function() {
        const newKey = newKeyInput.value.trim();
        const expirationDate = expirationDateInput.value;

        if (newKey && expirationDate) {
            try {
                const response = await fetch("/api/create-key", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: newKey, expires: expirationDate })
                });
                const data = await response.json();

                if (data.success) {
                    displayMessage(createKeyMessage, "Key created successfully!");
                    newKeyInput.value = "";
                    expirationDateInput.value = "";
                    fetchDashboardData(); // Update dashboard after creating a key
                } else {
                    displayMessage(createKeyMessage, "Failed to create key: " + data.message, false);
                }
            } catch (error) {
                displayMessage(createKeyMessage, "An error occurred: " + error.message, false);
            }
        } else {
            displayMessage(createKeyMessage, "Please enter a key and expiration date.", false);
        }
    });

   listKeysBtn.addEventListener("click", async function() {
    try {
        const response = await fetch("/api/list-keys", { method: "GET" });
        const data = await response.json();

        if (data.success) {
            keyListContainer.innerHTML = "<h3>🔑 Key List</h3>";
            data.keys.forEach(keyInfo => {
                const keyItem = document.createElement("div");

                // Check if the key is expired and set corresponding emoji and color
                if (keyInfo.expired) {
                    keyItem.innerHTML = `
                        ❌ <span style="color: red;">
                            Key: ${keyInfo.key} | Expires: ${keyInfo.expires} | Expired: true | User ID: ${keyInfo.user_id ? keyInfo.user_id : "Not Assigned"}
                        </span>`;
                } else {
                    keyItem.innerHTML = `
                        ✅ <span style="color: green;">
                            Key: ${keyInfo.key} | Expires: ${keyInfo.expires} | Expired: false | User ID: ${keyInfo.user_id ? keyInfo.user_id : "Not Assigned"}
                        </span>`;
                }

                keyListContainer.appendChild(keyItem);
            });
        } else {
            keyListContainer.innerHTML = "<p>Failed to retrieve keys.</p>";
        }
    } catch (error) {
        keyListContainer.innerHTML = "<p>Error retrieving keys: " + error.message + "</p>";
    }
});

    // Remove key handler
    removeKeyBtn.addEventListener("click", async function() {
        const keyToRemove = keyInput.value.trim();

        if (keyToRemove) {
            try {
                const response = await fetch("/api/remove-key", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: keyToRemove })
                });
                const data = await response.json();

                if (data.success) {
                    displayMessage(createKeyMessage, "Key removed successfully!");
                    keyInput.value = "";
                    fetchDashboardData(); // Update dashboard after removing a key
                } else {
                    displayMessage(createKeyMessage, "Failed to remove key: " + data.message, false);
                }
            } catch (error) {
                displayMessage(createKeyMessage, "An error occurred: " + error.message, false);
            }
        } else {
            displayMessage(createKeyMessage, "Please enter a key to remove.", false);
        }
    });

  // Banned users functionalities
    const addBannedUserBtn = document.getElementById("add-banned-user-btn");
    const bannedUserIdInput = document.getElementById("banned-user-id");
    const removeBannedUserBtn = document.getElementById("remove-banned-user-btn");
    const removeBannedUserIdInput = document.getElementById("remove-banned-user-id");
    const addBannedUserMessage = document.getElementById("add-banned-user-message");
    const removeBannedUserMessage = document.getElementById("remove-banned-user-message");

    // Add banned user handler
    addBannedUserBtn.addEventListener("click", async function() {
        const userId = bannedUserIdInput.value.trim();

        if (isValidUserId(userId)) {
            try {
                const response = await fetch("/api/add_id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId })
                });
                const data = await response.json();

                if (data.success) {
                    displayMessage(addBannedUserMessage, ✅ User ID ${userId} has been added to the banned list!);
                    bannedUserIdInput.value = "";
                } else {
                    displayMessage(addBannedUserMessage, "Failed to ban user: " + (data.error || data.message), false);
                }
            } catch (error) {
                displayMessage(addBannedUserMessage, "An error occurred: " + error.message, false);
            }
        } else {
            displayMessage(addBannedUserMessage, "⚠️ Invalid user ID format.", false);
        }
    });

    // Remove banned user handler
    removeBannedUserBtn.addEventListener("click", async function() {
        const userId = removeBannedUserIdInput.value.trim();

        if (isValidUserId(userId)) {
            try {
                const response = await fetch("/api/remove_id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId })
                });
                const data = await response.json();

                if (data.success) {
                    displayMessage(removeBannedUserMessage, ✅ User ID ${userId} has been removed from the banned list!);
                    removeBannedUserIdInput.value = "";
                } else {
                    displayMessage(removeBannedUserMessage, "Failed to unban user: " + (data.error || data.message), false);
                }
            } catch (error) {
                displayMessage(removeBannedUserMessage, "An error occurred: " + error.message, false);
            }
        } else {
            displayMessage(removeBannedUserMessage, "⚠️ Invalid user ID format.", false);
        }
    });

    // Validate user ID format (example function, adjust as needed)
    function isValidUserId(userId) {
        return /^\d+$/.test(userId); // Simple numeric check
    }

    // List banned users handler
    const listBannedUsersBtn = document.getElementById("list-banned-users-btn");
    const bannedUserListContainer = document.getElementById("banned-user-list");

    listBannedUsersBtn.addEventListener("click", async function() {
        try {
            const response = await fetch("/api/show_banned_id", { method: "GET" });
            const data = await response.json();

            if (data.success) {
                bannedUserListContainer.innerHTML = "<h3>Banned Users</h3>";
                data.bannedUsers.forEach(userId => {
                    const userItem = document.createElement("div");
                    userItem.textContent = Banned User ID: ${userId};
                    bannedUserListContainer.appendChild(userItem);
                });
            } else {
                bannedUserListContainer.innerHTML = "<p>No banned users found.</p>";
            }
        } catch (error) {
            bannedUserListContainer.innerHTML = "<p>Error retrieving banned users: " + error.message + "</p>";
        }
    });
    // Maintenance notification handlers
    const toggleMaintenanceBtn = document.getElementById("toggle-maintenance-btn");
    const maintenanceMessage = document.getElementById("maintenance-message");

    toggleMaintenanceBtn.addEventListener("click", async function() {
        try {
            const response = await fetch("/api/dashboard", { method: "POST" });
            const data = await response.json();

            if (data.success) {
                const isInMaintenance = data.maintenance;
                displayMessage(maintenanceMessage, Maintenance mode is now ${isInMaintenance ? "ON" : "OFF"}.);
                currentMaintenanceStatus.innerHTML = Maintenance Mode is <strong>${isInMaintenance ? "ON" : "OFF"}</strong>.;
            } else {
                displayMessage(maintenanceMessage, "Failed to toggle maintenance mode: " + data.message, false);
            }
        } catch (error) {
            displayMessage(maintenanceMessage, "An error occurred: " + error.message, false);
        }
    });
