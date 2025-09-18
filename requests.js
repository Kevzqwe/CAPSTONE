// requests.js - Modal functionality for document requests

// Modal functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('Modal opened:', modalId);
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Modal closed');
    }
}

// Initialize document card functionality
function initializeDocumentCards() {
    const documentCards = document.querySelectorAll('.document-card');
    console.log('Found document cards:', documentCards.length);
    
    documentCards.forEach((card, index) => {
        const modalId = card.getAttribute('data-modal');
        console.log(`Card ${index} modal ID:`, modalId);
        
        // Add click event to each document card
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Document card clicked, opening modal:', modalId);
            showModal(modalId);
        });
    });
}

// Initialize modal close functionality
function initializeModalCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.modal-overlay');
    
    // Close button functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = this.closest('.modal-overlay');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });
}

// Initialize AI Assistant functionality
function initializeAIAssistant() {
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    const chatbox = document.getElementById('chatbox');
    const closeChat = document.getElementById('closeChat');
    
    if (aiAssistantBtn && chatbox) {
        aiAssistantBtn.addEventListener('click', function() {
            chatbox.style.display = 'flex';
        });
    }
    
    if (closeChat && chatbox) {
        closeChat.addEventListener('click', function() {
            chatbox.style.display = 'none';
        });
    }
}

// Initialize all request-related functionality
function initializeRequestSystem() {
    console.log('Initializing request system...');
    
    // Initialize document cards
    initializeDocumentCards();
    
    // Initialize modal close buttons
    initializeModalCloseButtons();
    
    // Initialize AI Assistant
    initializeAIAssistant();
    
    console.log('Request system initialization complete');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeRequestSystem);

// Also initialize if the script loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRequestSystem);
} else {
    initializeRequestSystem();
}