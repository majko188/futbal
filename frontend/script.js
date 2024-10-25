document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent the default form submission

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token); // Store the token

    // Check if the user is admin
    const userResponse = await fetch('/user', { // Endpoint to get user info
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData.username === 'admin') {
        window.location.href = 'dashboard.html'; // Redirect to the dashboard if admin
      } else {
        alert('You do not have admin access.');
        window.location.href = 'index.html'; // Redirect to a different page if not admin
      }
    }
  } else {
    const error = await response.text();
    alert('Login failed: ' + error);
  }
});
