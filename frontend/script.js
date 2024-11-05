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
        localStorage.setItem('isAdmin', data.isAdmin);
        window.location.href = 'dashboard.html';
    } else {
        alert('Login failed');
    }
}

async function loadDashboard() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (isAdmin) {
        document.getElementById('admin-section').style.display = 'block';
    } else {
        document.getElementById('user-section').style.display = 'block';
    }
}

if (window.location.pathname === '/dashboard.html') {
    loadDashboard();
}