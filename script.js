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
    const userResponse = await fetch('/user');
    const userData = await userResponse.json();

    document.getElementById('username').textContent = userData.username;
    document.getElementById('balance').textContent = userData.balance;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';

    const pollResponse = await fetch('/poll');
    const pollData = await pollResponse.json();
    document.getElementById('poll').textContent = pollData.poll ? pollData.poll.title : 'No active poll';
}

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