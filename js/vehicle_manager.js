/*
Name: vehicle_manager.js
Version: 1.0.0
Purpose: Vehicle management functionality for adding, editing, and managing vehicle information
Path: /home/ubuntu/vehicle_maintenance_app/js/vehicle_manager.js
Copyright: 2025 Superior Networks LLC

Key Features:
- Add new vehicles with comprehensive information
- Edit existing vehicle details
- Delete vehicles with confirmation
- Vehicle photo upload and preview
- Form validation and error handling
- Vehicle list display and management
- Search and filter capabilities
- Mobile-responsive interface handling

Input: 
- User form submissions (vehicle data)
- File uploads (vehicle photos)
- User interactions (edit, delete, search)

Output:
- Vehicle management interface updates
- Form validation feedback
- Success/error notifications
- Updated vehicle listings

Dependencies:
- app.js (core application functions)
- google_sheets.js (data persistence)
- Modern browser with ES6+ support

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
*/

// Vehicle Manager State
let vehicleManagerState = {
    vehicles: [],
    currentVehicle: null,
    isEditing: false,
    searchTerm: '',
    sortBy: 'make'
};

// DOM Elements
let vehicleElements = {
    addVehicleBtn: null,
    addFirstVehicleBtn: null,
    vehiclesContainer: null,
    noVehiclesMessage: null,
    vehicleModal: null,
    vehicleForm: null,
    modalTitle: null,
    saveVehicleBtn: null,
    deleteModal: null,
    photoPreview: null
};

// Initialize Vehicle Manager
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the vehicle manager page
    if (window.location.pathname.includes('vehicle_manager.html') || 
        document.getElementById('vehiclesContainer')) {
        initializeVehicleManager();
    }
});

/**
 * Initialize Vehicle Manager
 */
function initializeVehicleManager() {
    console.log('Initializing Vehicle Manager...');
    
    // Cache DOM elements
    cacheVehicleElements();
    
    // Set up event listeners
    setupVehicleEventListeners();
    
    // Load vehicles data
    loadVehicles();
    
    console.log('Vehicle Manager initialized');
}

/**
 * Cache DOM elements
 */
function cacheVehicleElements() {
    vehicleElements.addVehicleBtn = document.getElementById('addVehicleBtn');
    vehicleElements.addFirstVehicleBtn = document.getElementById('addFirstVehicleBtn');
    vehicleElements.vehiclesContainer = document.getElementById('vehiclesContainer');
    vehicleElements.noVehiclesMessage = document.getElementById('noVehiclesMessage');
    vehicleElements.vehicleModal = document.getElementById('vehicleModal');
    vehicleElements.vehicleForm = document.getElementById('vehicleForm');
    vehicleElements.modalTitle = document.getElementById('modalTitle');
    vehicleElements.saveVehicleBtn = document.getElementById('saveVehicleBtn');
    vehicleElements.deleteModal = document.getElementById('deleteModal');
    vehicleElements.photoPreview = document.getElementById('photoPreview');
}

/**
 * Set up event listeners
 */
function setupVehicleEventListeners() {
    // Add vehicle buttons
    if (vehicleElements.addVehicleBtn) {
        vehicleElements.addVehicleBtn.addEventListener('click', () => openVehicleModal());
    }
    
    if (vehicleElements.addFirstVehicleBtn) {
        vehicleElements.addFirstVehicleBtn.addEventListener('click', () => openVehicleModal());
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.modal-close, #cancelBtn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeVehicleModal);
    });
    
    // Form submission
    if (vehicleElements.vehicleForm) {
        vehicleElements.vehicleForm.addEventListener('submit', handleVehicleSubmit);
    }
    
    // Photo upload
    const photoInput = document.getElementById('vehiclePhoto');
    if (photoInput && vehicleElements.photoPreview) {
        photoInput.addEventListener('change', (e) => {
            window.APP.handleImageUpload(e.target, vehicleElements.photoPreview);
        });
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteVehicle);
    }
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeVehicleModal();
            closeDeleteModal();
        }
    });
}

/**
 * Load vehicles data
 */
function loadVehicles() {
    try {
        // Get vehicles from app state or local storage
        vehicleManagerState.vehicles = window.APP ? 
            window.APP.state.vehicles || window.APP.getFromStorage('vehicles') || [] : [];
        
        displayVehicles();
        
    } catch (error) {
        console.error('Failed to load vehicles:', error);
        if (window.APP) {
            window.APP.showToast('Failed to load vehicles', 'error');
        }
    }
}

/**
 * Display vehicles
 */
function displayVehicles() {
    if (!vehicleElements.vehiclesContainer) return;
    
    const vehicles = vehicleManagerState.vehicles;
    
    if (vehicles.length === 0) {
        showNoVehiclesMessage();
        return;
    }
    
    hideNoVehiclesMessage();
    
    // Filter and sort vehicles
    const filteredVehicles = filterAndSortVehicles(vehicles);
    
    // Generate HTML
    const vehiclesHTML = filteredVehicles.map(vehicle => createVehicleHTML(vehicle)).join('');
    
    vehicleElements.vehiclesContainer.innerHTML = vehiclesHTML;
    
    // Add event listeners to vehicle items
    addVehicleItemListeners();
}

/**
 * Filter and sort vehicles
 */
function filterAndSortVehicles(vehicles) {
    let filtered = vehicles;
    
    // Apply search filter
    if (vehicleManagerState.searchTerm) {
        const term = vehicleManagerState.searchTerm.toLowerCase();
        filtered = vehicles.filter(vehicle => 
            vehicle.make.toLowerCase().includes(term) ||
            vehicle.model.toLowerCase().includes(term) ||
            vehicle.year.toString().includes(term) ||
            (vehicle.license_plate && vehicle.license_plate.toLowerCase().includes(term))
        );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (vehicleManagerState.sortBy) {
            case 'make':
                return a.make.localeCompare(b.make);
            case 'year':
                return b.year - a.year;
            case 'mileage':
                return (b.current_mileage || 0) - (a.current_mileage || 0);
            default:
                return a.make.localeCompare(b.make);
        }
    });
    
    return filtered;
}

/**
 * Create vehicle HTML
 */
function createVehicleHTML(vehicle) {
    const warrantyStatus = getWarrantyStatus(vehicle.warranty_expiration);
    const insuranceStatus = getInsuranceStatus(vehicle.insurance_expiration);
    const registrationStatus = getRegistrationStatus(vehicle.registration_expiration);
    
    return `
        <div class="vehicle-item" data-vehicle-id="${vehicle.vehicle_id}">
            <div class="vehicle-item-header">
                <div>
                    <h3 class="vehicle-title">${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                    <p class="vehicle-subtitle">${vehicle.license_plate || 'No License Plate'}</p>
                </div>
                <div class="vehicle-actions">
                    <button class="btn-icon btn-edit" onclick="editVehicle('${vehicle.vehicle_id}')" title="Edit Vehicle">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteVehicle('${vehicle.vehicle_id}')" title="Delete Vehicle">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="vehicle-details">
                ${vehicle.vin ? `
                    <div class="vehicle-detail">
                        <span class="detail-label">VIN</span>
                        <span class="detail-value">${vehicle.vin}</span>
                    </div>
                ` : ''}
                
                ${vehicle.current_mileage ? `
                    <div class="vehicle-detail">
                        <span class="detail-label">Mileage</span>
                        <span class="detail-value">${window.APP ? window.APP.formatNumber(vehicle.current_mileage) : vehicle.current_mileage} miles</span>
                    </div>
                ` : ''}
                
                ${vehicle.warranty_expiration ? `
                    <div class="vehicle-detail">
                        <span class="detail-label">Warranty</span>
                        <span class="detail-value">
                            <span class="status-badge ${warrantyStatus.class}">${warrantyStatus.text}</span>
                        </span>
                    </div>
                ` : ''}
                
                ${vehicle.insurance_expiration ? `
                    <div class="vehicle-detail">
                        <span class="detail-label">Insurance</span>
                        <span class="detail-value">
                            <span class="status-badge ${insuranceStatus.class}">${insuranceStatus.text}</span>
                        </span>
                    </div>
                ` : ''}
                
                ${vehicle.registration_expiration ? `
                    <div class="vehicle-detail">
                        <span class="detail-label">Registration</span>
                        <span class="detail-value">
                            <span class="status-badge ${registrationStatus.class}">${registrationStatus.text}</span>
                        </span>
                    </div>
                ` : ''}
                
                ${vehicle.purchase_date ? `
                    <div class="vehicle-detail">
                        <span class="detail-label">Purchase Date</span>
                        <span class="detail-value">${window.APP ? window.APP.formatDate(vehicle.purchase_date) : vehicle.purchase_date}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Get warranty status
 */
function getWarrantyStatus(warrantyDate) {
    if (!warrantyDate) return { text: 'Unknown', class: 'status-warning' };
    
    const today = new Date();
    const warranty = new Date(warrantyDate);
    const daysUntilExpiry = Math.ceil((warranty - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return { text: 'Expired', class: 'status-danger' };
    } else if (daysUntilExpiry <= 30) {
        return { text: `${daysUntilExpiry} days left`, class: 'status-warning' };
    } else {
        return { text: window.APP ? window.APP.formatDate(warrantyDate) : warrantyDate, class: 'status-good' };
    }
}

/**
 * Get insurance status
 */
function getInsuranceStatus(insuranceDate) {
    if (!insuranceDate) return { text: 'Unknown', class: 'status-warning' };
    
    const today = new Date();
    const insurance = new Date(insuranceDate);
    const daysUntilExpiry = Math.ceil((insurance - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return { text: 'Expired', class: 'status-danger' };
    } else if (daysUntilExpiry <= 30) {
        return { text: `${daysUntilExpiry} days left`, class: 'status-warning' };
    } else {
        return { text: window.APP ? window.APP.formatDate(insuranceDate) : insuranceDate, class: 'status-good' };
    }
}

/**
 * Get registration status
 */
function getRegistrationStatus(registrationDate) {
    if (!registrationDate) return { text: 'Unknown', class: 'status-warning' };
    
    const today = new Date();
    const registration = new Date(registrationDate);
    const daysUntilExpiry = Math.ceil((registration - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return { text: 'Expired', class: 'status-danger' };
    } else if (daysUntilExpiry <= 30) {
        return { text: `${daysUntilExpiry} days left`, class: 'status-warning' };
    } else {
        return { text: window.APP ? window.APP.formatDate(registrationDate) : registrationDate, class: 'status-good' };
    }
}

/**
 * Add event listeners to vehicle items
 */
function addVehicleItemListeners() {
    // Event listeners are added via onclick attributes in the HTML
    // This approach is used for simplicity and compatibility
}

/**
 * Show no vehicles message
 */
function showNoVehiclesMessage() {
    if (vehicleElements.noVehiclesMessage) {
        vehicleElements.noVehiclesMessage.style.display = 'block';
    }
    if (vehicleElements.vehiclesContainer) {
        vehicleElements.vehiclesContainer.innerHTML = '';
    }
}

/**
 * Hide no vehicles message
 */
function hideNoVehiclesMessage() {
    if (vehicleElements.noVehiclesMessage) {
        vehicleElements.noVehiclesMessage.style.display = 'none';
    }
}

/**
 * Open vehicle modal
 */
function openVehicleModal(vehicleId = null) {
    vehicleManagerState.isEditing = !!vehicleId;
    vehicleManagerState.currentVehicle = vehicleId;
    
    if (vehicleElements.modalTitle) {
        vehicleElements.modalTitle.textContent = vehicleId ? 'Edit Vehicle' : 'Add New Vehicle';
    }
    
    if (vehicleElements.saveVehicleBtn) {
        const saveText = vehicleElements.saveVehicleBtn.querySelector('#saveButtonText');
        if (saveText) {
            saveText.textContent = vehicleId ? 'Update Vehicle' : 'Save Vehicle';
        }
    }
    
    // Populate form if editing
    if (vehicleId) {
        populateVehicleForm(vehicleId);
    } else {
        resetVehicleForm();
    }
    
    if (vehicleElements.vehicleModal) {
        vehicleElements.vehicleModal.classList.add('active');
    }
}

/**
 * Close vehicle modal
 */
function closeVehicleModal() {
    if (vehicleElements.vehicleModal) {
        vehicleElements.vehicleModal.classList.remove('active');
    }
    
    resetVehicleForm();
    vehicleManagerState.currentVehicle = null;
    vehicleManagerState.isEditing = false;
}

/**
 * Populate vehicle form for editing
 */
function populateVehicleForm(vehicleId) {
    const vehicle = vehicleManagerState.vehicles.find(v => v.vehicle_id === vehicleId);
    if (!vehicle) return;
    
    // Populate form fields
    const fields = [
        'make', 'model', 'year', 'color', 'vin', 'license_plate',
        'current_mileage', 'purchase_date', 'warranty_expiration',
        'insurance_expiration', 'registration_expiration', 'notes'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById('vehicle' + field.charAt(0).toUpperCase() + field.slice(1).replace('_', ''));
        if (element && vehicle[field]) {
            element.value = vehicle[field];
        }
    });
}

/**
 * Reset vehicle form
 */
function resetVehicleForm() {
    if (vehicleElements.vehicleForm) {
        vehicleElements.vehicleForm.reset();
    }
    
    if (vehicleElements.photoPreview) {
        vehicleElements.photoPreview.innerHTML = '';
        vehicleElements.photoPreview.classList.remove('active');
    }
}

/**
 * Handle vehicle form submission
 */
async function handleVehicleSubmit(event) {
    event.preventDefault();
    
    try {
        // Validate form
        const validation = window.APP ? window.APP.validateForm(vehicleElements.vehicleForm) : { isValid: true, errors: [] };
        
        if (!validation.isValid) {
            if (window.APP) {
                window.APP.showToast(validation.errors.join(', '), 'error');
            }
            return;
        }
        
        // Get form data
        const formData = new FormData(vehicleElements.vehicleForm);
        const vehicleData = Object.fromEntries(formData.entries());
        
        // Handle photo upload
        const photoFile = formData.get('photo');
        if (photoFile && photoFile.size > 0) {
            if (window.GoogleSheets && window.GoogleSheets.upload) {
                try {
                    vehicleData.photo_url = await window.GoogleSheets.upload(photoFile, 'vehicle_photos');
                } catch (error) {
                    console.warn('Photo upload failed:', error);
                    if (window.APP) {
                        window.APP.showToast('Vehicle saved, but photo upload failed', 'warning');
                    }
                }
            }
        }
        
        if (window.APP) {
            window.APP.showLoading('Saving vehicle...');
        }
        
        let result;
        if (vehicleManagerState.isEditing) {
            // Update existing vehicle
            result = await updateVehicleData(vehicleManagerState.currentVehicle, vehicleData);
        } else {
            // Add new vehicle
            result = await addVehicleData(vehicleData);
        }
        
        if (result) {
            // Refresh display
            loadVehicles();
            
            // Close modal
            closeVehicleModal();
            
            if (window.APP) {
                window.APP.showToast(
                    vehicleManagerState.isEditing ? 'Vehicle updated successfully' : 'Vehicle added successfully',
                    'success'
                );
            }
        }
        
    } catch (error) {
        console.error('Failed to save vehicle:', error);
        if (window.APP) {
            window.APP.showToast('Failed to save vehicle', 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Add vehicle data
 */
async function addVehicleData(vehicleData) {
    try {
        let result;
        
        if (window.GoogleSheets && window.GoogleSheets.vehicles) {
            result = await window.GoogleSheets.vehicles.add(vehicleData);
        } else {
            // Fallback to local storage only
            const vehicleId = window.APP ? window.APP.generateId() : Date.now().toString();
            result = {
                vehicle_id: vehicleId,
                ...vehicleData,
                created_date: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };
            
            const vehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
            vehicles.push(result);
            
            if (window.APP) {
                window.APP.saveToStorage('vehicles', vehicles);
                window.APP.state.vehicles = vehicles;
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Failed to add vehicle:', error);
        throw error;
    }
}

/**
 * Update vehicle data
 */
async function updateVehicleData(vehicleId, vehicleData) {
    try {
        let result;
        
        if (window.GoogleSheets && window.GoogleSheets.vehicles) {
            result = await window.GoogleSheets.vehicles.update(vehicleId, vehicleData);
        } else {
            // Fallback to local storage only
            const vehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
            const index = vehicles.findIndex(v => v.vehicle_id === vehicleId);
            
            if (index !== -1) {
                result = {
                    ...vehicles[index],
                    ...vehicleData,
                    last_updated: new Date().toISOString()
                };
                
                vehicles[index] = result;
                
                if (window.APP) {
                    window.APP.saveToStorage('vehicles', vehicles);
                    window.APP.state.vehicles = vehicles;
                }
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Failed to update vehicle:', error);
        throw error;
    }
}

/**
 * Edit vehicle (called from HTML)
 */
function editVehicle(vehicleId) {
    openVehicleModal(vehicleId);
}

/**
 * Delete vehicle (called from HTML)
 */
function deleteVehicle(vehicleId) {
    const vehicle = vehicleManagerState.vehicles.find(v => v.vehicle_id === vehicleId);
    if (!vehicle) return;
    
    // Show confirmation modal
    const deleteVehicleName = document.getElementById('deleteVehicleName');
    if (deleteVehicleName) {
        deleteVehicleName.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    }
    
    vehicleManagerState.currentVehicle = vehicleId;
    
    if (vehicleElements.deleteModal) {
        vehicleElements.deleteModal.classList.add('active');
    }
}

/**
 * Confirm delete vehicle
 */
async function confirmDeleteVehicle() {
    if (!vehicleManagerState.currentVehicle) return;
    
    try {
        if (window.APP) {
            window.APP.showLoading('Deleting vehicle...');
        }
        
        if (window.GoogleSheets && window.GoogleSheets.vehicles) {
            await window.GoogleSheets.vehicles.delete(vehicleManagerState.currentVehicle);
        } else {
            // Fallback to local storage only
            const vehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
            const filteredVehicles = vehicles.filter(v => v.vehicle_id !== vehicleManagerState.currentVehicle);
            
            if (window.APP) {
                window.APP.saveToStorage('vehicles', filteredVehicles);
                window.APP.state.vehicles = filteredVehicles;
            }
        }
        
        // Refresh display
        loadVehicles();
        
        // Close modal
        closeDeleteModal();
        
        if (window.APP) {
            window.APP.showToast('Vehicle deleted successfully', 'success');
        }
        
    } catch (error) {
        console.error('Failed to delete vehicle:', error);
        if (window.APP) {
            window.APP.showToast('Failed to delete vehicle', 'error');
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
    if (vehicleElements.deleteModal) {
        vehicleElements.deleteModal.classList.remove('active');
    }
    vehicleManagerState.currentVehicle = null;
}

// Export functions for global use
window.VehicleManager = {
    load: loadVehicles,
    display: displayVehicles,
    add: openVehicleModal,
    edit: editVehicle,
    delete: deleteVehicle
};

