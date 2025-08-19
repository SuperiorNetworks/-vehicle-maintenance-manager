/*
Name: maintenance_log.js
Version: 1.0.0
Purpose: Maintenance tracking functionality for logging and managing vehicle maintenance activities
Path: /home/ubuntu/vehicle_maintenance_app/js/maintenance_log.js
Copyright: 2025 Superior Networks LLC

Key Features:
- Log new maintenance activities with detailed information
- Track oil changes with intervals and reminders
- Record tire rotations and service history
- Filter and search maintenance records
- Cost tracking and analytics
- Photo attachments for maintenance documentation
- Quick action buttons for common maintenance types
- Mobile-responsive interface handling

Input: 
- User form submissions (maintenance data)
- File uploads (maintenance photos)
- User interactions (filter, search, edit, delete)

Output:
- Maintenance logging interface updates
- Service history display
- Cost analytics and summaries
- Maintenance reminders and alerts
- Photo galleries and documentation

Dependencies:
- app.js (core application functions)
- google_sheets.js (data persistence)
- Modern browser with ES6+ support

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
*/

// Maintenance Log State
let maintenanceState = {
    records: [],
    vehicles: [],
    currentRecord: null,
    isEditing: false,
    filters: {
        vehicle: '',
        type: '',
        dateRange: '',
        search: ''
    },
    sortBy: 'date_desc'
};

// DOM Elements
let maintenanceElements = {
    addMaintenanceBtn: null,
    addFirstRecordBtn: null,
    recordsContainer: null,
    noRecordsMessage: null,
    maintenanceModal: null,
    maintenanceForm: null,
    modalTitle: null,
    deleteModal: null,
    photosPreview: null,
    oilChangeFields: null,
    maintenanceType: null,
    vehicleFilter: null,
    typeFilter: null,
    dateFilter: null,
    searchInput: null
};

// Initialize Maintenance Log
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the maintenance log page
    if (window.location.pathname.includes('maintenance_log.html') || 
        document.getElementById('recordsContainer')) {
        initializeMaintenanceLog();
    }
});

/**
 * Initialize Maintenance Log
 */
function initializeMaintenanceLog() {
    console.log('Initializing Maintenance Log...');
    
    // Cache DOM elements
    cacheMaintenanceElements();
    
    // Set up event listeners
    setupMaintenanceEventListeners();
    
    // Load data
    loadMaintenanceData();
    
    // Set up quick actions
    setupQuickActions();
    
    console.log('Maintenance Log initialized');
}

/**
 * Cache DOM elements
 */
function cacheMaintenanceElements() {
    maintenanceElements.addMaintenanceBtn = document.getElementById('addMaintenanceBtn');
    maintenanceElements.addFirstRecordBtn = document.getElementById('addFirstRecordBtn');
    maintenanceElements.recordsContainer = document.getElementById('recordsContainer');
    maintenanceElements.noRecordsMessage = document.getElementById('noRecordsMessage');
    maintenanceElements.maintenanceModal = document.getElementById('maintenanceModal');
    maintenanceElements.maintenanceForm = document.getElementById('maintenanceForm');
    maintenanceElements.modalTitle = document.getElementById('maintenanceModalTitle');
    maintenanceElements.deleteModal = document.getElementById('deleteMaintenanceModal');
    maintenanceElements.photosPreview = document.getElementById('photosPreview');
    maintenanceElements.oilChangeFields = document.getElementById('oilChangeFields');
    maintenanceElements.maintenanceType = document.getElementById('maintenanceType');
    maintenanceElements.vehicleFilter = document.getElementById('vehicleFilter');
    maintenanceElements.typeFilter = document.getElementById('typeFilter');
    maintenanceElements.dateFilter = document.getElementById('dateFilter');
    maintenanceElements.searchInput = document.getElementById('searchMaintenance');
}

/**
 * Set up event listeners
 */
function setupMaintenanceEventListeners() {
    // Add maintenance buttons
    if (maintenanceElements.addMaintenanceBtn) {
        maintenanceElements.addMaintenanceBtn.addEventListener('click', () => openMaintenanceModal());
    }
    
    if (maintenanceElements.addFirstRecordBtn) {
        maintenanceElements.addFirstRecordBtn.addEventListener('click', () => openMaintenanceModal());
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('#closeMaintenanceModal, #cancelMaintenanceBtn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeMaintenanceModal);
    });
    
    // Form submission
    if (maintenanceElements.maintenanceForm) {
        maintenanceElements.maintenanceForm.addEventListener('submit', handleMaintenanceSubmit);
    }
    
    // Maintenance type change
    if (maintenanceElements.maintenanceType) {
        maintenanceElements.maintenanceType.addEventListener('change', handleMaintenanceTypeChange);
    }
    
    // Photo upload
    const photosInput = document.getElementById('maintenancePhotos');
    if (photosInput && maintenanceElements.photosPreview) {
        photosInput.addEventListener('change', handlePhotosUpload);
    }
    
    // Filters
    if (maintenanceElements.vehicleFilter) {
        maintenanceElements.vehicleFilter.addEventListener('change', handleFilterChange);
    }
    
    if (maintenanceElements.typeFilter) {
        maintenanceElements.typeFilter.addEventListener('change', handleFilterChange);
    }
    
    if (maintenanceElements.dateFilter) {
        maintenanceElements.dateFilter.addEventListener('change', handleFilterChange);
    }
    
    if (maintenanceElements.searchInput) {
        maintenanceElements.searchInput.addEventListener('input', 
            window.APP ? window.APP.debounce(handleSearchChange, 300) : handleSearchChange
        );
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteMaintenanceBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteMaintenance);
    }
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteMaintenanceBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeMaintenanceModal();
            closeDeleteModal();
        }
    });
}

/**
 * Set up quick actions
 */
function setupQuickActions() {
    const quickOilChange = document.getElementById('quickOilChange');
    if (quickOilChange) {
        quickOilChange.addEventListener('click', () => openMaintenanceModal('oil_change'));
    }
    
    const quickTireRotation = document.getElementById('quickTireRotation');
    if (quickTireRotation) {
        quickTireRotation.addEventListener('click', () => openMaintenanceModal('tire_rotation'));
    }
    
    const quickInspection = document.getElementById('quickInspection');
    if (quickInspection) {
        quickInspection.addEventListener('click', () => openMaintenanceModal('inspection'));
    }
    
    const quickRepair = document.getElementById('quickRepair');
    if (quickRepair) {
        quickRepair.addEventListener('click', () => openMaintenanceModal('repair'));
    }
}

/**
 * Load maintenance data
 */
function loadMaintenanceData() {
    try {
        // Get data from app state or local storage
        maintenanceState.records = window.APP ? 
            window.APP.state.maintenanceRecords || window.APP.getFromStorage('maintenanceRecords') || [] : [];
        
        maintenanceState.vehicles = window.APP ? 
            window.APP.state.vehicles || window.APP.getFromStorage('vehicles') || [] : [];
        
        // Populate vehicle filters
        populateVehicleFilters();
        
        // Display records
        displayMaintenanceRecords();
        
        // Update summary
        updateMaintenanceSummary();
        
    } catch (error) {
        console.error('Failed to load maintenance data:', error);
        if (window.APP) {
            window.APP.showToast('Failed to load maintenance data', 'error');
        }
    }
}

/**
 * Populate vehicle filters
 */
function populateVehicleFilters() {
    const vehicleSelects = [
        document.getElementById('vehicleFilter'),
        document.getElementById('maintenanceVehicle')
    ];
    
    vehicleSelects.forEach(select => {
        if (select) {
            // Clear existing options (except first)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // Add vehicle options
            maintenanceState.vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicle_id;
                option.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
                select.appendChild(option);
            });
        }
    });
}

/**
 * Display maintenance records
 */
function displayMaintenanceRecords() {
    if (!maintenanceElements.recordsContainer) return;
    
    const records = getFilteredRecords();
    
    if (records.length === 0) {
        showNoRecordsMessage();
        return;
    }
    
    hideNoRecordsMessage();
    
    // Generate HTML
    const recordsHTML = records.map(record => createMaintenanceRecordHTML(record)).join('');
    
    maintenanceElements.recordsContainer.innerHTML = recordsHTML;
}

/**
 * Get filtered records
 */
function getFilteredRecords() {
    let filtered = [...maintenanceState.records];
    
    // Apply vehicle filter
    if (maintenanceState.filters.vehicle) {
        filtered = filtered.filter(record => record.vehicle_id === maintenanceState.filters.vehicle);
    }
    
    // Apply type filter
    if (maintenanceState.filters.type) {
        filtered = filtered.filter(record => record.maintenance_type === maintenanceState.filters.type);
    }
    
    // Apply date filter
    if (maintenanceState.filters.dateRange) {
        const days = parseInt(maintenanceState.filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.service_date);
            return recordDate >= cutoffDate;
        });
    }
    
    // Apply search filter
    if (maintenanceState.filters.search) {
        const term = maintenanceState.filters.search.toLowerCase();
        filtered = filtered.filter(record => 
            record.description.toLowerCase().includes(term) ||
            record.service_provider.toLowerCase().includes(term) ||
            record.maintenance_type.toLowerCase().includes(term)
        );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (maintenanceState.sortBy) {
            case 'date_desc':
                return new Date(b.service_date) - new Date(a.service_date);
            case 'date_asc':
                return new Date(a.service_date) - new Date(b.service_date);
            case 'cost_desc':
                return (b.cost || 0) - (a.cost || 0);
            case 'cost_asc':
                return (a.cost || 0) - (b.cost || 0);
            default:
                return new Date(b.service_date) - new Date(a.service_date);
        }
    });
    
    return filtered;
}

/**
 * Create maintenance record HTML
 */
function createMaintenanceRecordHTML(record) {
    const vehicle = maintenanceState.vehicles.find(v => v.vehicle_id === record.vehicle_id);
    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
    
    return `
        <div class="maintenance-record" data-record-id="${record.log_id}">
            <div class="record-header">
                <div>
                    <h3 class="record-title">${formatMaintenanceType(record.maintenance_type)}</h3>
                    <p class="record-subtitle">${vehicleName} • ${window.APP ? window.APP.formatDate(record.service_date) : record.service_date}</p>
                </div>
                <div class="record-actions">
                    <button class="btn-icon btn-edit" onclick="editMaintenanceRecord('${record.log_id}')" title="Edit Record">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMaintenanceRecord('${record.log_id}')" title="Delete Record">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="record-details">
                ${record.mileage ? `
                    <div class="record-detail">
                        <span class="record-detail-label">Mileage</span>
                        <span class="record-detail-value">${window.APP ? window.APP.formatNumber(record.mileage) : record.mileage} miles</span>
                    </div>
                ` : ''}
                
                ${record.cost ? `
                    <div class="record-detail">
                        <span class="record-detail-label">Cost</span>
                        <span class="record-detail-value">${window.APP ? window.APP.formatCurrency(record.cost) : '$' + record.cost}</span>
                    </div>
                ` : ''}
                
                ${record.service_provider ? `
                    <div class="record-detail">
                        <span class="record-detail-label">Service Provider</span>
                        <span class="record-detail-value">${record.service_provider}</span>
                    </div>
                ` : ''}
                
                ${record.next_service_mileage ? `
                    <div class="record-detail">
                        <span class="record-detail-label">Next Service</span>
                        <span class="record-detail-value">${window.APP ? window.APP.formatNumber(record.next_service_mileage) : record.next_service_mileage} miles</span>
                    </div>
                ` : ''}
            </div>
            
            ${record.description ? `
                <div class="record-description">
                    ${record.description}
                </div>
            ` : ''}
        </div>
    `;
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
 * Update maintenance summary
 */
function updateMaintenanceSummary() {
    const records = getFilteredRecords();
    
    // Total records
    const totalRecordsElement = document.getElementById('totalRecords');
    if (totalRecordsElement) {
        totalRecordsElement.textContent = records.length;
    }
    
    // Total cost
    const totalCost = records.reduce((sum, record) => sum + (record.cost || 0), 0);
    const totalCostElement = document.getElementById('totalCost');
    if (totalCostElement) {
        totalCostElement.textContent = window.APP ? window.APP.formatCurrency(totalCost) : '$' + totalCost;
    }
    
    // Last service
    const lastServiceElement = document.getElementById('lastService');
    if (lastServiceElement && records.length > 0) {
        const lastRecord = records[0]; // Already sorted by date desc
        lastServiceElement.textContent = window.APP ? window.APP.formatDate(lastRecord.service_date) : lastRecord.service_date;
    }
    
    // Next service (simplified - would need more complex logic for real implementation)
    const nextServiceElement = document.getElementById('nextService');
    if (nextServiceElement) {
        const upcomingService = records.find(record => record.next_service_date);
        if (upcomingService) {
            nextServiceElement.textContent = window.APP ? window.APP.formatDate(upcomingService.next_service_date) : upcomingService.next_service_date;
        } else {
            nextServiceElement.textContent = 'None scheduled';
        }
    }
}

/**
 * Show no records message
 */
function showNoRecordsMessage() {
    if (maintenanceElements.noRecordsMessage) {
        maintenanceElements.noRecordsMessage.style.display = 'block';
    }
    if (maintenanceElements.recordsContainer) {
        maintenanceElements.recordsContainer.innerHTML = '';
    }
}

/**
 * Hide no records message
 */
function hideNoRecordsMessage() {
    if (maintenanceElements.noRecordsMessage) {
        maintenanceElements.noRecordsMessage.style.display = 'none';
    }
}

/**
 * Open maintenance modal
 */
function openMaintenanceModal(maintenanceType = null) {
    maintenanceState.isEditing = false;
    maintenanceState.currentRecord = null;
    
    if (maintenanceElements.modalTitle) {
        maintenanceElements.modalTitle.textContent = 'Log Maintenance';
    }
    
    resetMaintenanceForm();
    
    // Pre-select maintenance type if provided
    if (maintenanceType && maintenanceElements.maintenanceType) {
        maintenanceElements.maintenanceType.value = maintenanceType;
        handleMaintenanceTypeChange();
    }
    
    // Set default date to today
    const serviceDateInput = document.getElementById('serviceDate');
    if (serviceDateInput) {
        serviceDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (maintenanceElements.maintenanceModal) {
        maintenanceElements.maintenanceModal.classList.add('active');
    }
}

/**
 * Close maintenance modal
 */
function closeMaintenanceModal() {
    if (maintenanceElements.maintenanceModal) {
        maintenanceElements.maintenanceModal.classList.remove('active');
    }
    
    resetMaintenanceForm();
    maintenanceState.currentRecord = null;
    maintenanceState.isEditing = false;
}

/**
 * Reset maintenance form
 */
function resetMaintenanceForm() {
    if (maintenanceElements.maintenanceForm) {
        maintenanceElements.maintenanceForm.reset();
    }
    
    if (maintenanceElements.photosPreview) {
        maintenanceElements.photosPreview.innerHTML = '';
        maintenanceElements.photosPreview.classList.remove('active');
    }
    
    if (maintenanceElements.oilChangeFields) {
        maintenanceElements.oilChangeFields.style.display = 'none';
    }
}

/**
 * Handle maintenance type change
 */
function handleMaintenanceTypeChange() {
    const selectedType = maintenanceElements.maintenanceType.value;
    
    if (maintenanceElements.oilChangeFields) {
        if (selectedType === 'oil_change') {
            maintenanceElements.oilChangeFields.style.display = 'block';
        } else {
            maintenanceElements.oilChangeFields.style.display = 'none';
        }
    }
}

/**
 * Handle photos upload
 */
function handlePhotosUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (maintenanceElements.photosPreview) {
        maintenanceElements.photosPreview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'photo-thumbnail';
                    img.alt = `Photo ${index + 1}`;
                    maintenanceElements.photosPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
        
        maintenanceElements.photosPreview.classList.add('active');
    }
}

/**
 * Handle filter change
 */
function handleFilterChange(event) {
    const filterType = event.target.id.replace('Filter', '').replace('maintenance', '');
    maintenanceState.filters[filterType] = event.target.value;
    
    displayMaintenanceRecords();
    updateMaintenanceSummary();
}

/**
 * Handle search change
 */
function handleSearchChange(event) {
    maintenanceState.filters.search = event.target.value;
    displayMaintenanceRecords();
    updateMaintenanceSummary();
}

/**
 * Handle maintenance form submission
 */
async function handleMaintenanceSubmit(event) {
    event.preventDefault();
    
    try {
        // Validate form
        const validation = window.APP ? window.APP.validateForm(maintenanceElements.maintenanceForm) : { isValid: true, errors: [] };
        
        if (!validation.isValid) {
            if (window.APP) {
                window.APP.showToast(validation.errors.join(', '), 'error');
            }
            return;
        }
        
        // Get form data
        const formData = new FormData(maintenanceElements.maintenanceForm);
        const maintenanceData = Object.fromEntries(formData.entries());
        
        // Handle photo uploads
        const photoFiles = formData.getAll('photos');
        if (photoFiles && photoFiles.length > 0 && photoFiles[0].size > 0) {
            if (window.GoogleSheets && window.GoogleSheets.upload) {
                try {
                    const photoUrls = [];
                    for (const file of photoFiles) {
                        if (file.size > 0) {
                            const url = await window.GoogleSheets.upload(file, 'maintenance_photos');
                            photoUrls.push(url);
                        }
                    }
                    maintenanceData.photo_urls = photoUrls.join(',');
                } catch (error) {
                    console.warn('Photo upload failed:', error);
                    if (window.APP) {
                        window.APP.showToast('Record saved, but photo upload failed', 'warning');
                    }
                }
            }
        }
        
        if (window.APP) {
            window.APP.showLoading('Saving maintenance record...');
        }
        
        const result = await addMaintenanceRecord(maintenanceData);
        
        if (result) {
            // Refresh display
            loadMaintenanceData();
            
            // Close modal
            closeMaintenanceModal();
            
            if (window.APP) {
                window.APP.showToast('Maintenance record saved successfully', 'success');
            }
        }
        
    } catch (error) {
        console.error('Failed to save maintenance record:', error);
        if (window.APP) {
            window.APP.showToast('Failed to save maintenance record', 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Add maintenance record
 */
async function addMaintenanceRecord(maintenanceData) {
    try {
        let result;
        
        if (window.GoogleSheets && window.GoogleSheets.maintenance) {
            result = await window.GoogleSheets.maintenance.add(maintenanceData);
        } else {
            // Fallback to local storage only
            const logId = window.APP ? window.APP.generateId() : Date.now().toString();
            result = {
                log_id: logId,
                ...maintenanceData,
                created_date: new Date().toISOString()
            };
            
            const records = window.APP ? window.APP.getFromStorage('maintenanceRecords') || [] : [];
            records.push(result);
            
            if (window.APP) {
                window.APP.saveToStorage('maintenanceRecords', records);
                window.APP.state.maintenanceRecords = records;
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Failed to add maintenance record:', error);
        throw error;
    }
}

/**
 * Edit maintenance record (called from HTML)
 */
function editMaintenanceRecord(recordId) {
    // Implementation would be similar to vehicle editing
    console.log('Edit maintenance record:', recordId);
    // For now, just show a message
    if (window.APP) {
        window.APP.showToast('Edit functionality coming soon', 'info');
    }
}

/**
 * Delete maintenance record (called from HTML)
 */
function deleteMaintenanceRecord(recordId) {
    const record = maintenanceState.records.find(r => r.log_id === recordId);
    if (!record) return;
    
    // Show confirmation modal
    const deleteDetails = document.getElementById('deleteMaintenanceDetails');
    if (deleteDetails) {
        deleteDetails.textContent = `${formatMaintenanceType(record.maintenance_type)} - ${window.APP ? window.APP.formatDate(record.service_date) : record.service_date}`;
    }
    
    maintenanceState.currentRecord = recordId;
    
    if (maintenanceElements.deleteModal) {
        maintenanceElements.deleteModal.classList.add('active');
    }
}

/**
 * Confirm delete maintenance record
 */
async function confirmDeleteMaintenance() {
    if (!maintenanceState.currentRecord) return;
    
    try {
        if (window.APP) {
            window.APP.showLoading('Deleting record...');
        }
        
        // Remove from local storage
        const records = window.APP ? window.APP.getFromStorage('maintenanceRecords') || [] : [];
        const filteredRecords = records.filter(r => r.log_id !== maintenanceState.currentRecord);
        
        if (window.APP) {
            window.APP.saveToStorage('maintenanceRecords', filteredRecords);
            window.APP.state.maintenanceRecords = filteredRecords;
        }
        
        // Refresh display
        loadMaintenanceData();
        
        // Close modal
        closeDeleteModal();
        
        if (window.APP) {
            window.APP.showToast('Maintenance record deleted successfully', 'success');
        }
        
    } catch (error) {
        console.error('Failed to delete maintenance record:', error);
        if (window.APP) {
            window.APP.showToast('Failed to delete maintenance record', 'error');
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
    if (maintenanceElements.deleteModal) {
        maintenanceElements.deleteModal.classList.remove('active');
    }
    maintenanceState.currentRecord = null;
}

// Export functions for global use
window.MaintenanceLog = {
    load: loadMaintenanceData,
    display: displayMaintenanceRecords,
    add: openMaintenanceModal,
    edit: editMaintenanceRecord,
    delete: deleteMaintenanceRecord
};

