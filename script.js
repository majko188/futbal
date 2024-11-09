document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        loadDashboard();
    } else {
        alert('Login failed');
    }
});

async function loadDashboard() {
    try {
        // Fetch user details
        const userResponse = await fetch('/user');
        const userData = await userResponse.json();

        // Update user details on the dashboard
        document.getElementById('username').textContent = userData.username;
        document.getElementById('balance').textContent = userData.balance;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';

        // Show admin section if the user is an admin, else show the regular user section
        if (userData.isAdmin) {
            document.getElementById('admin-section').style.display = 'block';
            document.getElementById('user-section').style.display = 'none';
        } else {
            document.getElementById('user-section').style.display = 'block';
            document.getElementById('admin-section').style.display = 'none';
        }

        // Fetch the current poll and display it
        const pollResponse = await fetch('/poll');
        const pollData = await pollResponse.json();
        document.getElementById('poll').textContent = pollData.poll ? pollData.poll.title : 'No active poll';

    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}


// Function to fetch user details and check if the user is an admin
async function fetchUserDetails() {
    const response = await fetch('/user');
    const data = await response.json();

    // Show sections based on the user role
    if (data.isAdmin) {
        document.getElementById('admin-section').style.display = 'block';
        loadAdminData(); // Load admin-specific data if needed
    } else {
        document.getElementById('user-section').style.display = 'block';
    }

    return data;
}




// Call loadDashboard when the page loads
document.addEventListener('DOMContentLoaded', loadDashboard);

// Function to create a new poll (admin only)
async function createPoll(event) {
    event.preventDefault();

    const title = document.getElementById('poll-title').value;
    const dateTime = document.getElementById('poll-date').value;
    const note = document.getElementById('poll-note').value;

    const response = await fetch('/admin/poll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, dateTime, note })
    });

    if (response.ok) {
        alert('New poll created successfully');
        document.getElementById('new-poll-form').reset();
        fetchPollResults(); // Refresh poll results if needed
    } else {
        const error = await response.json();
        alert('Failed to create poll: ' + error.message);
    }
}

// Event listener for new poll form submission
document.getElementById('new-poll-form')?.addEventListener('submit', createPoll);