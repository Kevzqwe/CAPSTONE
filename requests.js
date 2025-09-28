document.addEventListener('DOMContentLoaded', () => {
    initDocumentRequestSystem();
});

function initDocumentRequestSystem() {
    setTodayDate();
    setupModal();
    setupDocumentHandlers();
    setupFormHandler();
    setupNavigation();
    setupMobileMenu();
}

/* ----------------- Utilities ----------------- */
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('date');
    if (dateField) dateField.value = today;
}

function resetForm() {
    const form = document.getElementById('documentRequestForm');
    if (form) form.reset();

    document.querySelectorAll('.quantity-input').forEach(input => input.value = 0);
    document.querySelectorAll('.document-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.dropdown-controls select').forEach(sel => sel.selectedIndex = 0);

    const totalEl = document.getElementById('totalAmount');
    if (totalEl) totalEl.textContent = '₱ 0.00';

    setTodayDate();
}

/* ----------------- Modal ----------------- */
function setupModal() {
    const modal = document.getElementById('documentModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    if (!modal || !openBtn || !closeBtn) return;

    openBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function closeModal() {
    const modal = document.getElementById('documentModal');
    if (!modal) return;
    modal.style.display = 'none';
    resetForm();
}

/* ----------------- Document Selection ----------------- */
function setupDocumentHandlers() {
    document.querySelectorAll('.document-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const qty = document.getElementById(cb.id + '-qty');
            if (!qty) return;
            qty.value = cb.checked ? Math.max(1, parseInt(qty.value || 0)) : 0;
            updateTotal();
        });
    });

    window.changeQuantity = (id, change) => {
        const qty = document.getElementById(id + '-qty');
        const cb = document.getElementById(id);
        if (!qty || !cb) return;

        let newQty = Math.max(0, parseInt(qty.value || 0) + change);
        qty.value = newQty;
        cb.checked = newQty > 0;
        updateTotal();
    };
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.document-checkbox:checked').forEach(cb => {
        const qty = parseInt(document.getElementById(cb.id + '-qty')?.value || 0);
        const price = parseFloat(cb.dataset.price || 0);
        total += qty * price;
    });
    const totalEl = document.getElementById('totalAmount');
    if (totalEl) totalEl.textContent = '₱ ' + total.toFixed(2);
}

/* ----------------- Form Handling ----------------- */
function setupFormHandler() {
    const form = document.getElementById('documentRequestForm');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = collectFormData();
        await submitForm(formData);
    });
}

function validateForm() {
    if (!document.querySelector('.document-checkbox:checked')) {
        alert('Please select at least one document.');
        return false;
    }

    const required = ['studentNumber', 'emailField', 'contactNo', 'surname', 'firstname', 'gradeField', 'section'];
    for (let id of required) {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            alert('Please fill in all required fields.');
            el?.focus();
            return false;
        }
    }

    if (!document.querySelector('input[name="payment"]:checked')) {
        alert('Please select a payment method.');
        return false;
    }

    return true;
}

function collectFormData() {
    // Collect student info - fix field mapping
    const student = {};
    const fieldMapping = {
        'studentNumber': 'studentNumber',
        'emailField': 'email',        // Map emailField to email
        'contactNo': 'contactNo',
        'surname': 'surname',
        'firstname': 'firstname',
        'middlename': 'middlename',
        'gradeField': 'grade',        // Map gradeField to grade
        'section': 'section',
        'date': 'date'
    };

    Object.entries(fieldMapping).forEach(([elementId, dbField]) => {
        const el = document.getElementById(elementId);
        student[dbField] = el?.value || '';
    });

    // Collect selected documents - ensure we use data-id attribute
    const selectedDocs = [];
    document.querySelectorAll('.document-checkbox:checked').forEach(cb => {
        const documentId = cb.dataset.id; // Use data-id attribute
        const quantity = parseInt(document.getElementById(cb.id + '-qty')?.value || 0);
        
        if (!documentId) {
            console.error('Missing data-id for checkbox:', cb.id);
            return;
        }

        selectedDocs.push({
            id: parseInt(documentId), // Ensure it's a number
            document: cb.nextElementSibling?.textContent || '',
            quantity: quantity,
            price: parseFloat(cb.dataset.price || 0),
            assessment: document.getElementById(cb.id + '-assessment')?.value || '',
            semester: document.getElementById(cb.id + '-semester')?.value || ''
        });
    });

    const payment = document.querySelector('input[name="payment"]:checked')?.value || '';
    const total = selectedDocs.reduce((sum, d) => sum + d.price * d.quantity, 0);

    const formData = {
        studentInfo: student,
        selectedDocs: selectedDocs,
        paymentMethod: payment,
        total: total,
        submissionDate: new Date().toISOString()
    };

    console.log('Collected form data:', JSON.stringify(formData, null, 2));
    return formData;
}

async function submitForm(data) {
    const btn = document.querySelector('.submit-btn');
    if (!btn) return;
    
    const orig = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
        console.log('Submitting data:', JSON.stringify(data, null, 2));
        
        const res = await fetch('document_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const text = await res.text();
        console.log('Raw server response:', text);
        console.log('Response length:', text.length);

        if (!text || text.trim().length === 0) {
            throw new Error('Server returned empty response');
        }

        // Check if it looks like JSON
        const trimmed = text.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
            throw new Error('Server returned non-JSON response: ' + trimmed.substring(0, 200));
        }

        let json;
        try {
            json = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Failed to parse:', text);
            throw new Error('Invalid JSON response from server');
        }

        console.log('Parsed response:', json);

        if (json.success) {
            // FIXED: Safely handle grand_total with proper number conversion
            const grandTotal = parseFloat(json.grand_total) || 0;
            const totalDisplay = json.grand_total ? `\nTotal: ₱${grandTotal.toFixed(2)}` : '';
            
            // Check if payment redirect is needed for GCash or Maya
            if (json.payment_redirect && json.checkout_url) {
                const paymentMethodName = json.payment_method === 'gcash' ? 'GCash' : 
                                         json.payment_method === 'maya' ? 'Maya' : 'Payment';
                
                alert(`✅ ${json.message}${totalDisplay}\n\nRedirecting to ${paymentMethodName} payment...`);
                
                // Redirect to PayMongo checkout in new tab
                setTimeout(() => {
                    window.open(json.checkout_url, '_blank');
                    closeModal();
                }, 1500);
            } else {
                alert(`✅ ${json.message}${totalDisplay}`);
                closeModal();
            }
        } else {
            alert(`❌ ${json.message || 'Unknown error occurred'}`);
        }

    } catch (err) {
        console.error('Submit error:', err);
        alert('⚠️ Server error: ' + err.message);
    } finally {
        btn.textContent = orig;
        btn.disabled = false;
    }
}

/* ----------------- Navigation ----------------- */
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(link.dataset.page);
            target?.classList.add('active');
        });
    });
}

/* ----------------- Mobile Menu ----------------- */
function setupMobileMenu() {
    const menu = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (!menu || !sidebar) return;
    menu.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
}