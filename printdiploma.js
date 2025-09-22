// printdiploma.js - Certificate functionality

// Auto-uppercase for student name
document.addEventListener('DOMContentLoaded', function() {
    const studentNameInput = document.querySelector('.student-name-input');
    if (studentNameInput) {
        studentNameInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }

    // LRN input formatting
    const lrnInput = document.querySelector('.lrn-input');
    if (lrnInput) {
        lrnInput.addEventListener('input', function() {
            // Remove non-numeric characters
            this.value = this.value.replace(/\D/g, '');
            // Limit to 12 digits
            if (this.value.length > 12) {
                this.value = this.value.slice(0, 12);
            }
        });
    }

    // Auto-resize inputs based on content
    autoResizeInputs();
    
    // Add print button
    addPrintButton();
    
    // Load saved data
    loadCertificateData();
    
    // Setup auto-save
    setupAutoSave();
});

// Print functionality with better page setup
function printCertificate() {
    // Hide any UI elements that shouldn't print
    const printButton = document.querySelector('button');
    if (printButton) {
        printButton.style.display = 'none';
    }
    
    // Set up print-friendly view
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Trigger print
    window.print();
    
    // Restore UI elements after print dialog
    setTimeout(() => {
        if (printButton) {
            printButton.style.display = 'block';
        }
    }, 1000);
}

// Add print button to page
function addPrintButton() {
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print Certificate';
    printBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2A3663;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    `;
    printBtn.onclick = printCertificate;
    document.body.appendChild(printBtn);
}

// Auto-resize inputs based on content
function autoResizeInputs() {
    const inputs = document.querySelectorAll('.underline-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            resizeInput(this);
        });
        // Initial resize
        resizeInput(input);
    });
}

// Resize individual input
function resizeInput(input) {
    // Create a temporary element to measure text width
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.fontSize = window.getComputedStyle(input).fontSize;
    temp.style.fontFamily = window.getComputedStyle(input).fontFamily;
    temp.textContent = input.value || input.placeholder;
    document.body.appendChild(temp);
    
    // Set input width with some padding
    const minWidth = input.getAttribute('data-min-width') || 60;
    input.style.width = Math.max(temp.offsetWidth + 20, minWidth) + 'px';
    
    // Remove temporary element
    document.body.removeChild(temp);
}

// Save certificate data to localStorage
function saveCertificateData() {
    const data = {
        studentName: getValue('.student-name-input'),
        lrn: getValue('.lrn-input'),
        location: getValue('.location-input'),
        day: getValue('.day-input'),
        locationEn: getValue('.location-input-en'),
        dayEn: getValue('.day-input-en'),
        principalName: getValue('.principal-name-input'),
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('certificateData', JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save certificate data:', e);
    }
}

// Load certificate data from localStorage
function loadCertificateData() {
    try {
        const saved = localStorage.getItem('certificateData');
        if (saved) {
            const data = JSON.parse(saved);
            setValue('.student-name-input', data.studentName);
            setValue('.lrn-input', data.lrn);
            setValue('.location-input', data.location);
            setValue('.day-input', data.day);
            setValue('.location-input-en', data.locationEn);
            setValue('.day-input-en', data.dayEn);
            setValue('.principal-name-input', data.principalName);
            
            // Trigger resize for all inputs
            document.querySelectorAll('.underline-input').forEach(resizeInput);
        }
    } catch (e) {
        console.warn('Could not load certificate data:', e);
    }
}

// Setup auto-save functionality
function setupAutoSave() {
    document.addEventListener('input', function(e) {
        if (e.target.matches('.student-name-input, .lrn-input, .underline-input')) {
            saveCertificateData();
        }
    });
}

// Helper function to get input value safely
function getValue(selector) {
    const element = document.querySelector(selector);
    return element ? element.value : '';
}

// Helper function to set input value safely
function setValue(selector, value) {
    const element = document.querySelector(selector);
    if (element && value) {
        element.value = value;
    }
}

// Clear all form data
function clearCertificate() {
    if (confirm('Are you sure you want to clear all certificate data?')) {
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
            resizeInput(input);
        });
        localStorage.removeItem('certificateData');
    }
}

// Export certificate data as JSON
function exportCertificateData() {
    const data = {
        studentName: getValue('.student-name-input'),
        lrn: getValue('.lrn-input'),
        location: getValue('.location-input'),
        day: getValue('.day-input'),
        locationEn: getValue('.location-input-en'),
        dayEn: getValue('.day-input-en'),
        principalName: getValue('.principal-name-input'),
        exportDate: new Date().toISOString(),
        schoolName: 'PATEROS CATHOLIC ELEMENTARY SCHOOL'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${data.studentName ? data.studentName.replace(/\s+/g, '_') : 'data'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Make functions globally available
window.printCertificate = printCertificate;
window.clearCertificate = clearCertificate;
window.exportCertificateData = exportCertificateData;