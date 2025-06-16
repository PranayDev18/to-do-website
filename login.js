// Registration
document.getElementById('registerForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;
  
    try {
      const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful! Please log in.');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Registration failed.');
    }
  });
  
  // Login
  document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;
  
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        window.location.href = 'app.html';
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Login failed.');
    }
  });
  