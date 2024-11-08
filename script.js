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