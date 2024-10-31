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
        window.location.href = 'login.html';
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

// Function to fetch poll responses
async function fetchPollResults() {
    const response = await fetch('/poll', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    const pollResultsEl = document.getElementById('poll-responses');
    pollResultsEl.innerHTML = ''; // Clear previous responses
    data.forEach(response => {
        const li = document.createElement('li');
        li.textContent = `${response.username}: ${response.odpoved}`;
        pollResultsEl.appendChild(li);
    });
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
    document.getElementById('debt').textContent = data.debt;
    document.getElementById('payments').textContent = data.payments;
    document.getElementById('balance').textContent = data.balance;
}

// Function to fetch user details and check for admin privileges
async function fetchUserDetails() {
    const response = await fetch('/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();

    if (data.isAdmin) {
        document.getElementById('admin-section').style.display = 'block';
        loadAdminData();
    }

    return data;
}

// Admin-only data loading functions
async function loadAdminData() {
    const usersResponse = await fetch('/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const users = await usersResponse.json();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.username} - Balance: ${user.balance} EUR`;
        userList.appendChild(li);
    });
}

// Event listeners
document.getElementById('login-form')?.addEventListener('submit', loginUser);
document.getElementById('register-form')?.addEventListener('submit', registerUser);
document.getElementById('poll-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitPollResponse(document.getElementById('poll-response').value);
});

// On load, fetch user and finance data if on dashboard
if (window.location.pathname === '/dashboard.html') {
    fetchUserDetails();
    fetchPollResults();
    fetchFinanceData();
}