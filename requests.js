// Document Request System JavaScript
// requests.js

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDocumentRequestSystem();
});

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
}

// Modal Handlers
function setupModalHandlers() {
    const modal = document.getElementById('documentModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');

    if (!modal || !openBtn || !closeBtn) return;

    // Open modal
    openBtn.addEventListener('click', function() {
        modal.classList.add('active');
        modal.style.display = 'flex';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Handle existing document card modals
    setupExistingModals();
}

function closeModal() {
    const modal = document.getElementById('documentModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        resetForm();
    }, 300);
}

function resetForm() {
    const form = document.getElementById('documentRequestForm');
    if (form) {
        form.reset();
    }
    
    // Reset all quantities to 0
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.value = 0;
    });
    
    // Uncheck all checkboxes
    document.querySelectorAll('.document-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset dropdowns
    document.querySelectorAll('.dropdown-controls select').forEach(select => {
        select.selectedIndex = 0;
    });
    
    // Reset total
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = '₱ 0.00';
    }
    
    // Set today's date again
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('date');
    if (dateField) {
        dateField.value = today;
    }
}

// Handle existing modal system
function setupExistingModals() {
    // Handle existing document cards that open individual modals
    document.querySelectorAll('.document-card[data-modal]').forEach(card => {
        card.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });

    // Handle existing modal close buttons
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close existing modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Document Selection Handlers
function setupDocumentHandlers() {
    // Checkbox change handlers
    document.querySelectorAll('.document-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const docId = this.id;
            const qtyInput = document.getElementById(docId + '-qty');
            
            if (this.checked && parseInt(qtyInput.value) === 0) {
                qtyInput.value = 1;
            } else if (!this.checked) {
                qtyInput.value = 0;
            }
            
            updateTotal();
        });
    });

    // Make quantity change function global
    window.changeQuantity = function(documentId, change) {
        const qtyInput = document.getElementById(documentId + '-qty');
        const checkbox = document.getElementById(documentId);
        
        if (!qtyInput || !checkbox) return;
        
        let currentQty = parseInt(qtyInput.value) || 0;
        let newQty = Math.max(0, currentQty + change);
        
        qtyInput.value = newQty;
        checkbox.checked = newQty > 0;
        
        updateTotal();
    };
}

// Update total calculation
function updateTotal() {
    let total = 0;
    
    document.querySelectorAll('.document-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
            const price = parseFloat(checkbox.dataset.price) || 0;
            const qtyInput = document.getElementById(checkbox.id + '-qty');
            const quantity = parseInt(qtyInput.value) || 0;
            total += price * quantity;
        }
    });
    
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = '₱ ' + total.toFixed(2);
    }
}

// Form Submission
function setupFormSubmission() {
    const form = document.getElementById('documentRequestForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = collectFormData();
        
        // Process form submission
        processFormSubmission(formData);
    });
}

function validateForm() {
    // Check if at least one document is selected
    const selectedDocs = document.querySelectorAll('.document-checkbox:checked');
    if (selectedDocs.length === 0) {
        alert('Please select at least one document.');
        return false;
    }

    // Check required fields
    const requiredFields = [
        'studentNumber', 'emailField', 'contactNo', 
        'surname', 'firstname', 'gradeField', 'section'
    ];

    for (let fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            alert('Please fill in all required fields.');
            field?.focus();
            return false;
        }
    }

    // Check if payment method is selected
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        alert('Please select a payment method.');
        return false;
    }

    return true;
}

function collectFormData() {
    // Student information
    const studentInfo = {
        studentNumber: document.getElementById('studentNumber')?.value || '',
        email: document.getElementById('emailField')?.value || '',
        contactNo: document.getElementById('contactNo')?.value || '',
        surname: document.getElementById('surname')?.value || '',
        firstname: document.getElementById('firstname')?.value || '',
        middlename: document.getElementById('middlename')?.value || '',
        grade: document.getElementById('gradeField')?.value || '',
        section: document.getElementById('section')?.value || '',
        date: document.getElementById('date')?.value || ''
    };

    // Selected documents
    const selectedDocs = [];
    document.querySelectorAll('.document-checkbox:checked').forEach(checkbox => {
        const docId = checkbox.id;
        const qtyInput = document.getElementById(docId + '-qty');
        const assessmentSelect = document.getElementById(docId + '-assessment');
        const semesterSelect = document.getElementById(docId + '-semester');
        
        selectedDocs.push({
            id: docId,
            document: checkbox.nextElementSibling?.textContent || '',
            quantity: parseInt(qtyInput?.value) || 0,
            price: parseFloat(checkbox.dataset.price) || 0,
            assessment: assessmentSelect?.value || '',
            semester: semesterSelect?.value || ''
        });
    });

    // Payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || '';

    // Calculate total
    const total = selectedDocs.reduce((sum, doc) => sum + (doc.price * doc.quantity), 0);

    return {
        studentInfo,
        selectedDocs,
        paymentMethod,
        total,
        submissionDate: new Date().toISOString()
    };
}

function processFormSubmission(formData) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // Here you would normally send the data to your server
        console.log('Form Data:', formData);
        
        // Generate request number (in real app, this would come from server)
        const requestNumber = 'REQ-' + Date.now().toString().slice(-6);
        
        // Show success message
        alert(`Request submitted successfully!\nRequest Number: ${requestNumber}\n\nYou will receive a confirmation email shortly.`);
        
        // Reset form and close modal
        closeModal();
        
        // Add to request history (in real app, this would be handled by backend)
        addToRequestHistory(formData, requestNumber);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    }, 2000); // Simulate network delay
}

function addToRequestHistory(formData, requestNumber) {
    // This is a simple demo - in a real app, this would be handled by the backend
    const historyTable = document.querySelector('#request-history .table tbody');
    if (!historyTable) return;

    const row = document.createElement('tr');
    const documentsStr = formData.selectedDocs.map(doc => doc.document).join(', ');
    const dateStr = new Date().toLocaleDateString();
    
    row.innerHTML = `
        <td>${requestNumber}</td>
        <td>${documentsStr}</td>
        <td>${formData.paymentMethod.charAt(0).toUpperCase() + formData.paymentMethod.slice(1)}</td>
        <td>${dateStr}</td>
        <td><span class="status-pending">Pending</span></td>
    `;
    
    historyTable.appendChild(row);
}

// Navigation Handlers
function setupNavigationHandlers() {
    // Page navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                showPage(targetPage);
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                // Handle logout logic here
                alert('Logged out successfully!');
                // Redirect to login page
                window.location.href = 'Login.html';
            }
        });
    }
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'documents': 'Documents',
            'request-history': 'Request History',
            'account': 'Account'
        };
        pageTitle.textContent = titles[pageId] || 'Dashboard';
    }
}

// Mobile Menu Handler
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// Chatbot Functionality
function setupChatbot() {
    const aiBtn = document.getElementById('aiAssistantBtn');
    const chatbox = document.getElementById('chatbox');
    const closeChat = document.getElementById('closeChat');
    const sendChat = document.getElementById('sendChat');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (aiBtn && chatbox) {
        aiBtn.addEventListener('click', function() {
            chatbox.style.display = chatbox.style.display === 'none' ? 'flex' : 'none';
        });
    }

    if (closeChat && chatbox) {
        closeChat.addEventListener('click', function() {
            chatbox.style.display = 'none';
        });
    }

    // FAQ button handlers
    document.querySelectorAll('.faq-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.getAttribute('data-faq');
            const answer = getFAQAnswer(question);
            displayChatMessage('PCSbot', answer);
        });
    });

    // Send chat message
    if (sendChat && chatInput) {
        sendChat.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        displayChatMessage('You', message);
        chatInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = getBotResponse(message);
            displayChatMessage('PCSbot', response);
        }, 1000);
    }

    function displayChatMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.padding = '8px';
        messageDiv.style.backgroundColor = sender === 'You' ? '#e3f2fd' : '#f5f5f5';
        messageDiv.style.borderRadius = '5px';
        
        if (chatBody) {
            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    function getFAQAnswer(question) {
        const answers = {
            'How do I request a document?': 'To request a document, click on "Request Documents" button, fill out the form with your information, select the documents you need, choose your payment method, and submit.',
            'How long does it take to process a request?': 'Document processing typically takes 3-5 business days. You will receive an email notification when your documents are ready for pickup.',
            'What payment methods are accepted?': 'We accept Cash, GCash, and Maya payments. You can select your preferred payment method when submitting your request.',
            'Can I cancel my request?': 'You can cancel your request within 24 hours of submission by contacting the registrar\'s office or through your request history.',
            'Who do I contact for help?': 'For assistance, you can contact the Registrar\'s Office at registrar@paterscatholic.edu.ph or visit the office during business hours.'
        };
        return answers[question] || 'I\'m not sure about that. Please contact the registrar\'s office for more information.';
    }

    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('request') || lowerMessage.includes('document')) {
            return 'To request documents, use the "Request Documents" button on the Documents page. Select the documents you need and fill out the required information.';
        } else if (lowerMessage.includes('payment')) {
            return 'We accept Cash, GCash, and Maya payments. You can choose your payment method when submitting your request.';
        } else if (lowerMessage.includes('time') || lowerMessage.includes('long')) {
            return 'Document processing typically takes 3-5 business days. You\'ll receive an email when ready.';
        } else if (lowerMessage.includes('help') || lowerMessage.includes('contact')) {
            return 'You can contact the Registrar\'s Office at registrar@paterscatholic.edu.ph or visit during business hours.';
        } else {
            return 'I can help you with document requests, payment methods, processing times, and contact information. What would you like to know?';
        }
    }
}

// Initialize Welcome Message
function initializeWelcomeMessage() {
    const welcomeDate = document.getElementById('welcomeDate');
    const welcomeName = document.getElementById('welcomeName');
    const studentName = document.getElementById('studentName');
    const accountName = document.getElementById('accountName');

    // Set current date
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

    // Set student name (in a real app, this would come from user session)
    const defaultName = 'John Doe';
    if (welcomeName) welcomeName.textContent = defaultName;
    if (studentName) studentName.textContent = defaultName;
    if (accountName) accountName.textContent = defaultName;
}

// Utility Functions
function formatCurrency(amount) {
    return '₱ ' + amount.toFixed(2);
}

function generateRequestNumber() {
    return 'REQ-' + Date.now().toString().slice(-6);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Export functions for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDocumentRequestSystem,
        validateForm,
        collectFormData,
        updateTotal,
        formatCurrency,
        validateEmail,
        validatePhone
    };
}

function getRequestData(requestNumber) {
    // Mock data - in real app, this would be an API call
    const mockData = {
        'REQ-777246': {
            requestNumber: 'REQ-777246',
            dateRequested: '9/23/2025',
            status: 'pending',
            paymentMethod: 'Cash',
            studentInfo: {
                studentNumber: '2024-12345',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                grade: 'Grade 12',
                section: 'A',
                email: 'john.doe@email.com',
                contact: '+63 912 345 6789'
            },
            documents: [
                {
                    name: 'Certificate of Grades',
                    quantity: 1,
                    price: 50.00,
                    subtotal: 50.00,
                    assessment: '2024',
                    semester: '1st Semester'
                }
            ],
            total: 50.00,
            timeline: [
                {
                    date: '2025-09-23 10:30 AM',
                    title: 'Request Submitted',
                    description: 'Your document request has been successfully submitted.',
                    status: 'completed'
                },
                {
                    date: '2025-09-23 11:15 AM',
                    title: 'Payment Received',
                    description: 'Payment has been confirmed and processed.',
                    status: 'completed'
                },
                {
                    date: '2025-09-23 02:00 PM',
                    title: 'Processing',
                    description: 'Your documents are currently being processed.',
                    status: 'active'
                },
                {
                    date: 'Pending',
                    title: 'Ready for Pickup',
                    description: 'Documents will be ready for pickup.',
                    status: 'pending'
                },
                {
                    date: 'Pending',
                    title: 'Completed',
                    description: 'Request completed successfully.',
                    status: 'pending'
                }
            ]
        },
        'REQ-972694': {
            requestNumber: 'REQ-972694',
            dateRequested: '9/23/2025',
            status: 'pending',
            paymentMethod: 'Cash',
            studentInfo: {
                studentNumber: '2024-12345',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                grade: 'Grade 12',
                section: 'A',
                email: 'john.doe@email.com',
                contact: '+63 912 345 6789'
            },
            documents: [
                {
                    name: 'Good Moral Certificate',
                    quantity: 1,
                    price: 150.00,
                    subtotal: 150.00,
                    assessment: '2024',
                    semester: '1st Semester'
                }
            ],
            total: 150.00,
            timeline: [
                {
                    date: '2025-09-23 10:30 AM',
                    title: 'Request Submitted',
                    description: 'Your document request has been successfully submitted.',
                    status: 'completed'
                },
                {
                    date: '2025-09-23 11:15 AM',
                    title: 'Payment Received',
                    description: 'Payment has been confirmed and processed.',
                    status: 'completed'
                },
                {
                    date: '2025-09-23 02:00 PM',
                    title: 'Processing',
                    description: 'Your documents are currently being processed.',
                    status: 'active'
                },
                {
                    date: 'Pending',
                    title: 'Ready for Pickup',
                    description: 'Documents will be ready for pickup.',
                    status: 'pending'
                },
                {
                    date: 'Pending',
                    title: 'Completed',
                    description: 'Request completed successfully.',
                    status: 'pending'
                }
            ]
        },
        'REQ-000477': {
            requestNumber: 'REQ-000477',
            dateRequested: '9/23/2025',
            status: 'pending',
            paymentMethod: 'Maya',
            studentInfo: {
                studentNumber: '2024-12345',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                grade: 'Grade 12',
                section: 'A',
                email: 'john.doe@email.com',
                contact: '+63 912 345 6789'
            },
            documents: [
                {
                    name: 'Transcript of Records',
                    quantity: 1,
                    price: 200.00,
                    subtotal: 200.00
                }
            ],
            total: 200.00,
            timeline: [
                {
                    date: '2025-09-23 09:15 AM',
                    title: 'Request Submitted',
                    description: 'Your document request has been successfully submitted.',
                    status: 'completed'
                },
                {
                    date: '2025-09-23 09:45 AM',
                    title: 'Awaiting Payment',
                    description: 'Please complete your Maya payment to proceed.',
                    status: 'active'
                },
                {
                    date: 'Pending',
                    title: 'Processing',
                    description: 'Your documents will be processed after payment.',
                    status: 'pending'
                },
                {
                    date: 'Pending',
                    title: 'Ready for Pickup',
                    description: 'Documents will be ready for pickup.',
                    status: 'pending'
                },
                {
                    date: 'Pending',
                    title: 'Completed',
                    description: 'Request completed successfully.',
                    status: 'pending'
                }
            ]
        }
    };

    return mockData[requestNumber] || null;
}