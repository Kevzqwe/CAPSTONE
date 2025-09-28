// Studentscript.js - Student Portal Functions
document.addEventListener('DOMContentLoaded', function() {
    initializeStudentPortal();
});

function initializeStudentPortal() {
    setupNavigation();
    setupAccountManagement();
    setupNotifications();
    setupDashboard();
    setupUIInteractions();
    
    // Load initial data immediately
    loadUserData(); // Load user data on initialization
    loadInitialData();
}

// Navigation System
function setupNavigation() {
    const navItems = document.querySelectorAll('[data-page], nav a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page') || 
                           this.getAttribute('href')?.replace('#', '');
            if (pageName) {
                showPage(pageName);
            }
        });
    });
    
    // Show default page
    showPage('dashboard');
}

function showPage(pageName) {
    console.log('Showing page:', pageName);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show selected page
    const activePage = document.getElementById(pageName);
    if (activePage) {
        activePage.classList.add('active');
        activePage.style.display = 'block';
        
        // Load page-specific data
        if (pageName === 'account') {
            // User data should already be loaded, but refresh if needed
            if (!window.studentData) {
                loadUserData();
            } else {
                updateAccountPage(window.studentData);
            }
        } else if (pageName === 'dashboard') {
            loadDashboardData();
        }
    }
    
    // Update active navigation and page title
    updateActiveNav(pageName);
    updatePageTitle(pageName);
}

function updatePageTitle(pageName) {
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'documents': 'Documents',
            'request-history': 'Request History',
            'account': 'Account'
        };
        pageTitle.textContent = titles[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    }
}

function updateActiveNav(pageName) {
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        item.classList.remove('active');
        const itemPage = item.getAttribute('data-page');
        if (itemPage === pageName) {
            item.classList.add('active');
        }
    });
}

// Account Management
function setupAccountManagement() {
    // Create account form wrapper if it doesn't exist
    const accountContent = document.querySelector('#account .account-form');
    if (accountContent && !accountContent.querySelector('.save-btn')) {
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Save Changes';
        saveBtn.style.cssText = `
            background: #2A3663;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 20px;
            display: none;
        `;
        saveBtn.addEventListener('click', saveUserData);
        accountContent.appendChild(saveBtn);
    }
    
    // Track form changes on editable fields
    const editableInputs = document.querySelectorAll('#address, #contact, #email');
    editableInputs.forEach(input => {
        input.addEventListener('input', function() {
            markAsModified(this);
        });
    });
}

function loadUserData() {
    console.log('Loading user data...');
    
    fetch('student_data.php?action=getStudentData')
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            console.log('User data response:', data);
            if (data.status === 'success') {
                // Store data globally for reuse
                window.studentData = data.data;
                updateAllUserInterfaces(data.data);
            } else {
                console.error('Failed to load student data:', data.message);
                showMessage('Failed to load student data: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            showMessage('Error loading student data', 'error');
        });
}

function updateAllUserInterfaces(studentData) {
    console.log('Updating all UI elements with:', studentData);
    
    // Update sidebar student name
    const sidebarName = document.getElementById('studentName');
    if (sidebarName && studentData.full_name) {
        sidebarName.textContent = studentData.full_name;
    }
    
    // Update welcome messages (multiple possible locations)
    updateWelcomeMessages(studentData);
    
    // Update account page
    updateAccountPage(studentData);
}

function updateWelcomeMessages(studentData) {
    const firstName = studentData.first_name || 'Student';
    
    // Update welcome name in dashboard
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) {
        welcomeName.textContent = firstName;
    }
    
    // Update welcome message h2
    const welcomeMessage = document.querySelector('.welcome-message h2');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `Welcome back, <span id="welcomeName">${firstName}</span>!`;
    }
    
    // Update account name
    const accountName = document.getElementById('accountName');
    if (accountName && studentData.full_name) {
        accountName.textContent = studentData.full_name;
    }
    
    // Update welcome date
    const welcomeDate = document.getElementById('welcomeDate');
    if (welcomeDate) {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        welcomeDate.textContent = today.toLocaleDateString('en-US', options);
    }
}

function updateAccountPage(studentData) {
    console.log('Updating account page with:', studentData);
    
    // Update account header name
    const accountName = document.getElementById('accountName');
    if (accountName && studentData.full_name) {
        accountName.textContent = studentData.full_name;
    }
    
    // Update student number display
    const studentNoElement = document.querySelector('.student-no');
    if (studentNoElement && studentData.student_id) {
        studentNoElement.textContent = `Student ID: ${studentData.student_id}`;
    }
    
    // Update form fields with proper mapping
    const fieldMappings = {
        'address': studentData.address || '',
        'contact': studentData.contact_no || '',
        'email': studentData.email || '',
        'grade': `${studentData.grade_display || studentData.grade_level || ''} ${studentData.section || ''}`.trim() || 'Not assigned'
    };
    
    // Update each field
    Object.keys(fieldMappings).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            if (fieldId === 'grade') {
                element.value = fieldMappings[fieldId];
                element.readOnly = true; // Grade should not be editable
            } else {
                element.value = fieldMappings[fieldId];
                element.readOnly = false; // These fields are editable
            }
            console.log(`Updated ${fieldId}:`, fieldMappings[fieldId]);
        }
    });
}

function markAsModified(input) {
    input.style.borderColor = '#f39c12';
    input.style.borderWidth = '2px';
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.style.display = 'block';
    }
}

function saveUserData() {
    const saveBtn = document.querySelector('.save-btn');
    if (!saveBtn) return;
    
    const formData = new FormData();
    const editableFields = ['address', 'contact', 'email'];
    
    // Collect only editable fields
    editableFields.forEach(field => {
        const input = document.getElementById(field);
        if (input && input.value.trim()) {
            formData.append(field === 'contact' ? 'contact_no' : field, input.value.trim());
        }
    });
    
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    fetch('student_data.php?action=update', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Reset modified styling
            const editableInputs = document.querySelectorAll('#address, #contact, #email');
            editableInputs.forEach(input => {
                input.style.borderColor = '#e0e0e0';
                input.style.borderWidth = '1px';
            });
            
            saveBtn.textContent = 'Saved!';
            saveBtn.style.background = '#27ae60';
            
            setTimeout(() => {
                saveBtn.style.display = 'none';
                saveBtn.textContent = 'Save Changes';
                saveBtn.style.background = '#2A3663';
                saveBtn.disabled = false;
            }, 2000);
            
            showMessage('Account updated successfully!', 'success');
            
            // Reload user data to update all interfaces
            loadUserData();
        } else {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
            showMessage('Save failed: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error saving data:', error);
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
        showMessage('Error saving data', 'error');
    });
}

// Dashboard Functions
function setupDashboard() {
    const feedbackBtn = document.querySelector('.request-btn');
    if (feedbackBtn && feedbackBtn.textContent.includes('Feedback')) {
        feedbackBtn.addEventListener('click', showFeedbackModal);
    }
}

function loadDashboardData() {
    fetch('student_data.php?action=getDashboardData')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateDashboard(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
        });
}

function updateDashboard(dashboardData) {
    // Update welcome message - this should work with the globally loaded data
    if (window.studentData) {
        updateWelcomeMessages(window.studentData);
    }
    
    // Update announcement content if available
    const announcementCard = document.querySelector('.info-card h3');
    if (announcementCard && announcementCard.textContent === 'Announcement') {
        const announcementContent = announcementCard.nextElementSibling;
        if (announcementContent && dashboardData.announcement) {
            announcementContent.textContent = dashboardData.announcement;
        }
    }
    
    // Update transaction days
    const transactionCard = document.querySelectorAll('.info-card h3')[1];
    if (transactionCard && transactionCard.textContent === 'Transaction Days') {
        const transactionContent = transactionCard.nextElementSibling;
        if (transactionContent && dashboardData.transaction_hours) {
            transactionContent.textContent = dashboardData.transaction_hours;
        }
    }
}

// Notification System
function setupNotifications() {
    const notificationBtn = document.querySelector('.action-btn[title="Notifications"]');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotifications);
    }
    fetchNotifications();
}

function fetchNotifications() {
    fetch('student_data.php?action=getNotifications')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.studentNotifications = data.notifications || [];
                updateNotificationBadge(data.unread_count || 0);
            }
        })
        .catch(error => {
            console.error('Error fetching notifications:', error);
        });
}

function toggleNotifications() {
    const existingDropdown = document.querySelector('.notification-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    showNotifications();
}

function showNotifications() {
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    
    const notifications = window.studentNotifications || [];
    const unreadCount = notifications.filter(n => n.unread).length;
    
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            ${unreadCount > 0 ? '<button class="clear-all-btn">Clear All</button>' : ''}
        </div>
        <div class="notification-list">
            ${notifications.length > 0 ? 
                notifications.map(notif => `
                    <div class="notification-item ${notif.unread ? 'unread' : ''}">
                        <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
                        <div class="notification-content">
                            <h4>${notif.title}</h4>
                            <p>${notif.message}</p>
                            <span class="notification-time">${formatTime(notif.timestamp)}</span>
                        </div>
                    </div>
                `).join('') : 
                '<p class="no-notifications">No notifications</p>'
            }
        </div>
        <div class="notification-footer">
            <a href="#" onclick="showPage(\'request-history\')">View All Requests</a>
        </div>
    `;
    
    // Position and style dropdown
    const notificationBtn = document.querySelector('.action-btn[title="Notifications"]');
    if (notificationBtn) {
        const rect = notificationBtn.getBoundingClientRect();
        dropdown.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            right: 20px;
            width: 320px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 2000;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        document.body.appendChild(dropdown);
        
        // Add clear all functionality
        if (unreadCount > 0) {
            dropdown.querySelector('.clear-all-btn').addEventListener('click', clearAllNotifications);
        }
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 100);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'document': '📄',
        'payment': '💰',
        'announcement': '📢',
        'system': '⚙️',
        'reminder': '⏰'
    };
    return icons[type] || '📢';
}

function formatTime(timestamp) {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return `${Math.floor(diff/1440)}d ago`;
}

function updateNotificationBadge(count) {
    const notificationBtn = document.querySelector('.action-btn[title="Notifications"]');
    if (!notificationBtn) return;
    
    let badge = notificationBtn.querySelector('.notification-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        `;
        notificationBtn.style.position = 'relative';
        notificationBtn.appendChild(badge);
    }
    
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

function clearAllNotifications() {
    fetch('student_data.php?action=clearNotifications', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({clearAll: true})
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateNotificationBadge(0);
            window.studentNotifications = [];
            const dropdown = document.querySelector('.notification-dropdown');
            if (dropdown) {
                dropdown.querySelector('.notification-list').innerHTML = '<p class="no-notifications">No new notifications</p>';
            }
        } else {
            showMessage('Failed to clear notifications', 'error');
        }
    })
    .catch(error => {
        console.error('Error clearing notifications:', error);
        showMessage('Error clearing notifications', 'error');
    });
}

// UI Interactions
function setupUIInteractions() {
    setupLogout();
    setupMenuToggle();
}

function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'logout.php';
            }
        });
    }
}

function showFeedbackModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Send Feedback</h2>
                <button class="close-modal">×</button>
            </div>
            <form id="feedbackForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label>Feedback Type</label>
                    <select name="feedbackType" required>
                        <option value="">Select type</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="complaint">Complaint</option>
                        <option value="compliment">Compliment</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="feedbackMessage" rows="5" required placeholder="Please share your feedback..."></textarea>
                </div>
                <button type="submit" class="submit-btn">Send Feedback</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback(new FormData(this));
    });
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}


function submitFeedback(formData) {
    const submitBtn = document.querySelector('#feedbackForm .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }
    
    fetch('student_data.php?action=submitFeedback', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showMessage('Feedback submitted successfully!', 'success');
            document.querySelector('.modal-overlay')?.remove();
        } else {
            showMessage('Failed to submit feedback', 'error');
            if (submitBtn) {
                submitBtn.textContent = 'Send Feedback';
                submitBtn.disabled = false;
            }
        }
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
        showMessage('Error submitting feedback', 'error');
        if (submitBtn) {
            submitBtn.textContent = 'Send Feedback';
            submitBtn.disabled = false;
        }
    });
}

// Utility Functions
function loadInitialData() {
    // Load dashboard data if we're on dashboard
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'dashboard') {
        loadDashboardData();
    }
}

function showMessage(message, type) {
    // Remove existing message
    const existing = document.querySelector('.status-message');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 3000;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

function submitFeedback(formData) {
    const submitBtn = document.querySelector('#feedbackForm .submit-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }

    fetch('submit_feedback.php', {   // 👈 direct PHP file
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showMessage(data.message, 'success');
            document.querySelector('.modal-overlay')?.remove();
        } else {
            showMessage(data.message || 'Failed to submit feedback', 'error');
            if (submitBtn) {
                submitBtn.textContent = 'Send Feedback';
                submitBtn.disabled = false;
            }
        }
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
        showMessage('Error submitting feedback', 'error');
        if (submitBtn) {
            submitBtn.textContent = 'Send Feedback';
            submitBtn.disabled = false;
        }
    });
}

// Keep your existing Chatbase code
(function(){
    if(!window.chatbase || window.chatbase("getState")!=="initialized"){
        window.chatbase=(...arguments)=>{
            if(!window.chatbase.q){ window.chatbase.q=[] }
            window.chatbase.q.push(arguments)
        };
        window.chatbase=new Proxy(window.chatbase,{
            get(target,prop){
                if(prop==="q"){ return target.q }
                return (...args)=>target(prop,...args)
            }
        })
    }

    const onLoad=function(){
        const script=document.createElement("script");
        script.src="https://www.chatbase.co/embed.min.js";
        script.id="qLBNkxXcRUo19x8-TuiJQ";
        script.domain="www.chatbase.co";
        document.body.appendChild(script)
    };

    if(document.readyState==="complete"){ onLoad() }
    else{ window.addEventListener("load",onLoad) }
})();