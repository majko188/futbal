// Function to display the login section and hide the dashboard
function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
}

// Function to load the dashboard content
async function loadDashboard() {
    try {
        const userResponse = await fetch('/user');
        if (userResponse.status === 401) {
            showLoginSection();
            return;
        }
        const userData = await userResponse.json();

        // Display user info
        document.getElementById('username').textContent = userData.username || 'Guest';
        document.getElementById('balance').textContent = userData.balance || 0;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';

        // Show admin or user section based on role
        if (userData.isAdmin) {
            document.getElementById('admin-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'none';
        } else {
            document.getElementById('user-section').style.display = 'block';
            document.getElementById('admin-section').style.display = 'none';
        }

        // Load poll data
        loadPollData();
    } catch (error) {
        console.error("Error loading dashboard:", error);
        showLoginSection();
    }
}

// Function to load poll data
async function loadPollData() {
    try {
        const pollResponse = await fetch('/poll');
        const pollData = await pollResponse.json();
        document.getElementById('poll').textContent = pollData.poll ? pollData.poll.title : 'No active poll';
    } catch (error) {
        console.error("Error loading poll data:", error);
        document.getElementById('poll').textContent = 'Error loading poll data';
    }
}

// Function to handle login
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            loadDashboard(); // Load the dashboard on successful login
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert('Login error');
    }
}

// Event listener for login form submission
document.getElementById('login-form')?.addEventListener('submit', handleLogin);

// Function to create a new poll (admin only)
async function createPoll(event) {
    event.preventDefault();

    const title = document.getElementById('poll-title').value;
    const dateTime = document.getElementById('poll-date').value;
    const note = document.getElementById('poll-note').value;

    try {
        const response = await fetch('/admin/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, dateTime, note })
        });

        if (response.ok) {
            alert('New poll created successfully');
            document.getElementById('new-poll-form').reset();
            loadPollData(); // Refresh poll display if needed
        } else {
            const error = await response.json();
            alert('Failed to create poll: ' + error.message);
        }
    } catch (error) {
        console.error("Error creating poll:", error);
        alert('Error creating poll');
    }
}

// Event listener for new poll form submission (admin only)
document.getElementById('new-poll-form')?.addEventListener('submit', createPoll);

// Initial check for authentication and load content
document.addEventListener('DOMContentLoaded', loadDashboard);