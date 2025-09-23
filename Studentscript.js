// Studentscript.js - Additional Student Portal Functions
// This file handles general student portal functionality that's separate from document requests

document.addEventListener('DOMContentLoaded', function() {
    initializeStudentPortal();
});

function initializeStudentPortal() {
    // Initialize notification system
    setupNotifications();
    
    // Initialize account management
    setupAccountManagement();
    
    // Initialize dashboard features
    setupDashboard();
    
    // Initialize general UI interactions
    setupUIInteractions();
}

// Notification System
function setupNotifications() {
    const notificationBtn = document.querySelector('.action-btn[title="Notifications"]');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotifications();
        });
    }
    
    // Simulate some notifications (in real app, this would come from server)
    updateNotificationBadge(3);
}

function showNotifications() {
    // Create notification dropdown
    const existingDropdown = document.querySelector('.notification-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <button class="clear-all-btn">Clear All</button>
        </div>
        <div class="notification-list">
            <div class="notification-item unread">
                <div class="notification-icon">📄</div>
                <div class="notification-content">
                    <h4>Document Request Update</h4>
                    <p>Your transcript of records is ready for pickup</p>
                    <span class="notification-time">2 hours ago</span>
                </div>
            </div>
            <div class="notification-item unread">
                <div class="notification-icon">💰</div>
                <div class="notification-content">
                    <h4>Payment Confirmed</h4>
                    <p>Payment for Form 138 has been processed</p>
                    <span class="notification-time">1 day ago</span>
                </div>
            </div>
            <div class="notification-item">
                <div class="notification-icon">📢</div>
                <div class="notification-content">
                    <h4>System Maintenance</h4>
                    <p>Scheduled maintenance this weekend</p>
                    <span class="notification-time">3 days ago</span>
                </div>
            </div>
        </div>
        <div class="notification-footer">
            <a href="#" onclick="showPage('request-history')">View All Requests</a>
        </div>
    `;
    
    // Position dropdown
    const rect = document.querySelector('.action-btn[title="Notifications"]').getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 10) + 'px';
    dropdown.style.right = '20px';
    dropdown.style.width = '320px';
    dropdown.style.background = 'white';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderRadius = '10px';
    dropdown.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    dropdown.style.zIndex = '2000';
    dropdown.style.maxHeight = '400px';
    dropdown.style.overflowY = 'auto';
    
    document.body.appendChild(dropdown);
    
    // Add event listeners
    dropdown.querySelector('.clear-all-btn').addEventListener('click', function() {
        clearAllNotifications();
    });
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && !document.querySelector('.action-btn[title="Notifications"]').contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

function updateNotificationBadge(count) {
    const notificationBtn = document.querySelector('.action-btn[title="Notifications"]');
    if (!notificationBtn) return;
    
    // Remove existing badge
    const existingBadge = notificationBtn.querySelector('.notification-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Add new badge if count > 0
    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.position = 'absolute';
        badge.style.top = '-5px';
        badge.style.right = '-5px';
        badge.style.background = '#e74c3c';
        badge.style.color = 'white';
        badge.style.borderRadius = '50%';
        badge.style.width = '18px';
        badge.style.height = '18px';
        badge.style.fontSize = '10px';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.fontWeight = 'bold';
        
        notificationBtn.appendChild(badge);
    }
}

function clearAllNotifications() {
    updateNotificationBadge(0);
    const dropdown = document.querySelector('.notification-dropdown');
    if (dropdown) {
        dropdown.querySelector('.notification-list').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No new notifications</p>';
    }
}

// Account Management
function setupAccountManagement() {
    const accountForm = document.querySelector('.account-form');
    if (!accountForm) return;
    
    // Load user data (in real app, this would come from server)
    loadUserData();
    
    // Handle form changes
    const inputs = accountForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            markAsModified(this);
        });
    });
    
    // Add save button
    if (!accountForm.querySelector('.save-btn')) {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Save Changes';
        saveBtn.style.cssText = `
            background: #2A3663;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 20px;
            display: none;
        `;
        
        saveBtn.addEventListener('click', function() {
            saveUserData();
        });
        
        accountForm.appendChild(saveBtn);
    }
}

function loadUserData() {
    // Simulate loading user data
    const userData = {
        address: '123 Sample Street, Pateros, Metro Manila',
        contact: '+63 912 345 6789',
        email: 'john.doe@email.com',
        grade: 'Grade 12'
    };
    
    Object.keys(userData).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = userData[key];
        }
    });
}

function markAsModified(input) {
    input.style.borderColor = '#f39c12';
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.style.display = 'block';
    }
}

function saveUserData() {
    const saveBtn = document.querySelector('.save-btn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset modified indicators
        document.querySelectorAll('.account-form input').forEach(input => {
            input.style.borderColor = '#e0e0e0';
        });
        
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            saveBtn.style.display = 'none';
            saveBtn.textContent = 'Save Changes';
            saveBtn.style.background = '#2A3663';
            saveBtn.disabled = false;
        }, 2000);
        
        // Show success message
        showMessage('Account information updated successfully!', 'success');
    }, 1500);
}

// Dashboard Features
function setupDashboard() {
    // Update announcement and transaction days
    updateDashboardContent();
    
    // Setup feedback button
    const feedbackBtn = document.querySelector('.request-btn');
    if (feedbackBtn && feedbackBtn.textContent.includes('Send Feedback')) {
        feedbackBtn.addEventListener('click', function() {
            showFeedbackModal();
        });
    }
}

function updateDashboardContent() {
    // Update announcements
    const announcementCard = document.querySelector('.info-card h3');
    if (announcementCard && announcementCard.textContent === 'Announcement') {
        const announcementContent = announcementCard.nextElementSibling;
        if (announcementContent) {
            announcementContent.textContent = 'Reminder: Document processing takes 3-5 business days. Please plan your requests accordingly.';
        }
    }
    
    // Update transaction days
    const transactionCard = document.querySelectorAll('.info-card h3')[1];
    if (transactionCard && transactionCard.textContent === 'Transaction Days') {
        const transactionContent = transactionCard.nextElementSibling;
        if (transactionContent) {
            transactionContent.textContent = 'Monday to Friday: 8:00 AM - 5:00 PM | Saturday: 8:00 AM - 12:00 PM';
        }
    }
}

function showFeedbackModal() {
    // Create feedback modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Send Feedback</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="form-content">
                <form id="feedbackForm">
                    <div class="form-group">
                        <label for="feedbackType">Feedback Type</label>
                        <select id="feedbackType" required>
                            <option value="">Select type</option>
                            <option value="suggestion">Suggestion</option>
                            <option value="complaint">Complaint</option>
                            <option value="compliment">Compliment</option>
                            <option value="bug-report">Bug Report</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feedbackMessage">Message</label>
                        <textarea id="feedbackMessage" rows="5" required placeholder="Please share your feedback..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="feedbackEmail">Email (optional)</label>
                        <input type="email" id="feedbackEmail" placeholder="your.email@example.com">
                    </div>
                    <button type="submit" class="submit-btn">Send Feedback</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('#feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback(this);
    });
    
    // Handle close
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function submitFeedback(form) {
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showMessage('Thank you for your feedback! We appreciate your input.', 'success');
        form.closest('.modal-overlay').remove();
    }, 1500);
}

// General UI Interactions
function setupUIInteractions() {
}

function initializeDocumentRequestSystem() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('date');
    if (dateField) {
        dateField.value = today;
    }

    // Modal functionality
    setupModalHandlers();
    
    // Document selection handlers
    setupDocumentHandlers();
    
    // Form submission
    setupFormSubmission();
    
    // Navigation handlers
    setupNavigationHandlers();
    
    // Chatbot functionality
    setupChatbot();
    
    // Menu toggle for mobile
    setupMobileMenu();
    
    // Initialize welcome message
    initializeWelcomeMessage();
    
    // ADD THIS LINE:
    initializeRequestDetailsModal();
}