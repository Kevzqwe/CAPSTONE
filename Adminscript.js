const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' };
document.getElementById('welcomeDate').textContent = new Date().toLocaleDateString('en-US', dateOptions);

// Logout button redirects to Login.html
    document.getElementById('logout-btn').addEventListener('click', function() {
        window.location.href = 'Login.html';
    });