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
    window.location.href = 'dashboard.html'; // Redirect to the dashboard page
  } else {
    const error = await response.text();
    alert('Login failed: ' + error);
  }
});
