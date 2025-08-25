 // Set current date
        const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' };
        document.getElementById('welcomeDate').textContent = new Date().toLocaleDateString('en-US', dateOptions);

        // Logout button redirects to Login.html
        document.getElementById('logout-btn').addEventListener('click', function() {
            window.location.href = 'Login.html';
        });

        // Navigation functionality
        document.addEventListener('DOMContentLoaded', function() {
            const navButtons = document.querySelectorAll('.nav-btn');
            const sections = document.querySelectorAll('.page-section');

            // Set current date
            const welcomeDate = document.getElementById('welcomeDate');
            if (welcomeDate) {
                const today = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                welcomeDate.textContent = today.toLocaleDateString('en-US', options);
            }

            // Navigation click handlers
            navButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    // Add active class to clicked button
                    this.classList.add('active');

                    // Hide all sections
                    sections.forEach(section => section.classList.remove('active'));

                    // Show corresponding section
                    const sectionId = this.id.replace('-btn', '-section');
                    const targetSection = document.getElementById(sectionId);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                });
            });

            // Status dropdown functionality
            const statusDropdowns = document.querySelectorAll('.status-dropdown');
            statusDropdowns.forEach(dropdown => {
                // Set initial data attribute
                dropdown.setAttribute('data-status', dropdown.value);
                
                // Handle status change
                dropdown.addEventListener('change', function() {
                    this.setAttribute('data-status', this.value);
                });
            });

            // Logout functionality
            const logoutBtn = document.getElementById('logout-btn');
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    // Redirect to login page or home page
                    window.location.href = 'Login.html'; // Change this to your login page
                }
            });
        });

        // Login functionality (if needed)
        const loginButton = document.querySelector('.login-btn');
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.getElementById('password');

        function handleLogin(event) {
            event.preventDefault();
            const email = emailInput?.value.trim().toLowerCase();
            const password = passwordInput?.value.trim().toLowerCase();

            if (email === "student" && password === "student") {
                window.location.href = "Student_Dashboard.html";
            } else if (email === "admin" && password === "admin") {
                window.location.href = "Admin_Dashboard.html";
            } else {
                alert("Invalid email or password.");
            }
        }

        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }

        // Login on Enter key
        document.addEventListener('keydown', function(event) {
            if (event.key === "Enter" && (emailInput || passwordInput)) {
                handleLogin(event);
            }
        });

        // Document button functionality
document.addEventListener('DOMContentLoaded', function() {
    const documentButtons = document.querySelectorAll('.document-button');
    
    documentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const documentType = this.getAttribute('data-document');
            console.log('Selected document:', documentType);
            
            // Add visual feedback
            this.style.backgroundColor = '#f0f7ff';
            this.style.borderColor = '#2A3663';
            
            // Remove feedback after 1 second
            setTimeout(() => {
                this.style.backgroundColor = '';
                this.style.borderColor = '';
            }, 1000);
            
            // Here you would typically:
            // 1. Show a modal with document details
            // 2. Navigate to a request form
            // 3. Or trigger a download process
        });
    });
});