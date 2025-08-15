// DOM Elements
const requestBtn = document.querySelector('.docs-btn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const quantityInputs = document.querySelectorAll('.quantity-input');
const totalAmount = document.getElementById('totalAmount');
const documentForm = document.getElementById('documentForm');

// Show modal function
function showModal() {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close modal function
function closeModalFunc() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event Listeners
requestBtn.addEventListener('click', showModal);
closeModal.addEventListener('click', closeModalFunc);

// Close modal when clicking outside
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModalFunc();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
        closeModalFunc();
    }
});

// Calculate total amount
function calculateTotal() {
    let total = 0;
    quantityInputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const price = parseFloat(input.dataset.price) || 0;
        total += quantity * price;
    });
    totalAmount.value = '₱ ' + total.toFixed(2);
}

// Add event listeners to quantity inputs
quantityInputs.forEach(input => {
    input.addEventListener('change', calculateTotal);
    input.addEventListener('input', calculateTotal);
});

// Form validation and submission
documentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get all required fields
    const requiredFields = this.querySelectorAll('input[required]');
    let isValid = true;
    let firstInvalidField = null;
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.2)';
            
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        } else {
            field.style.borderColor = '#ddd';
            field.style.boxShadow = 'none';
        }
    });
    
    // Check if at least one document is selected
    const documentCheckboxes = document.querySelectorAll('input[name="documents"]:checked');
    const hasSelectedDocuments = documentCheckboxes.length > 0;
    
    if (!hasSelectedDocuments) {
        alert('Please select at least one document.');
        return;
    }
    
    // Check if payment method is selected
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
    }
    
    // If form is valid, submit
    if (isValid) {
        // Collect form data
        const formData = {
            studentInfo: {
                studentNumber: this.studentNumber.value,
                email: this.email.value,
                contactNo: this.contactNo.value,
                surname: this.surname.value,
                firstname: this.firstname.value,
                middlename: this.middlename.value,
                grade: this.grade.value,
                section: this.section.value,
                date: this.date.value
            },
            documents: [],
            paymentMethod: paymentMethod.value,
            total: totalAmount.value
        };
        
        // Collect selected documents
        documentCheckboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const quantityInput = row.querySelector('.quantity-input');
            const assessmentYear = row.querySelector('.select-dropdown:nth-of-type(1)').value;
            const semester = row.querySelector('.select-dropdown:nth-of-type(2)').value;
            
            if (parseInt(quantityInput.value) > 0) {
                formData.documents.push({
                    type: checkbox.value,
                    quantity: quantityInput.value,
                    assessmentYear: assessmentYear,
                    semester: semester
                });
            }
        });
        
        // Show success message
        alert('Document request submitted successfully!\n\nRequest Details:\n' +
              `Student: ${formData.studentInfo.firstname} ${formData.studentInfo.surname}\n` +
              `Documents: ${formData.documents.length} item(s)\n` +
              `Total: ${formData.total}\n` +
              `Payment Method: ${formData.paymentMethod.toUpperCase()}`);
        
        // Reset form and close modal
        this.reset();
        calculateTotal();
        closeModalFunc();
        
        // You can send formData to your server here
        console.log('Form Data:', formData);
        
    } else {
        // Focus on first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        alert('Please fill in all required fields.');
    }
});

// Auto-calculate when quantities change
quantityInputs.forEach(input => {
    input.addEventListener('input', function() {
        const checkbox = this.closest('tr').querySelector('input[type="checkbox"]');
        
        // Auto-check checkbox if quantity > 0
        if (parseInt(this.value) > 0) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
        
        calculateTotal();
    });
});

// Auto-update quantity when checkbox is unchecked
document.querySelectorAll('input[type="checkbox"][name="documents"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const quantityInput = this.closest('tr').querySelector('.quantity-input');
        
        if (!this.checked) {
            quantityInput.value = 0;
            calculateTotal();
        } else if (quantityInput.value == 0) {
            quantityInput.value = 1;
            calculateTotal();
        }
    });
});

// Initialize page
function initializePage() {
    // Set current date
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="date"]').value = today;
    
    // Calculate initial total
    calculateTotal();
    
    // Add smooth transitions
    modalOverlay.style.transition = 'all 0.3s ease';
    
    // Add form field animations
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

// Helper function to format currency
function formatCurrency(amount) {
    return '₱ ' + parseFloat(amount).toFixed(2);
}

// Helper function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper function to validate phone number
function validatePhone(phone) {
    const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// Enhanced form validation
function validateForm() {
    const form = document.getElementById('documentForm');
    const formData = new FormData(form);
    let errors = [];
    
    // Validate email format
    const email = formData.get('email');
    if (email && !validateEmail(email)) {
        errors.push('Please enter a valid email address.');
    }
    
    // Validate phone number format
    const phone = formData.get('contactNo');
    if (phone && !validatePhone(phone)) {
        errors.push('Please enter a valid contact number.');
    }
    
    // Check for selected documents
    const selectedDocs = document.querySelectorAll('input[name="documents"]:checked');
    if (selectedDocs.length === 0) {
        errors.push('Please select at least one document.');
    }
    
    return errors;
}

// Print functionality (optional)
function printRequest(formData) {
    const printWindow = window.open('', '_blank');
    const printContent = `
        <html>
        <head>
            <title>Document Request</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .section h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Document Request Form</h2>
                <p>Pastorea Catholic School</p>
            </div>
            <!-- Add form data content here -->
        </body>
        </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);