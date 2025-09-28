// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        // Optional: Change icon/text to reflect current state
        const icon = togglePassword.querySelector('i');
        if (icon) {
            icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
        }
    });
}

// Login logic
const loginButton = document.querySelector('.login-btn');
const emailInput = document.querySelector('input[type="email"]');
let isLoggingIn = false;

// Clear any existing session data on page load
window.addEventListener('load', () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
});

async function handleLogin(event) {
    event.preventDefault();
    if (isLoggingIn) return;
    isLoggingIn = true;

    // Show loading state
    const originalText = loginButton.textContent;
    const originalColor = loginButton.style.backgroundColor;
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    // Enhanced input validation
    if (!email || !password) {
        showError('Please enter both email and password');
        resetLoginButton(originalText, originalColor);
        return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        resetLoginButton(originalText, originalColor);
        return;
    }

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get the response as text first for debugging
        const responseText = await response.text();
        console.log('Server response:', responseText);

        // Parse JSON response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response text:', responseText);
            showError('Server returned invalid response. Please try again.');
            resetLoginButton(originalText, originalColor);
            return;
        }

        if (data.status === 'success') {
            // Show success message
            loginButton.textContent = 'Success! Redirecting...';
            loginButton.style.backgroundColor = '#28a745';
            
            // Store user info in sessionStorage
            sessionStorage.setItem('userRole', data.role);
            sessionStorage.setItem('userEmail', email);
            
            // Optional: Store additional user data if provided
            if (data.admin_id) {
                sessionStorage.setItem('adminId', data.admin_id);
            }
            if (data.student_id) {
                sessionStorage.setItem('studentId', data.student_id);
            }
            
            console.log('Login successful, redirecting to:', data.redirect);
            
            // Small delay for better UX, then redirect
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 500);
            
        } else {
            // Show error message
            showError(data.message || 'Login failed. Please try again.');
            resetLoginButton(originalText, originalColor);
        }

    } catch (error) {
        console.error('Network error:', error);
        showError("Unable to connect to server. Please check your connection and try again.");
        resetLoginButton(originalText, originalColor);
    }
}

function resetLoginButton(originalText, originalColor = '') {
    loginButton.textContent = originalText;
    loginButton.disabled = false;
    loginButton.style.backgroundColor = originalColor;
    isLoggingIn = false;
}

function showError(message) {
    // You can customize this to show errors in a nicer way
    alert(message);
    
    // Optional: Add visual feedback to inputs
    if (emailInput) emailInput.style.borderColor = '#dc3545';
    if (passwordInput) passwordInput.style.borderColor = '#dc3545';
    
    // Reset border colors after 3 seconds
    setTimeout(() => {
        if (emailInput) emailInput.style.borderColor = '';
        if (passwordInput) passwordInput.style.borderColor = '';
    }, 3000);
}

// Clear error styling when user starts typing
function clearErrorStyling() {
    if (emailInput) emailInput.style.borderColor = '';
    if (passwordInput) passwordInput.style.borderColor = '';
}

if (emailInput) {
    emailInput.addEventListener('input', clearErrorStyling);
}
if (passwordInput) {
    passwordInput.addEventListener('input', clearErrorStyling);
}

// Event listeners
if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
}

// Handle Enter key press
document.addEventListener('keydown', function(event) {
    if (event.key === "Enter" && !isLoggingIn) {
        const activeElement = document.activeElement;
        if (activeElement === emailInput || activeElement === passwordInput || activeElement === loginButton) {
            handleLogin(event);
        }
    }
});

// Handle form submission if there's a form
const loginForm = document.querySelector('form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// IMPROVED LOGOUT FUNCTIONALITY
function logout() {
    console.log('Logout function called');
    
    // Show loading state if there's a logout button
    const logoutBtn = document.querySelector('.logout-btn, #logoutBtn, [onclick*="logout"]');
    let originalText = '';
    
    if (logoutBtn) {
        originalText = logoutBtn.textContent;
        logoutBtn.textContent = 'Logging out...';
        logoutBtn.disabled = true;
    }

    fetch('logout.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Logout response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
    })
    .then(responseText => {
        console.log('Raw logout server response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response text:', responseText);
            throw new Error('Invalid server response: ' + responseText.substring(0, 100));
        }

        console.log('Parsed logout response:', data);

        if (data.status === 'success') {
            console.log('Logout successful, redirecting to:', data.redirect);
            
            // Clear all session storage
            try {
                sessionStorage.clear();
                localStorage.clear();
            } catch (e) {
                console.log('Storage clear error (harmless):', e);
            }
            
            // Show success message briefly
            if (logoutBtn) {
                logoutBtn.textContent = 'Success! Redirecting...';
                logoutBtn.style.backgroundColor = '#28a745';
            }
            
            // Force redirect to Login.html
            setTimeout(() => {
                console.log('Redirecting to Login.html...');
                window.location.href = data.redirect;
            }, 500);
            
        } else {
            console.error('Logout failed:', data.message);
            alert('Logout failed: ' + (data.message || 'Unknown error'));
            
            // Reset button state
            if (logoutBtn) {
                logoutBtn.textContent = originalText;
                logoutBtn.disabled = false;
                logoutBtn.style.backgroundColor = '';
            }
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        
        // Even if server request fails, still logout locally
        console.log('Server request failed, forcing local logout...');
        
        try {
            sessionStorage.clear();
            localStorage.clear();
        } catch (e) {
            console.log('Storage clear error (harmless):', e);
        }
        
        // Show error but still redirect
        alert('Logout request failed, but clearing local session...');
        
        // Force redirect to login page anyway
        setTimeout(() => {
            console.log('Force redirecting to Login.html...');
            window.location.href = 'Login.html';
        }, 1000);
    });
}

// Simple logout function (bypasses server)
function forceLogout() {
    console.log('Force logout called');
    
    // Clear all session data
    try {
        sessionStorage.clear();
        localStorage.clear();
    } catch (e) {
        console.log('Storage clear error (harmless):', e);
    }
    
    // Direct redirect
    console.log('Force redirecting to Login.html');
    window.location.href = 'Login.html';
}

// Make logout functions available globally
window.logout = logout;
window.forceLogout = forceLogout;

// Test function for debugging
function testLogout() {
    console.log('=== TESTING LOGOUT ===');
    console.log('Current session storage:', sessionStorage);
    logout();
}
window.testLogout = testLogout;