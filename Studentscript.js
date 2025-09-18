// DOM Elements
const studentNameElement = document.getElementById('studentName');
const welcomeNameElement = document.getElementById('welcomeName');
const accountNameElement = document.getElementById('accountName');
const welcomeDateElement = document.getElementById('welcomeDate');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const aiBtn = document.querySelector('.AI-btn');
const chatbox = document.getElementById('chatbox');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');

// Set student name from localStorage or default
const studentName = localStorage.getItem('studentName') || 'Carl Francis D. Ortaliza';
studentNameElement.textContent = studentName;
welcomeNameElement.textContent = studentName.split(' ')[0];
accountNameElement.textContent = studentName;

// Set current date in welcome card
const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' };
welcomeDateElement.textContent = new Date().toLocaleDateString('en-US', dateOptions);

// Navigation functionality
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
    });
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
});

// Logout button redirects to Login.html
logoutBtn.addEventListener('click', function() {
    window.location.href = 'Login.html';
});

// Chatbot FAQ responses
const faqAnswers = {
    "How do I request a document?": "Go to the Documents page and click on the document you need. Fill out the form and submit your request.",
    "How long does it take to process a request?": "Requests are processed within 1-3 business days, excluding weekends and holidays.",
    "What payment methods are accepted?": "We accept Cash, GCash, and Maya as payment methods.",
    "Can I cancel my request?": "Once submitted, requests cannot be modified or cancelled online. Please contact the registrar for assistance.",
    "Who do I contact for help?": "You may contact the school registrar at registrar@pcs.edu.ph or visit the office during business hours."
};

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