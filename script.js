// Registration
async function register(username, password) {
    await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
}

// Login
async function login(username, password) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    if (result.isAdmin) showAdminSection();
    else showUserSection();
}

// Logout
async function logout() {
    await fetch('/logout', { method: 'POST' });
    showLoginSection();
}

// Poll status and responses
async function loadPollStatus() {
    const response = await fetch('/poll/status');
    const result = await response.json();
    displayPoll(result.poll, result.responses);
}

// Vote on poll
async function vote(pollId, response) {
    await fetch('/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, response })
    });
}

// View finances
async function loadUserFinances() {
    const response = await fetch('/user/finances');
    const result = await response.json();
    displayFinances(result.balance, result.participations);
}

// Create poll (Admin)
async function createPoll(dateTime, note) {
    await fetch('/admin/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime, note })
    });
}

// Close current poll (Admin)
async function closePoll() {
    await fetch('/admin/poll/close', { method: 'POST' });
}

// Load past polls (Admin)
async function loadPastPolls() {
    const response = await fetch('/admin/polls');
    const polls = await response.json();
    displayPastPolls(polls);
}

// Add deposit (Admin)
async function addDeposit(userId, amount) {
    await fetch('/admin/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
    });
}

// Delete user (Admin)
async function deleteUser(userId) {
    await fetch('/admin/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
}