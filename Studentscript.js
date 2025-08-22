  // Set student name from localStorage or default
    const studentName = localStorage.getItem('studentName') || 'Carl Francis D. Ortaliza';
    document.getElementById('studentName').textContent = studentName;
    document.getElementById('welcomeName').textContent = studentName.split(' ')[0];
    document.getElementById('accountName').textContent = studentName;

    // Set current date in welcome card
    const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' };
    document.getElementById('welcomeDate').textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('pageTitle');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    // Page navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding page
            const pageName = link.getAttribute('data-page');
            const targetPage = document.getElementById(pageName);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Update page title
            pageTitle.textContent = link.textContent.trim();
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
                mobileOverlay.classList.remove('active');
            }
        });
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        mobileOverlay.classList.toggle('active');
    });

    // Close mobile menu when clicking overlay
    mobileOverlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        }
    });

    // Action button interactions
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.title === 'AI Assistant') {
                alert('AI Assistant feature would be implemented here.');
            } else if (btn.title === 'Notifications') {
                alert('Notifications panel would be implemented here.');
            }
        });
    });

    // Logout button redirects to Login.html
    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = 'Login.html';
    });

    // Show modal overlay when docs-btn is clicked
    document.querySelector('.docs-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('modalOverlay').style.display = 'flex';
    });

    // Hide modal overlay when close button is clicked
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('modalOverlay').style.display = 'none';
    });
    
    // Chatbot FAQ responses
    const faqAnswers = {
        "How do I request a document?": "Go to the Documents page and click 'Request Now'. Fill out the form and submit your request.",
        "How long does it take to process a request?": "Requests are processed within 1-3 business days, excluding weekends and holidays.",
        "What payment methods are accepted?": "We accept Cash, GCash, and Maya as payment methods.",
        "Can I cancel my request?": "Once submitted, requests cannot be modified or cancelled online. Please contact the registrar for assistance.",
        "Who do I contact for help?": "You may contact the school registrar at registrar@pcs.edu.ph or visit the office during business hours."
    };

    const aiBtn = document.querySelector('.AI-btn');
    const chatbox = document.getElementById('chatbox');
    const closeChat = document.getElementById('closeChat');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendChat = document.getElementById('sendChat');

    // Show chatbox when AI-btn is clicked
    aiBtn.addEventListener('click', function() {
        chatbox.style.display = 'flex';
        chatInput.focus();
    });

    // Hide chatbox when close button is clicked
    closeChat.addEventListener('click', function() {
        chatbox.style.display = 'none';
    });

    // Handle FAQ button clicks
    chatBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('faq-btn')) {
            const question = e.target.dataset.faq;
            addChatMessage('You', question);
            addChatMessage('AI', faqAnswers[question]);
        }
    });

    // Handle sending custom questions
    sendChat.addEventListener('click', sendUserQuestion);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendUserQuestion();
    });

    function sendUserQuestion() {
        const question = chatInput.value.trim();
        if (!question) return;
        addChatMessage('You', question);

        // Simple FAQ match or default response
        const answer = faqAnswers[question] || "I'm sorry, I can only answer frequently asked questions listed above. Please contact the registrar for further assistance.";
        addChatMessage('AI', answer);
        chatInput.value = '';
    }

    function addChatMessage(sender, message) {
        const msg = document.createElement('div');
        msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Handle click on request ID to show document slip
document.querySelector('.table').addEventListener('click', function(e) {
    if (e.target.closest('a[href^="request-details.html"]')) {
        e.preventDefault();
        showDocumentSlip();
    }
});

// Show document slip with sample data
function showDocumentSlip() {
    // Populate with sample data (replace with actual data from your system)
    document.getElementById('slipStudentNo').textContent = '2011-12550';
    document.getElementById('slipEmail').textContent = 'ortalizacarlfrancis@gmail.com';
    document.getElementById('slipContactNo').textContent = '0966568723';
    document.getElementById('slipFullName').textContent = 'Carl Francis D. Ortaliza';
    document.getElementById('slipGradeSection').textContent = '10 - St. Peter';
    
    document.getElementById('slipDocument').textContent = 'Transcript of Records';
    document.getElementById('slipAssessmentYear').textContent = '2009 - 2020';
    document.getElementById('slipSemester').textContent = '1st Semester';
    document.getElementById('slipQuantity').textContent = '1';
    document.getElementById('slipPrice').textContent = '₱ 200.00';
    
    document.getElementById('slipPaymentMethod').textContent = 'Cash';
    document.getElementById('slipPaymentName').textContent = 'Carl Francis D. Ortaliza';
    document.getElementById('slipReferenceNo').textContent = '91234667892345';
    
    // Show the slip
    document.getElementById('documentSlip').style.display = 'flex';
}

// Close document slip
document.getElementById('closeSlipBtn').addEventListener('click', function() {
    document.getElementById('documentSlip').style.display = 'none';
});

// Back to history button
document.getElementById('backToHistoryBtn').addEventListener('click', function() {
    document.getElementById('documentSlip').style.display = 'none';
});

// Download slip button (placeholder functionality)
document.getElementById('downloadSlipBtn').addEventListener('click', function() {
    alert('Download functionality would be implemented here.');
    // In a real implementation, you might generate a PDF or image of the slip
});