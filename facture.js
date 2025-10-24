// Invoice JavaScript Functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize invoice data
    initializeInvoice();
    
    // Add event listeners
    setupEventListeners();
    
    // Calculate totals
    calculateTotals();
});

// Initialize invoice with current data
function initializeInvoice() {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30); // 30 days from today
    
    // Set current date
    document.getElementById('invoiceDate').textContent = formatDate(today);
    document.getElementById('dueDate').textContent = formatDate(dueDate);
    
    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();
    document.getElementById('invoiceNumber').textContent = invoiceNumber;
}

// Generate unique invoice number
function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${month}-${random}`;
}

// Format date for display
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
}

// Setup event listeners
function setupEventListeners() {
    // Add row button (if exists)
    const addRowBtn = document.getElementById('addRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', addInvoiceRow);
    }
    
    // Remove row buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-row')) {
            removeInvoiceRow(e.target);
        }
    });
    
    // Quantity and price change listeners
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity') || e.target.classList.contains('price')) {
            updateRowTotal(e.target);
            calculateTotals();
        }
    });
}

// Calculate invoice totals
function calculateTotals() {
    const rows = document.querySelectorAll('#itemsTableBody tr');
    let subtotal = 0;
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity')?.value || row.cells[1].textContent) || 0;
        const price = parseFloat(row.querySelector('.price')?.value || row.cells[2].textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
        const total = quantity * price;
        subtotal += total;
        
        // Update total cell if it's editable
        const totalCell = row.querySelector('.total') || row.cells[3];
        if (totalCell) {
            totalCell.textContent = formatCurrency(total);
        }
    });
    
    const taxRate = 0.20; // 20% VAT
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    
    // Update totals display
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
}

// Format currency for display
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(amount);
}

// Add new invoice row
function addInvoiceRow() {
    const tbody = document.getElementById('itemsTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <input type="text" class="description" placeholder="Description du service" style="width: 100%; border: none; background: transparent;">
        </td>
        <td>
            <input type="number" class="quantity" value="1" min="0" step="0.1" style="width: 60px; text-align: center; border: 1px solid #ddd; border-radius: 4px;">
        </td>
        <td>
            <input type="number" class="price" value="0.00" min="0" step="0.01" style="width: 80px; text-align: center; border: 1px solid #ddd; border-radius: 4px;">
        </td>
        <td class="total">0,00 €</td>
        <td>
            <button class="remove-row" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(newRow);
    
    // Add animation
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateY(0)';
    }, 100);
}

// Remove invoice row
function removeInvoiceRow(button) {
    const row = button.closest('tr');
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
        row.remove();
        calculateTotals();
    }, 300);
}

// Update row total
function updateRowTotal(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.quantity')?.value || 0) || 0;
    const price = parseFloat(row.querySelector('.price')?.value || 0) || 0;
    const total = quantity * price;
    
    const totalCell = row.querySelector('.total');
    if (totalCell) {
        totalCell.textContent = formatCurrency(total);
    }
}

// Print invoice
function printInvoice() {
    // Add print class to body
    document.body.classList.add('printing');
    
    // Show loading message
    showNotification('Préparation de l\'impression...', 'info');
    
    setTimeout(() => {
        window.print();
        document.body.classList.remove('printing');
        showNotification('Facture envoyée à l\'imprimante', 'success');
    }, 1000);
}

// Download PDF (simulation)
function downloadPDF() {
    showNotification('Génération du PDF en cours...', 'info');
    
    // Simulate PDF generation
    setTimeout(() => {
        // In a real application, you would generate and download the PDF here
        const invoiceNumber = document.getElementById('invoiceNumber').textContent;
        const fileName = `Facture_${invoiceNumber}.pdf`;
        
        // Create a simple text file as simulation
        const content = generateInvoiceText();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('PDF téléchargé avec succès', 'success');
    }, 2000);
}

// Send email (simulation)
function sendEmail() {
    const clientEmail = prompt('Adresse email du client:');
    if (clientEmail && isValidEmail(clientEmail)) {
        showNotification('Envoi de la facture par email...', 'info');
        
        setTimeout(() => {
            showNotification(`Facture envoyée à ${clientEmail}`, 'success');
        }, 2000);
    } else if (clientEmail) {
        showNotification('Adresse email invalide', 'error');
    }
}

// Generate invoice text content
function generateInvoiceText() {
    const invoiceNumber = document.getElementById('invoiceNumber').textContent;
    const invoiceDate = document.getElementById('invoiceDate').textContent;
    const totalAmount = document.getElementById('totalAmount').textContent;
    
    return `FACTURE ${invoiceNumber}
Date: ${invoiceDate}

Total TTC: ${totalAmount}

Merci pour votre confiance!
`;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        border-left: 4px solid ${getNotificationColor(type)};
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-info-circle';
}

// Get notification color based on type
function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    return colors[type] || '#17a2b8';
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+P for print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printInvoice();
    }
    
    // Ctrl+S for save PDF
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadPDF();
    }
    
    // Ctrl+E for email
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        sendEmail();
    }
});

// Auto-save functionality (simulation)
function autoSave() {
    const invoiceData = {
        number: document.getElementById('invoiceNumber').textContent,
        date: document.getElementById('invoiceDate').textContent,
        total: document.getElementById('totalAmount').textContent,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('invoice_autosave', JSON.stringify(invoiceData));
}

// Load auto-saved data
function loadAutoSave() {
    const savedData = localStorage.getItem('invoice_autosave');
    if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Données sauvegardées trouvées:', data);
    }
}

// Initialize auto-save
setInterval(autoSave, 30000); // Auto-save every 30 seconds
loadAutoSave();