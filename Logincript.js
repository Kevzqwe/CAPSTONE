// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
});

// Redirect on login button click
const loginButton = document.querySelector(".login-btn");

loginButton.addEventListener("click", () => {
    // Redirect without checking credentials
    window.location.href = "Student_Dashboard.html";

    


 const loginButton = document.querySelector('.login-btn');
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.getElementById('password');

        // Login on button click
        function handleLogin(event) {
            event.preventDefault();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value.trim().toLowerCase();

            if (email === "student" && password === "student") {
                window.location.href = "Student_Dashboard.html";
            } else if (email === "admin" && password === "admin") {
                window.location.href = "Admin_Dashboard.html";
            } else {
                alert("Invalid email or password.");
            }
        }

        loginButton.addEventListener('click', handleLogin);

        // Login on Enter key
        document.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                handleLogin(event);
            }
        });

    });