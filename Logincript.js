// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
    });
}

// Login logic
const loginButton = document.querySelector('.login-btn');
const emailInput = document.querySelector('input[type="email"]');
let isLoggingIn = false;

async function handleLogin(event) {
    event.preventDefault();
    if (isLoggingIn) return;
    isLoggingIn = true;

    // Show loading state
    const originalText = loginButton.textContent;
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    // Input validation
    if (!email || !password) {
        alert('Please enter both email and password');
        resetLoginButton(originalText);
        return;
    }

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        // Get the response as text first for debugging
        const responseText = await response.text();
        console.log('Server response:', responseText);

        // Parse JSON response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parse error:', e);
            alert('Invalid server response: ' + responseText);
            resetLoginButton(originalText);
            return;
        }

        if (data.status === 'success') {
            // Show success message
            loginButton.textContent = 'Success! Redirecting...';
            loginButton.style.backgroundColor = '#28a745';
            
            // Store user info
            sessionStorage.setItem('userRole', data.role);
            sessionStorage.setItem('userEmail', email);
            
            console.log('Redirecting to:', data.redirect);
            
            // Redirect immediately
            window.location.href = data.redirect;
            
        } else {
            // Show error message
            alert(data.message || 'Login failed');
            resetLoginButton(originalText);
        }

    } catch (error) {
        console.error('Network error:', error);
        alert("Error connecting to server.");
        resetLoginButton(originalText);
    }
}

function resetLoginButton(originalText) {
    loginButton.textContent = originalText;
    loginButton.disabled = false;
    loginButton.style.backgroundColor = '';
    isLoggingIn = false;
}

// Event listeners
if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
}

// Handle Enter key press
document.addEventListener('keydown', function(event) {
    if (event.key === "Enter" && !isLoggingIn) {
        const activeElement = document.activeElement;
        if (activeElement === emailInput || activeElement === passwordInput) {
            handleLogin(event);
        }
    }
});

// Handle form submission if there's a form
const loginForm = document.querySelector('form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}