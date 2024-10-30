// Function to register a user
async function registerUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('Registration successful');
        window.location.href = 'login.html'; // Redirect to login page
    } else {
        const error = await response.json();
        alert('Registration failed: ' + error.message);
    }
}

// Function to log in a user
async function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
    } else {
        alert('Login failed');
    }
}

// Function to fetch poll results and display them
async function fetchPollResults() {
    const response = await fetch('/poll', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    document.getElementById('poll-results').textContent = JSON.stringify(data);
}

// Function to submit a poll response
async function submitPollResponse(responseType) {
    const response = await fetch('/poll', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: responseType })
    });

    if (response.ok) {
        alert('Response submitted');
        fetchPollResults(); // Refresh poll results
    } else {
        alert('Failed to submit response');
    }
}

// Function to fetch and display user finance data
async function fetchFinanceData() {
    const response = await fetch('/finance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    document.getElementById('finance-data').textContent = 
        `Dlh: ${data.debt}, Platby: ${data.payments}, Zostatok: ${data.balance}`;
}

// Event listeners
document.getElementById('login-form')?.addEventListener('submit', loginUser);
document.getElementById('register-form')?.addEventListener('submit', registerUser);
document.getElementById('poll-yes')?.addEventListener('click', () => submitPollResponse('pridem'));
document.getElementById('poll-no')?.addEventListener('click', () => submitPollResponse('nepridem'));
document.getElementById('poll-extra')?.addEventListener('click', () => submitPollResponse('mam hraca navyse'));

// On load, fetch poll results and finance data if on dashboard
if (window.location.pathname === '/dashboard.html') {
    fetchPollResults();
    fetchFinanceData();
}