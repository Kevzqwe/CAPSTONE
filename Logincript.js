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

    
});
