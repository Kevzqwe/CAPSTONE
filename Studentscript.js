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
    
    loadUserData();
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
    
    showPage('dashboard');
}

function showPage(pageName) {
    console.log('=== Showing page:', pageName, '===');
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    const activePage = document.getElementById(pageName);
    if (activePage) {
        activePage.classList.add('active');
        activePage.style.display = 'block';
        
        console.log('Loading page-specific data for:', pageName);
        
        // Load page-specific data
        if (pageName === 'account') {
            if (!window.studentData) {
                console.log('No student data found, loading user data...');
                loadUserData();
            } else {
                console.log('Updating account page with existing data');
                updateAccountPage(window.studentData);
            }
        } else if (pageName === 'dashboard') {
            console.log('Loading dashboard data...');
            loadDashboardData();
        } else if (pageName === 'request-history') {
            // Automatically load request history when page is shown
            console.log('=== REQUEST HISTORY PAGE ACTIVATED ===');
            console.log('Automatically loading request history data...');
            loadRequestHistory();
        }
    } else {
        console.error('Page not found:', pageName);
    }
    
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
    
    const sidebarName = document.getElementById('studentName');
    if (sidebarName && studentData.full_name) {
        sidebarName.textContent = studentData.full_name;
    }
    
    updateWelcomeMessages(studentData);
    updateAccountPage(studentData);
}

function updateWelcomeMessages(studentData) {
    const firstName = studentData.first_name || 'Student';
    
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) {
        welcomeName.textContent = firstName;
    }
    
    const welcomeMessage = document.querySelector('.welcome-message h2');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `Welcome back, <span id="welcomeName">${firstName}</span>!`;
    }
    
    const accountName = document.getElementById('accountName');
    if (accountName && studentData.full_name) {
        accountName.textContent = studentData.full_name;
    }
    
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
    
    const accountName = document.getElementById('accountName');
    if (accountName && studentData.full_name) {
        accountName.textContent = studentData.full_name;
    }
    
    const studentNoElement = document.querySelector('.student-no');
    if (studentNoElement && studentData.student_id) {
        studentNoElement.textContent = `Student ID: ${studentData.student_id}`;
    }
    
    const fieldMappings = {
        'address': studentData.address || '',
        'contact': studentData.contact_no || '',
        'email': studentData.email || '',
        'grade': `${studentData.grade_display || studentData.grade_level || ''} ${studentData.section || ''}`.trim() || 'Not assigned'
    };
    
    Object.keys(fieldMappings).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            if (fieldId === 'grade') {
                element.value = fieldMappings[fieldId];
                element.readOnly = true;
            } else {
                element.value = fieldMappings[fieldId];
                element.readOnly = false;
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
    if (window.studentData) {
        updateWelcomeMessages(window.studentData);
    }
    
    const announcementCard = document.querySelector('.info-card h3');
    if (announcementCard && announcementCard.textContent === 'Announcement') {
        const announcementContent = announcementCard.nextElementSibling;
        if (announcementContent && dashboardData.announcement) {
            announcementContent.textContent = dashboardData.announcement;
        }
    }
    
    const transactionCard = document.querySelectorAll('.info-card h3')[1];
    if (transactionCard && transactionCard.textContent === 'Transaction Days') {
        const transactionContent = transactionCard.nextElementSibling;
        if (transactionContent && dashboardData.transaction_hours) {
            transactionContent.textContent = dashboardData.transaction_hours;
        }
    }
}

// REQUEST HISTORY FUNCTIONS - LOADS AUTOMATICALLY WHEN PAGE IS SHOWN
function loadRequestHistory() {
    console.log('=== loadRequestHistory() CALLED ===');
    
    // Try different possible container IDs
    let container = document.getElementById('request-history-content');
    if (!container) {
        container = document.getElementById('request-history');
        console.log('❌ #request-history-content not found, trying #request-history');
    }
    
    if (!container) {
        console.error('❌ Request history container not found!');
        showMessage('Error: Request history container not found', 'error');
        return;
    }
    
    console.log('✅ Container found:', container.id);
    container.innerHTML = '<div class="loading-message">Loading request history...</div>';
    
    console.log('🔄 Fetching from: request_history.php?action=getRequestHistory');
    
    fetch('request_history.php?action=getRequestHistory')
        .then(response => {
            console.log('📥 Response status:', response.status);
            console.log('📥 Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ REQUEST HISTORY DATA RECEIVED');
            console.log('Status:', data.status);
            console.log('Data count:', data.count);
            console.log('Data:', data.data);
            
            if (data.status === 'success') {
                console.log('🔄 Displaying request history table...');
                displayRequestHistoryTable(data.data || []);
            } else {
                console.error('❌ Error status from server:', data.message);
                showMessage('Failed to load request history: ' + data.message, 'error');
                container.innerHTML = `<div class="error-message">${data.message || 'Failed to load request history'}</div>`;
            }
        })
        .catch(error => {
            console.error('❌ FETCH ERROR:', error);
            showMessage('Error loading request history: ' + error.message, 'error');
            container.innerHTML = `<div class="error-message">Error loading request history: ${error.message}</div>`;
        });
}

function displayRequestHistoryTable(requests) {
    console.log('🔄 displayRequestHistoryTable called with:', requests);
    
    // Try different possible container IDs
    let container = document.getElementById('request-history-content');
    if (!container) {
        container = document.getElementById('request-history');
        console.log('Using #request-history as container');
    }
    
    if (!container) {
        console.error('❌ Container not found for displaying table');
        return;
    }
    
    if (!requests || requests.length === 0) {
        console.log('📭 No requests found, showing empty state');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <h3>No Request History</h3>
                <p>You haven't made any document requests yet.</p>
            </div>
        `;
        return;
    }
    
    console.log('📊 Displaying table with', requests.length, 'requests');
    
    // Group requests by Request_ID
    const groupedRequests = groupRequestsByID(requests);
    
    let html = `
        <div class="request-history-container">
            <div class="table-header">
                <h3>Your Document Requests</h3>
                <div class="table-actions">
                    <button id="refreshRequests" class="refresh-btn">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="request-history-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Document Type</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                            <th>Payment Method</th>
                            <th>Date Requested</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    groupedRequests.forEach(request => {
        const statusClass = getStatusClass(request.Status);
        const statusIcon = getStatusIcon(request.Status);
        
        request.documents.forEach((doc, index) => {
            html += `
                <tr data-request-id="${request.Request_ID}">
                    ${index === 0 ? `
                    <td rowspan="${request.documents.length}">#${request.Request_ID}</td>
                    ` : ''}
                    <td>${doc.Document_Type}</td>
                    <td>${doc.Quantity}</td>
                    <td>₱${parseFloat(doc.Unit_Price).toFixed(2)}</td>
                    <td>₱${parseFloat(doc.Subtotal).toFixed(2)}</td>
                    ${index === 0 ? `
                    <td rowspan="${request.documents.length}">${formatPaymentMethod(request.Payment_Method)}</td>
                    <td rowspan="${request.documents.length}">${formatDate(request.Date_Requested)}</td>
                    <td rowspan="${request.documents.length}">
                        <span class="status-badge ${statusClass}">
                            ${statusIcon} ${capitalizeFirst(request.Status)}
                        </span>
                    </td>
                    <td rowspan="${request.documents.length}">
                        <button class="view-request-btn" data-request-id="${request.Request_ID}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                    ` : ''}
                </tr>
            `;
        });
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add event listener for refresh button
    const refreshBtn = document.getElementById('refreshRequests');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            this.disabled = true;
            
            loadRequestHistory();
            
            setTimeout(() => {
                const btn = document.getElementById('refreshRequests');
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                    btn.disabled = false;
                }
            }, 2000);
        });
    }
    
    // Add event listeners for view buttons
    document.querySelectorAll('.view-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            showRequestDetailsModal(requestId, groupedRequests);
        });
    });
    
    addRequestHistoryTableStyles();
    console.log('✅ Request history table displayed successfully');
}

function showRequestDetailsModal(requestId, groupedRequests) {
    const request = groupedRequests.find(req => req.Request_ID == requestId);
    
    if (!request) {
        showMessage('Request details not found', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    
    const total = request.documents.reduce((sum, doc) => sum + parseFloat(doc.Subtotal), 0);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Request Details - #${request.Request_ID}</h2>
                <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
                <div class="request-details">
                    <div class="detail-row">
                        <div class="detail-label">Request ID:</div>
                        <div class="detail-value">#${request.Request_ID}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date Requested:</div>
                        <div class="detail-value">${formatDate(request.Date_Requested)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Payment Method:</div>
                        <div class="detail-value">${formatPaymentMethod(request.Payment_Method)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Status:</div>
                        <div class="detail-value">
                            <span class="status-badge ${getStatusClass(request.Status)}">
                                ${getStatusIcon(request.Status)} ${capitalizeFirst(request.Status)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <h3>Documents Requested</h3>
                <div class="documents-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Document Type</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${request.documents.map(doc => `
                                <tr>
                                    <td>${doc.Document_Type}</td>
                                    <td>${doc.Quantity}</td>
                                    <td>₱${parseFloat(doc.Unit_Price).toFixed(2)}</td>
                                    <td>₱${parseFloat(doc.Subtotal).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                                <td style="font-weight: bold;">₱${total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button class="close-details-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.close-details-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) modal.remove(); 
    });
    
    addModalStyles();
}

function groupRequestsByID(requests) {
    const grouped = {};
    
    requests.forEach(req => {
        const id = req.Request_ID;
        
        if (!grouped[id]) {
            grouped[id] = {
                Request_ID: id,
                Payment_Method: req.Payment_Method,
                Date_Requested: req.Date_Requested,
                Status: req.Status,
                documents: [],
                total: 0
            };
        }
        
        grouped[id].documents.push({
            Request_Doc_ID: req.Request_Doc_ID,
            Document_ID: req.Document_ID,
            Document_Type: req.Document_Type,
            Quantity: req.Quantity,
            Unit_Price: req.Unit_Price,
            Subtotal: req.Subtotal
        });
        
        grouped[id].total += parseFloat(req.Subtotal);
    });
    
    return Object.values(grouped).sort((a, b) => 
        new Date(b.Date_Requested) - new Date(a.Date_Requested)
    );
}

function getStatusClass(status) {
    const classes = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'processing': 'status-processing',
        'ready': 'status-ready',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled',
        'rejected': 'status-rejected'
    };
    return classes[status.toLowerCase()] || 'status-pending';
}

function getStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'approved': '✓',
        'processing': '⚙️',
        'ready': '📦',
        'completed': '✅',
        'cancelled': '❌',
        'rejected': '🚫'
    };
    return icons[status.toLowerCase()] || '📄';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function formatPaymentMethod(method) {
    const methods = {
        'cash': 'Cash',
        'gcash': 'GCash',
        'maya': 'Maya'
    };
    return methods[method.toLowerCase()] || method;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function addRequestHistoryTableStyles() {
    if (document.getElementById('request-history-table-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'request-history-table-styles';
    style.textContent = `
        .request-history-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
            margin: 20px;
        }
        
        .table-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .table-header h3 {
            margin: 0;
            color: #2A3663;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .table-actions {
            display: flex;
            gap: 10px;
        }
        
        .refresh-btn {
            background: #2A3663;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background 0.3s;
        }
        
        .refresh-btn:hover {
            background: #1e2a4a;
        }
        
        .refresh-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        
        .view-request-btn {
            background: #17a2b8;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: background 0.3s;
        }
        
        .view-request-btn:hover {
            background: #138496;
        }
        
        .table-responsive {
            overflow-x: auto;
        }
        
        .request-history-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .request-history-table th {
            background: #2A3663;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        .request-history-table td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            vertical-align: middle;
        }
        
        .request-history-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        
        .status-pending { background: #fff3cd; color: #856404; }
        .status-approved { background: #d1ecf1; color: #0c5460; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-ready { background: #d4edda; color: #155724; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .status-rejected { background: #f8d7da; color: #721c24; }
        
        .empty-state, .error-message, .loading-message { 
            text-align: center; 
            padding: 60px 20px; 
            color: #666;
            font-size: 16px;
        }
        
        .error-message { color: #dc3545; }
        
        .loading-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        
        .loading-message::before {
            content: "";
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #2A3663;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .request-history-table {
                font-size: 14px;
            }
            
            .request-history-table th,
            .request-history-table td {
                padding: 8px 6px;
            }
            
            .table-header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
        }
    `;
    document.head.appendChild(style);
}

function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background: white;
            border-radius: 10px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #2A3663;
            font-size: 1.5rem;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            width: 30px;
            height: 30px;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .request-details {
            margin-bottom: 20px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .detail-label {
            font-weight: bold;
            width: 150px;
            color: #495057;
        }
        
        .detail-value {
            flex: 1;
        }
        
        .documents-table {
            margin-top: 15px;
        }
        
        .documents-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .documents-table th {
            background: #f8f9fa;
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        .documents-table td {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .documents-table tfoot td {
            font-weight: bold;
            background: #f8f9fa;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: flex-end;
        }
        
        .close-details-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .close-details-btn:hover {
            background: #5a6268;
        }
    `;
    document.head.appendChild(style);
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
            <a href="#" class="view-all-requests-link">View All Requests</a>
        </div>
    `;
    
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
        
        // Only navigate to page - data loading happens automatically in showPage()
        dropdown.querySelector('.view-all-requests-link').addEventListener('click', function(e) {
            e.preventDefault();
            console.log('View All Requests clicked - navigating to request-history page');
            showPage('request-history'); // This will automatically trigger loadRequestHistory()
            dropdown.remove();
        });
        
        if (unreadCount > 0) {
            dropdown.querySelector('.clear-all-btn').addEventListener('click', clearAllNotifications);
        }
        
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

    fetch('submit_feedback.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showMessage(data.message || 'Feedback submitted successfully!', 'success');
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

// Utility Functions
function loadInitialData() {
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'dashboard') {
        loadDashboardData();
    }
}

function showMessage(message, type) {
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

// Chatbase integration
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