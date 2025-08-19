/*
Name: receipt_manager.js
Version: 1.0.0
Purpose: Receipt management functionality for storing and organizing maintenance receipts
Path: /home/ubuntu/vehicle_maintenance_app/js/receipt_manager.js
Copyright: 2025 Superior Networks LLC

Key Features:
- Upload and store receipt images with metadata
- Categorize receipts by maintenance type and vendor
- Search and filter receipt database
- Grid and list view modes for receipt display
- Link receipts to maintenance records
- Export capabilities for tax and accounting purposes
- Mobile-friendly photo capture and management
- Receipt detail modal with full-size image viewing

Input: 
- User file uploads (receipt images)
- Form submissions (receipt metadata)
- User interactions (search, filter, view modes)

Output:
- Receipt gallery interface with multiple view modes
- Search and filter results
- Receipt details and metadata display
- Export functionality for various formats
- Success/error notifications

Dependencies:
- app.js (core application functions)
- google_sheets.js (data persistence)
- Modern browser with ES6+ support

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
*/

// Receipt Manager State
let receiptState = {
    receipts: [],
    vehicles: [],
    maintenanceRecords: [],
    currentReceipt: null,
    isEditing: false,
    viewMode: 'grid', // 'grid' or 'list'
    filters: {
        vehicle: '',
        category: '',
        dateRange: '',
        search: '',
        startDate: '',
        endDate: ''
    },
    sortBy: 'date_desc'
};

// DOM Elements
let receiptElements = {
    addReceiptBtn: null,
    addFirstReceiptBtn: null,
    receiptsContainer: null,
    noReceiptsMessage: null,
    receiptModal: null,
    receiptForm: null,
    modalTitle: null,
    deleteModal: null,
    receiptPreview: null,
    receiptDetailModal: null,
    exportModal: null,
    gridViewBtn: null,
    listViewBtn: null,
    customDateRange: null,
    exportCustomRange: null
};

// Initialize Receipt Manager
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the receipt manager page
    if (window.location.pathname.includes('receipt_manager.html') || 
        document.getElementById('receiptsContainer')) {
        initializeReceiptManager();
    }
});

/**
 * Initialize Receipt Manager
 */
function initializeReceiptManager() {
    console.log('Initializing Receipt Manager...');
    
    // Cache DOM elements
    cacheReceiptElements();
    
    // Set up event listeners
    setupReceiptEventListeners();
    
    // Load data
    loadReceiptData();
    
    console.log('Receipt Manager initialized');
}

/**
 * Cache DOM elements
 */
function cacheReceiptElements() {
    receiptElements.addReceiptBtn = document.getElementById('addReceiptBtn');
    receiptElements.addFirstReceiptBtn = document.getElementById('addFirstReceiptBtn');
    receiptElements.receiptsContainer = document.getElementById('receiptsContainer');
    receiptElements.noReceiptsMessage = document.getElementById('noReceiptsMessage');
    receiptElements.receiptModal = document.getElementById('receiptModal');
    receiptElements.receiptForm = document.getElementById('receiptForm');
    receiptElements.modalTitle = document.getElementById('receiptModalTitle');
    receiptElements.deleteModal = document.getElementById('deleteReceiptModal');
    receiptElements.receiptPreview = document.getElementById('receiptPreview');
    receiptElements.receiptDetailModal = document.getElementById('receiptDetailModal');
    receiptElements.exportModal = document.getElementById('exportModal');
    receiptElements.gridViewBtn = document.getElementById('gridViewBtn');
    receiptElements.listViewBtn = document.getElementById('listViewBtn');
    receiptElements.customDateRange = document.getElementById('customDateRange');
    receiptElements.exportCustomRange = document.getElementById('exportCustomRange');
}

/**
 * Set up event listeners
 */
function setupReceiptEventListeners() {
    // Add receipt buttons
    if (receiptElements.addReceiptBtn) {
        receiptElements.addReceiptBtn.addEventListener('click', () => openReceiptModal());
    }
    
    if (receiptElements.addFirstReceiptBtn) {
        receiptElements.addFirstReceiptBtn.addEventListener('click', () => openReceiptModal());
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('#closeReceiptModal, #cancelReceiptBtn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeReceiptModal);
    });
    
    // Form submission
    if (receiptElements.receiptForm) {
        receiptElements.receiptForm.addEventListener('submit', handleReceiptSubmit);
    }
    
    // Receipt image upload
    const receiptImageInput = document.getElementById('receiptImage');
    if (receiptImageInput && receiptElements.receiptPreview) {
        receiptImageInput.addEventListener('change', (e) => {
            window.APP.handleImageUpload(e.target, receiptElements.receiptPreview);
        });
    }
    
    // View mode toggle
    if (receiptElements.gridViewBtn) {
        receiptElements.gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }
    
    if (receiptElements.listViewBtn) {
        receiptElements.listViewBtn.addEventListener('click', () => setViewMode('list'));
    }
    
    // Filters
    const filterElements = [
        'receiptVehicleFilter',
        'receiptCategoryFilter',
        'receiptDateFilter',
        'sortBy'
    ];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', handleFilterChange);
        }
    });
    
    // Search
    const searchInput = document.getElementById('searchReceipts');
    if (searchInput) {
        searchInput.addEventListener('input', 
            window.APP ? window.APP.debounce(handleSearchChange, 300) : handleSearchChange
        );
    }
    
    // Custom date range
    const receiptDateFilter = document.getElementById('receiptDateFilter');
    if (receiptDateFilter) {
        receiptDateFilter.addEventListener('change', handleDateFilterChange);
    }
    
    // Export functionality
    const exportReceiptsBtn = document.getElementById('exportReceiptsBtn');
    if (exportReceiptsBtn) {
        exportReceiptsBtn.addEventListener('click', openExportModal);
    }
    
    const confirmExportBtn = document.getElementById('confirmExportBtn');
    if (confirmExportBtn) {
        confirmExportBtn.addEventListener('click', handleExport);
    }
    
    // Export date range
    const exportDateRange = document.getElementById('exportDateRange');
    if (exportDateRange) {
        exportDateRange.addEventListener('change', handleExportDateRangeChange);
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteReceiptBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteReceipt);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeReceiptModal();
            closeReceiptDetailModal();
            closeExportModal();
            closeDeleteModal();
        }
    });
}

/**
 * Load receipt data
 */
function loadReceiptData() {
    try {
        // Get data from app state or local storage
        receiptState.receipts = window.APP ? 
            window.APP.state.receipts || window.APP.getFromStorage('receipts') || [] : [];
        
        receiptState.vehicles = window.APP ? 
            window.APP.state.vehicles || window.APP.getFromStorage('vehicles') || [] : [];
        
        receiptState.maintenanceRecords = window.APP ? 
            window.APP.state.maintenanceRecords || window.APP.getFromStorage('maintenanceRecords') || [] : [];
        
        // Populate filters
        populateReceiptFilters();
        
        // Display receipts
        displayReceipts();
        
        // Update summary
        updateReceiptSummary();
        
    } catch (error) {
        console.error('Failed to load receipt data:', error);
        if (window.APP) {
            window.APP.showToast('Failed to load receipt data', 'error');
        }
    }
}

/**
 * Populate receipt filters
 */
function populateReceiptFilters() {
    const vehicleSelects = [
        document.getElementById('receiptVehicleFilter'),
        document.getElementById('receiptVehicle')
    ];
    
    vehicleSelects.forEach(select => {
        if (select) {
            // Clear existing options (except first)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // Add vehicle options
            receiptState.vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicle_id;
                option.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
                select.appendChild(option);
            });
        }
    });
    
    // Populate linked maintenance records
    const linkedMaintenanceSelect = document.getElementById('linkedMaintenance');
    if (linkedMaintenanceSelect) {
        // Clear existing options (except first)
        while (linkedMaintenanceSelect.children.length > 1) {
            linkedMaintenanceSelect.removeChild(linkedMaintenanceSelect.lastChild);
        }
        
        // Add maintenance record options
        receiptState.maintenanceRecords.forEach(record => {
            const vehicle = receiptState.vehicles.find(v => v.vehicle_id === record.vehicle_id);
            const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
            
            const option = document.createElement('option');
            option.value = record.log_id;
            option.textContent = `${formatMaintenanceType(record.maintenance_type)} - ${vehicleName} (${window.APP ? window.APP.formatDate(record.service_date) : record.service_date})`;
            linkedMaintenanceSelect.appendChild(option);
        });
    }
}

/**
 * Display receipts
 */
function displayReceipts() {
    if (!receiptElements.receiptsContainer) return;
    
    const receipts = getFilteredReceipts();
    
    if (receipts.length === 0) {
        showNoReceiptsMessage();
        return;
    }
    
    hideNoReceiptsMessage();
    
    // Set view mode class
    receiptElements.receiptsContainer.className = `receipts-container ${receiptState.viewMode}-view`;
    
    // Generate HTML
    const receiptsHTML = receipts.map(receipt => createReceiptHTML(receipt)).join('');
    
    receiptElements.receiptsContainer.innerHTML = receiptsHTML;
    
    // Add click listeners to receipt items
    addReceiptClickListeners();
}

/**
 * Get filtered receipts
 */
function getFilteredReceipts() {
    let filtered = [...receiptState.receipts];
    
    // Apply vehicle filter
    if (receiptState.filters.vehicle) {
        filtered = filtered.filter(receipt => receipt.vehicle_id === receiptState.filters.vehicle);
    }
    
    // Apply category filter
    if (receiptState.filters.category) {
        filtered = filtered.filter(receipt => receipt.category === receiptState.filters.category);
    }
    
    // Apply date filter
    if (receiptState.filters.dateRange) {
        if (receiptState.filters.dateRange === 'custom') {
            if (receiptState.filters.startDate && receiptState.filters.endDate) {
                const startDate = new Date(receiptState.filters.startDate);
                const endDate = new Date(receiptState.filters.endDate);
                
                filtered = filtered.filter(receipt => {
                    const receiptDate = new Date(receipt.receipt_date);
                    return receiptDate >= startDate && receiptDate <= endDate;
                });
            }
        } else {
            const days = parseInt(receiptState.filters.dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            filtered = filtered.filter(receipt => {
                const receiptDate = new Date(receipt.receipt_date);
                return receiptDate >= cutoffDate;
            });
        }
    }
    
    // Apply search filter
    if (receiptState.filters.search) {
        const term = receiptState.filters.search.toLowerCase();
        filtered = filtered.filter(receipt => 
            receipt.vendor.toLowerCase().includes(term) ||
            receipt.description.toLowerCase().includes(term) ||
            receipt.category.toLowerCase().includes(term)
        );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (receiptState.sortBy) {
            case 'date_desc':
                return new Date(b.receipt_date) - new Date(a.receipt_date);
            case 'date_asc':
                return new Date(a.receipt_date) - new Date(b.receipt_date);
            case 'amount_desc':
                return (b.amount || 0) - (a.amount || 0);
            case 'amount_asc':
                return (a.amount || 0) - (b.amount || 0);
            case 'vendor':
                return a.vendor.localeCompare(b.vendor);
            default:
                return new Date(b.receipt_date) - new Date(a.receipt_date);
        }
    });
    
    return filtered;
}

/**
 * Create receipt HTML
 */
function createReceiptHTML(receipt) {
    const vehicle = receiptState.vehicles.find(v => v.vehicle_id === receipt.vehicle_id);
    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
    
    if (receiptState.viewMode === 'grid') {
        return `
            <div class="receipt-item" data-receipt-id="${receipt.receipt_id}">
                ${receipt.image_url ? `
                    <img src="${receipt.image_url}" alt="Receipt" class="receipt-image">
                ` : `
                    <div class="receipt-image" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
                        📄
                    </div>
                `}
                <div class="receipt-info">
                    <div class="receipt-vendor">${receipt.vendor}</div>
                    <div class="receipt-amount">${window.APP ? window.APP.formatCurrency(receipt.amount) : '$' + receipt.amount}</div>
                    <div class="receipt-date">${window.APP ? window.APP.formatDate(receipt.receipt_date) : receipt.receipt_date}</div>
                    <div class="receipt-category">${formatReceiptCategory(receipt.category)}</div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="receipt-item" data-receipt-id="${receipt.receipt_id}">
                ${receipt.image_url ? `
                    <img src="${receipt.image_url}" alt="Receipt" class="receipt-image">
                ` : `
                    <div class="receipt-image" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
                        📄
                    </div>
                `}
                <div class="receipt-info">
                    <div class="receipt-main-info">
                        <div class="receipt-vendor">${receipt.vendor}</div>
                        <div class="receipt-date">${window.APP ? window.APP.formatDate(receipt.receipt_date) : receipt.receipt_date}</div>
                        <div class="receipt-category">${formatReceiptCategory(receipt.category)}</div>
                    </div>
                    <div class="receipt-meta-info">
                        <div class="receipt-amount">${window.APP ? window.APP.formatCurrency(receipt.amount) : '$' + receipt.amount}</div>
                        <div style="font-size: 0.8rem; color: #6b7280;">${vehicleName}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Format receipt category for display
 */
function formatReceiptCategory(category) {
    const categories = {
        'oil_change': 'Oil Change',
        'tire_service': 'Tire Service',
        'brake_service': 'Brake Service',
        'engine_repair': 'Engine Repair',
        'transmission': 'Transmission',
        'inspection': 'Inspection',
        'parts': 'Parts',
        'other': 'Other'
    };
    
    return categories[category] || category;
}

/**
 * Format maintenance type for display
 */
function formatMaintenanceType(type) {
    const types = {
        'oil_change': 'Oil Change',
        'tire_rotation': 'Tire Rotation',
        'brake_service': 'Brake Service',
        'transmission_service': 'Transmission Service',
        'coolant_flush': 'Coolant Flush',
        'air_filter': 'Air Filter',
        'spark_plugs': 'Spark Plugs',
        'battery': 'Battery',
        'inspection': 'Inspection',
        'repair': 'Repair',
        'other': 'Other'
    };
    
    return types[type] || type;
}

/**
 * Add click listeners to receipt items
 */
function addReceiptClickListeners() {
    const receiptItems = document.querySelectorAll('.receipt-item');
    receiptItems.forEach(item => {
        item.addEventListener('click', () => {
            const receiptId = item.dataset.receiptId;
            showReceiptDetail(receiptId);
        });
    });
}

/**
 * Update receipt summary
 */
function updateReceiptSummary() {
    const receipts = getFilteredReceipts();
    
    // Total receipts
    const totalReceiptsElement = document.getElementById('totalReceipts');
    if (totalReceiptsElement) {
        totalReceiptsElement.textContent = receipts.length;
    }
    
    // Total amount
    const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.textContent = window.APP ? window.APP.formatCurrency(totalAmount) : '$' + totalAmount;
    }
    
    // This month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthReceipts = receipts.filter(receipt => new Date(receipt.receipt_date) >= thisMonth);
    const thisMonthAmount = thisMonthReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    const thisMonthElement = document.getElementById('thisMonth');
    if (thisMonthElement) {
        thisMonthElement.textContent = window.APP ? window.APP.formatCurrency(thisMonthAmount) : '$' + thisMonthAmount;
    }
    
    // This year
    const thisYear = new Date();
    thisYear.setMonth(0, 1);
    const thisYearReceipts = receipts.filter(receipt => new Date(receipt.receipt_date) >= thisYear);
    const thisYearAmount = thisYearReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    const thisYearElement = document.getElementById('thisYear');
    if (thisYearElement) {
        thisYearElement.textContent = window.APP ? window.APP.formatCurrency(thisYearAmount) : '$' + thisYearAmount;
    }
}

/**
 * Set view mode
 */
function setViewMode(mode) {
    receiptState.viewMode = mode;
    
    // Update button states
    if (receiptElements.gridViewBtn && receiptElements.listViewBtn) {
        receiptElements.gridViewBtn.classList.toggle('active', mode === 'grid');
        receiptElements.listViewBtn.classList.toggle('active', mode === 'list');
    }
    
    // Redisplay receipts
    displayReceipts();
}

/**
 * Show no receipts message
 */
function showNoReceiptsMessage() {
    if (receiptElements.noReceiptsMessage) {
        receiptElements.noReceiptsMessage.style.display = 'block';
    }
    if (receiptElements.receiptsContainer) {
        receiptElements.receiptsContainer.innerHTML = '';
    }
}

/**
 * Hide no receipts message
 */
function hideNoReceiptsMessage() {
    if (receiptElements.noReceiptsMessage) {
        receiptElements.noReceiptsMessage.style.display = 'none';
    }
}

/**
 * Open receipt modal
 */
function openReceiptModal() {
    receiptState.isEditing = false;
    receiptState.currentReceipt = null;
    
    if (receiptElements.modalTitle) {
        receiptElements.modalTitle.textContent = 'Add Receipt';
    }
    
    resetReceiptForm();
    
    // Set default date to today
    const receiptDateInput = document.getElementById('receiptDate');
    if (receiptDateInput) {
        receiptDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (receiptElements.receiptModal) {
        receiptElements.receiptModal.classList.add('active');
    }
}

/**
 * Close receipt modal
 */
function closeReceiptModal() {
    if (receiptElements.receiptModal) {
        receiptElements.receiptModal.classList.remove('active');
    }
    
    resetReceiptForm();
    receiptState.currentReceipt = null;
    receiptState.isEditing = false;
}

/**
 * Reset receipt form
 */
function resetReceiptForm() {
    if (receiptElements.receiptForm) {
        receiptElements.receiptForm.reset();
    }
    
    if (receiptElements.receiptPreview) {
        receiptElements.receiptPreview.innerHTML = '';
        receiptElements.receiptPreview.classList.remove('active');
    }
}

/**
 * Handle filter change
 */
function handleFilterChange(event) {
    const filterId = event.target.id;
    
    if (filterId === 'sortBy') {
        receiptState.sortBy = event.target.value;
    } else {
        const filterKey = filterId.replace('receipt', '').replace('Filter', '').toLowerCase();
        receiptState.filters[filterKey] = event.target.value;
    }
    
    displayReceipts();
    updateReceiptSummary();
}

/**
 * Handle search change
 */
function handleSearchChange(event) {
    receiptState.filters.search = event.target.value;
    displayReceipts();
    updateReceiptSummary();
}

/**
 * Handle date filter change
 */
function handleDateFilterChange(event) {
    const value = event.target.value;
    receiptState.filters.dateRange = value;
    
    if (receiptElements.customDateRange) {
        receiptElements.customDateRange.style.display = value === 'custom' ? 'block' : 'none';
    }
    
    // Set up custom date range listeners
    if (value === 'custom') {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', (e) => {
                receiptState.filters.startDate = e.target.value;
                displayReceipts();
                updateReceiptSummary();
            });
            
            endDateInput.addEventListener('change', (e) => {
                receiptState.filters.endDate = e.target.value;
                displayReceipts();
                updateReceiptSummary();
            });
        }
    }
    
    displayReceipts();
    updateReceiptSummary();
}

/**
 * Handle receipt form submission
 */
async function handleReceiptSubmit(event) {
    event.preventDefault();
    
    try {
        // Validate form
        const validation = window.APP ? window.APP.validateForm(receiptElements.receiptForm) : { isValid: true, errors: [] };
        
        if (!validation.isValid) {
            if (window.APP) {
                window.APP.showToast(validation.errors.join(', '), 'error');
            }
            return;
        }
        
        // Get form data
        const formData = new FormData(receiptElements.receiptForm);
        const receiptData = Object.fromEntries(formData.entries());
        
        // Handle image upload
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            if (window.GoogleSheets && window.GoogleSheets.upload) {
                try {
                    receiptData.image_url = await window.GoogleSheets.upload(imageFile, 'receipt_images');
                } catch (error) {
                    console.warn('Image upload failed:', error);
                    if (window.APP) {
                        window.APP.showToast('Receipt saved, but image upload failed', 'warning');
                    }
                }
            }
        }
        
        if (window.APP) {
            window.APP.showLoading('Saving receipt...');
        }
        
        const result = await addReceiptData(receiptData);
        
        if (result) {
            // Refresh display
            loadReceiptData();
            
            // Close modal
            closeReceiptModal();
            
            if (window.APP) {
                window.APP.showToast('Receipt saved successfully', 'success');
            }
        }
        
    } catch (error) {
        console.error('Failed to save receipt:', error);
        if (window.APP) {
            window.APP.showToast('Failed to save receipt', 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Add receipt data
 */
async function addReceiptData(receiptData) {
    try {
        let result;
        
        if (window.GoogleSheets && window.GoogleSheets.receipts) {
            result = await window.GoogleSheets.receipts.add(receiptData);
        } else {
            // Fallback to local storage only
            const receiptId = window.APP ? window.APP.generateId() : Date.now().toString();
            result = {
                receipt_id: receiptId,
                ...receiptData,
                created_date: new Date().toISOString()
            };
            
            const receipts = window.APP ? window.APP.getFromStorage('receipts') || [] : [];
            receipts.push(result);
            
            if (window.APP) {
                window.APP.saveToStorage('receipts', receipts);
                window.APP.state.receipts = receipts;
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Failed to add receipt:', error);
        throw error;
    }
}

/**
 * Show receipt detail
 */
function showReceiptDetail(receiptId) {
    const receipt = receiptState.receipts.find(r => r.receipt_id === receiptId);
    if (!receipt) return;
    
    const vehicle = receiptState.vehicles.find(v => v.vehicle_id === receipt.vehicle_id);
    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
    
    const detailContent = document.getElementById('receiptDetailContent');
    if (detailContent) {
        detailContent.innerHTML = `
            <div class="receipt-detail-image-container">
                ${receipt.image_url ? `
                    <img src="${receipt.image_url}" alt="Receipt" class="receipt-detail-image">
                ` : `
                    <div class="receipt-detail-image" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 4rem;">
                        📄
                    </div>
                `}
            </div>
            <div class="receipt-detail-info">
                <div class="receipt-detail-field">
                    <label>Vendor</label>
                    <span>${receipt.vendor}</span>
                </div>
                <div class="receipt-detail-field">
                    <label>Amount</label>
                    <span>${window.APP ? window.APP.formatCurrency(receipt.amount) : '$' + receipt.amount}</span>
                </div>
                <div class="receipt-detail-field">
                    <label>Date</label>
                    <span>${window.APP ? window.APP.formatDate(receipt.receipt_date) : receipt.receipt_date}</span>
                </div>
                <div class="receipt-detail-field">
                    <label>Vehicle</label>
                    <span>${vehicleName}</span>
                </div>
                <div class="receipt-detail-field">
                    <label>Category</label>
                    <span>${formatReceiptCategory(receipt.category)}</span>
                </div>
                ${receipt.description ? `
                    <div class="receipt-detail-field">
                        <label>Description</label>
                        <span>${receipt.description}</span>
                    </div>
                ` : ''}
            </div>
        `;


    }
    
    receiptState.currentReceipt = receiptId;
    
    if (receiptElements.receiptDetailModal) {
        receiptElements.receiptDetailModal.classList.add('active');
    }
}

/**
 * Close receipt detail modal
 */
function closeReceiptDetailModal() {
    if (receiptElements.receiptDetailModal) {
        receiptElements.receiptDetailModal.classList.remove('active');
    }
    receiptState.currentReceipt = null;
}

/**
 * Open export modal
 */
function openExportModal() {
    if (receiptElements.exportModal) {
        receiptElements.exportModal.classList.add('active');
    }
}

/**
 * Close export modal
 */
function closeExportModal() {
    if (receiptElements.exportModal) {
        receiptElements.exportModal.classList.remove('active');
    }
}

/**
 * Handle export date range change
 */
function handleExportDateRangeChange(event) {
    const value = event.target.value;
    
    if (receiptElements.exportCustomRange) {
        receiptElements.exportCustomRange.style.display = value === 'custom' ? 'block' : 'none';
    }
}

/**
 * Handle export
 */
function handleExport() {
    const format = document.getElementById('exportFormat').value;
    const dateRange = document.getElementById('exportDateRange').value;
    
    let receipts = [...receiptState.receipts];
    
    // Apply date filter
    if (dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'custom':
                const exportStartDate = document.getElementById('exportStartDate').value;
                const exportEndDate = document.getElementById('exportEndDate').value;
                
                if (exportStartDate && exportEndDate) {
                    startDate = new Date(exportStartDate);
                    const endDate = new Date(exportEndDate);
                    
                    receipts = receipts.filter(receipt => {
                        const receiptDate = new Date(receipt.receipt_date);
                        return receiptDate >= startDate && receiptDate <= endDate;
                    });
                }
                break;
        }
        
        if (startDate && dateRange !== 'custom') {
            receipts = receipts.filter(receipt => new Date(receipt.receipt_date) >= startDate);
        }
    }
    
    if (receipts.length === 0) {
        if (window.APP) {
            window.APP.showToast('No receipts to export for selected date range', 'warning');
        }
        return;
    }
    
    // Prepare export data
    const exportData = receipts.map(receipt => {
        const vehicle = receiptState.vehicles.find(v => v.vehicle_id === receipt.vehicle_id);
        const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
        
        return {
            Date: receipt.receipt_date,
            Vendor: receipt.vendor,
            Amount: receipt.amount,
            Category: formatReceiptCategory(receipt.category),
            Vehicle: vehicleName,
            Description: receipt.description || ''
        };
    });
    
    // Export based on format
    switch (format) {
        case 'csv':
            if (window.APP) {
                const filename = `receipts_export_${new Date().toISOString().split('T')[0]}.csv`;
                window.APP.exportToCSV(exportData, filename);
            }
            break;
        case 'pdf':
            if (window.APP) {
                window.APP.showToast('PDF export coming soon', 'info');
            }
            break;
        case 'json':
            exportToJSON(exportData);
            break;
    }
    
    closeExportModal();
    
    if (window.APP) {
        window.APP.showToast(`Exported ${receipts.length} receipts`, 'success');
    }
}

/**
 * Export to JSON
 */
function exportToJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/**
 * Delete receipt (called from HTML)
 */
function deleteReceipt(receiptId) {
    const receipt = receiptState.receipts.find(r => r.receipt_id === receiptId);
    if (!receipt) return;
    
    // Show confirmation modal
    const deleteDetails = document.getElementById('deleteReceiptDetails');
    if (deleteDetails) {
        deleteDetails.textContent = `${receipt.vendor} - ${window.APP ? window.APP.formatCurrency(receipt.amount) : '$' + receipt.amount}`;
    }
    
    receiptState.currentReceipt = receiptId;
    
    if (receiptElements.deleteModal) {
        receiptElements.deleteModal.classList.add('active');
    }
}

/**
 * Confirm delete receipt
 */
async function confirmDeleteReceipt() {
    if (!receiptState.currentReceipt) return;
    
    try {
        if (window.APP) {
            window.APP.showLoading('Deleting receipt...');
        }
        
        // Remove from local storage
        const receipts = window.APP ? window.APP.getFromStorage('receipts') || [] : [];
        const filteredReceipts = receipts.filter(r => r.receipt_id !== receiptState.currentReceipt);
        
        if (window.APP) {
            window.APP.saveToStorage('receipts', filteredReceipts);
            window.APP.state.receipts = filteredReceipts;
        }
        
        // Refresh display
        loadReceiptData();
        
        // Close modals
        closeDeleteModal();
        closeReceiptDetailModal();
        
        if (window.APP) {
            window.APP.showToast('Receipt deleted successfully', 'success');
        }
        
    } catch (error) {
        console.error('Failed to delete receipt:', error);
        if (window.APP) {
            window.APP.showToast('Failed to delete receipt', 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    if (receiptElements.deleteModal) {
        receiptElements.deleteModal.classList.remove('active');
    }
    receiptState.currentReceipt = null;
}

// Export functions for global use
window.ReceiptManager = {
    load: loadReceiptData,
    display: displayReceipts,
    add: openReceiptModal,
    delete: deleteReceipt,
    export: openExportModal
};

