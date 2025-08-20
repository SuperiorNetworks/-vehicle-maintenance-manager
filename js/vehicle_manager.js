/*
Name: vehicle_manager.js
Version: 1.0.2
Purpose: Vehicle management functionality for the Vehicle Maintenance Manager
Path: /home/ubuntu/vehicle_maintenance_app/js/vehicle_manager.js
Copyright: 2025 Superior Networks LLC

Key Features:
- Add, edit, and delete vehicles
- Vehicle form validation
- Modal management for vehicle forms
- Integration with Google Sheets backend
- Local storage fallback
- Responsive vehicle list display

Input: 
- User form data for vehicle information
- Vehicle management actions (add, edit, delete)

Output:
- Updated vehicle list display
- Saved vehicle data to local storage and Google Sheets
- User feedback messages

Dependencies:
- app.js for core functionality
- google_sheets.js for cloud storage
- Modern browser with ES6 support

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
2025-08-19 v1.0.1 - Added Google Sheets integration (Dwain Henderson Jr)
2025-08-20 v1.0.2 - Fixed vehicle saving with proper async handling (Dwain Henderson Jr)
*/

// Vehicle management state
let currentEditingVehicle = null;

/**
 * Initialize vehicle manager
 */
function initializeVehicleManager() {
    console.log('Initializing Vehicle Manager...');
    
    // Load vehicles on page load
    loadVehicles();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Vehicle Manager initialized');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Add vehicle button
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', openAddVehicleModal);
    }
    
    // Vehicle form submission
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleVehicleFormSubmit);
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

/**
 * Load and display vehicles
 */
function loadVehicles() {
    try {
        console.log('Loading vehicles...');
        
        // Get vehicles from app state or local storage
        let vehicles = [];
        if (window.APP && window.APP.state && window.APP.state.vehicles) {
            vehicles = window.APP.state.vehicles;
        } else if (window.APP) {
            vehicles = window.APP.getFromStorage('vehicles') || [];
        }
        
        console.log(`Found ${vehicles.length} vehicles`);
        
        // Display vehicles
        displayVehicles(vehicles);
        
        // Update dashboard stats if on dashboard page
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
        
    } catch (error) {
        console.error('Failed to load vehicles:', error);
        
        if (window.APP) {
            window.APP.showToast('Failed to load vehicles', 'error');
        }
    }
}

/**
 * Display vehicles in the list
 */
function displayVehicles(vehicles) {
    const vehicleList = document.getElementById('vehicleList');
    if (!vehicleList) {
        console.warn('Vehicle list container not found');
        return;
    }
    
    if (!vehicles || vehicles.length === 0) {
        vehicleList.innerHTML = `
            <div class="empty-state">
                <h3>No Vehicles Added</h3>
                <p>Add your first vehicle to get started with maintenance tracking.</p>
                <button class="btn btn-primary" onclick="openAddVehicleModal()">
                    <i class="fas fa-plus"></i> Add Vehicle
                </button>
            </div>
        `;
        return;
    }
    
    vehicleList.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-card" data-vehicle-id="${vehicle.vehicle_id}">
            <div class="vehicle-header">
                <h3>${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                <div class="vehicle-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editVehicle('${vehicle.vehicle_id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle.vehicle_id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            
            <div class="vehicle-details">
                <div class="detail-row">
                    <span class="label">Color:</span>
                    <span class="value">${vehicle.color || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">License Plate:</span>
                    <span class="value">${vehicle.license_plate || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Current Mileage:</span>
                    <span class="value">${formatMileage(vehicle.current_mileage)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">VIN:</span>
                    <span class="value">${vehicle.vin || 'Not specified'}</span>
                </div>
            </div>
            
            <div class="vehicle-status">
                ${getVehicleStatusBadges(vehicle)}
            </div>
        </div>
    `).join('');
}

/**
 * Get status badges for vehicle
 */
function getVehicleStatusBadges(vehicle) {
    const badges = [];
    const today = new Date();
    
    // Check warranty expiration
    if (vehicle.warranty_expiration) {
        const warrantyDate = new Date(vehicle.warranty_expiration);
        const daysUntilExpiry = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            badges.push('<span class="badge badge-danger">Warranty Expired</span>');
        } else if (daysUntilExpiry < 30) {
            badges.push('<span class="badge badge-warning">Warranty Expiring Soon</span>');
        }
    }
    
    // Check insurance expiration
    if (vehicle.insurance_expiration) {
        const insuranceDate = new Date(vehicle.insurance_expiration);
        const daysUntilExpiry = Math.ceil((insuranceDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            badges.push('<span class="badge badge-danger">Insurance Expired</span>');
        } else if (daysUntilExpiry < 30) {
            badges.push('<span class="badge badge-warning">Insurance Expiring Soon</span>');
        }
    }
    
    // Check registration expiration
    if (vehicle.registration_expiration) {
        const registrationDate = new Date(vehicle.registration_expiration);
        const daysUntilExpiry = Math.ceil((registrationDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            badges.push('<span class="badge badge-danger">Registration Expired</span>');
        } else if (daysUntilExpiry < 30) {
            badges.push('<span class="badge badge-warning">Registration Expiring Soon</span>');
        }
    }
    
    return badges.join(' ');
}

/**
 * Format mileage display
 */
function formatMileage(mileage) {
    if (!mileage || mileage === '0') {
        return 'Not specified';
    }
    
    const miles = parseInt(mileage);
    if (isNaN(miles)) {
        return mileage;
    }
    
    return miles.toLocaleString() + ' miles';
}

/**
 * Open add vehicle modal
 */
function openAddVehicleModal() {
    currentEditingVehicle = null;
    
    // Reset form
    const form = document.getElementById('vehicleForm');
    if (form) {
        form.reset();
    }
    
    // Update modal title
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Vehicle';
    }
    
    // Show modal
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Focus on first input
    const firstInput = document.querySelector('#vehicleForm input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

/**
 * Edit vehicle
 */
function editVehicle(vehicleId) {
    try {
        // Find vehicle
        const vehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
        const vehicle = vehicles.find(v => v.vehicle_id === vehicleId);
        
        if (!vehicle) {
            if (window.APP) {
                window.APP.showToast('Vehicle not found', 'error');
            }
            return;
        }
        
        currentEditingVehicle = vehicle;
        
        // Populate form
        populateVehicleForm(vehicle);
        
        // Update modal title
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Vehicle';
        }
        
        // Show modal
        const modal = document.getElementById('vehicleModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
        
    } catch (error) {
        console.error('Failed to edit vehicle:', error);
        
        if (window.APP) {
            window.APP.showToast('Failed to load vehicle for editing', 'error');
        }
    }
}

/**
 * Populate vehicle form with data
 */
function populateVehicleForm(vehicle) {
    const form = document.getElementById('vehicleForm');
    if (!form) return;
    
    // Populate form fields
    const fields = ['make', 'model', 'year', 'color', 'vin', 'license_plate', 
                   'current_mileage', 'purchase_date', 'warranty_expiration', 
                   'insurance_expiration', 'registration_expiration'];
    
    fields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && vehicle[field]) {
            input.value = vehicle[field];
        }
    });
}

/**
 * Delete vehicle
 */
async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
        return;
    }
    
    try {
        console.log('Deleting vehicle:', vehicleId);
        
        // Show loading
        if (window.APP) {
            window.APP.showLoading('Deleting vehicle...');
        }
        
        // Delete from local storage
        if (window.APP) {
            const vehicles = window.APP.getFromStorage('vehicles') || [];
            const filteredVehicles = vehicles.filter(v => v.vehicle_id !== vehicleId);
            window.APP.saveToStorage('vehicles', filteredVehicles);
            window.APP.state.vehicles = filteredVehicles;
        }
        
        // Delete from Google Sheets if available
        if (window.GoogleSheets && window.GoogleSheets.deleteVehicle) {
            try {
                await window.GoogleSheets.deleteVehicle(vehicleId);
            } catch (error) {
                console.warn('Failed to delete from cloud, deleted locally:', error);
            }
        }
        
        // Show success message
        if (window.APP) {
            window.APP.showToast('Vehicle deleted successfully', 'success');
        }
        
        // Reload vehicles
        loadVehicles();
        
    } catch (error) {
        console.error('Failed to delete vehicle:', error);
        
        if (window.APP) {
            window.APP.showToast('Failed to delete vehicle: ' + error.message, 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Handle vehicle form submission
 */
function handleVehicleFormSubmit(e) {
    e.preventDefault();
    
    if (currentEditingVehicle) {
        updateVehicle();
    } else {
        saveVehicle();
    }
}

/**
 * Save new vehicle
 */
async function saveVehicle() {
    const form = document.getElementById('vehicleForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const make = formData.get('make');
    const model = formData.get('model');
    const year = formData.get('year');
    
    if (!make || !model || !year) {
        if (window.APP) {
            window.APP.showToast('Please fill in Make, Model, and Year', 'error');
        }
        return;
    }
    
    const vehicleData = {
        make: make.trim(),
        model: model.trim(),
        year: year.trim(),
        color: formData.get('color')?.trim() || '',
        vin: formData.get('vin')?.trim() || '',
        license_plate: formData.get('license_plate')?.trim() || '',
        current_mileage: formData.get('current_mileage')?.trim() || '0',
        purchase_date: formData.get('purchase_date') || '',
        warranty_expiration: formData.get('warranty_expiration') || '',
        insurance_expiration: formData.get('insurance_expiration') || '',
        registration_expiration: formData.get('registration_expiration') || ''
    };
    
    try {
        console.log('Saving vehicle:', vehicleData);
        
        // Show loading
        if (window.APP) {
            window.APP.showLoading('Saving vehicle...');
        }
        
        // Save vehicle using Google Sheets integration
        let savedVehicle;
        if (window.GoogleSheets && window.GoogleSheets.addVehicle) {
            savedVehicle = await window.GoogleSheets.addVehicle(vehicleData);
        } else {
            // Fallback to local storage only
            const vehicleId = window.APP ? window.APP.generateId() : Date.now().toString();
            savedVehicle = {
                vehicle_id: vehicleId,
                ...vehicleData,
                created_date: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };
            
            if (window.APP) {
                const vehicles = window.APP.getFromStorage('vehicles') || [];
                vehicles.push(savedVehicle);
                window.APP.saveToStorage('vehicles', vehicles);
                window.APP.state.vehicles = vehicles;
            }
        }
        
        console.log('Vehicle saved successfully:', savedVehicle);
        
        // Show success message
        if (window.APP) {
            window.APP.showToast('Vehicle saved successfully!', 'success');
        }
        
        // Close modal and refresh
        closeModal();
        loadVehicles();
        
        // Trigger sync after a short delay
        setTimeout(() => {
            if (window.GoogleSheets && window.GoogleSheets.syncData) {
                window.GoogleSheets.syncData();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to save vehicle:', error);
        
        if (window.APP) {
            window.APP.showToast('Failed to save vehicle: ' + error.message, 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Update existing vehicle
 */
async function updateVehicle() {
    if (!currentEditingVehicle) {
        console.error('No vehicle selected for editing');
        return;
    }
    
    const form = document.getElementById('vehicleForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const make = formData.get('make');
    const model = formData.get('model');
    const year = formData.get('year');
    
    if (!make || !model || !year) {
        if (window.APP) {
            window.APP.showToast('Please fill in Make, Model, and Year', 'error');
        }
        return;
    }
    
    const vehicleData = {
        make: make.trim(),
        model: model.trim(),
        year: year.trim(),
        color: formData.get('color')?.trim() || '',
        vin: formData.get('vin')?.trim() || '',
        license_plate: formData.get('license_plate')?.trim() || '',
        current_mileage: formData.get('current_mileage')?.trim() || '0',
        purchase_date: formData.get('purchase_date') || '',
        warranty_expiration: formData.get('warranty_expiration') || '',
        insurance_expiration: formData.get('insurance_expiration') || '',
        registration_expiration: formData.get('registration_expiration') || ''
    };
    
    try {
        console.log('Updating vehicle:', currentEditingVehicle.vehicle_id, vehicleData);
        
        // Show loading
        if (window.APP) {
            window.APP.showLoading('Updating vehicle...');
        }
        
        // Update vehicle
        let updatedVehicle;
        if (window.GoogleSheets && window.GoogleSheets.updateVehicle) {
            updatedVehicle = await window.GoogleSheets.updateVehicle(currentEditingVehicle.vehicle_id, vehicleData);
        } else {
            // Fallback to local storage only
            updatedVehicle = {
                ...currentEditingVehicle,
                ...vehicleData,
                last_updated: new Date().toISOString()
            };
            
            if (window.APP) {
                const vehicles = window.APP.getFromStorage('vehicles') || [];
                const index = vehicles.findIndex(v => v.vehicle_id === currentEditingVehicle.vehicle_id);
                if (index !== -1) {
                    vehicles[index] = updatedVehicle;
                    window.APP.saveToStorage('vehicles', vehicles);
                    window.APP.state.vehicles = vehicles;
                }
            }
        }
        
        console.log('Vehicle updated successfully:', updatedVehicle);
        
        // Show success message
        if (window.APP) {
            window.APP.showToast('Vehicle updated successfully!', 'success');
        }
        
        // Close modal and refresh
        closeModal();
        loadVehicles();
        
        // Trigger sync
        setTimeout(() => {
            if (window.GoogleSheets && window.GoogleSheets.syncData) {
                window.GoogleSheets.syncData();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to update vehicle:', error);
        
        if (window.APP) {
            window.APP.showToast('Failed to update vehicle: ' + error.message, 'error');
        }
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Reset form and state
    const form = document.getElementById('vehicleForm');
    if (form) {
        form.reset();
    }
    
    currentEditingVehicle = null;
}

/**
 * Search vehicles
 */
function searchVehicles(searchTerm) {
    if (!searchTerm) {
        loadVehicles();
        return;
    }
    
    const vehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
    const filteredVehicles = vehicles.filter(vehicle => {
        const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.color} ${vehicle.license_plate} ${vehicle.vin}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });
    
    displayVehicles(filteredVehicles);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the vehicle manager page
    if (document.getElementById('vehicleList')) {
        initializeVehicleManager();
    }
});

// Export functions for global access
if (typeof window !== 'undefined') {
    window.VehicleManager = {
        initialize: initializeVehicleManager,
        loadVehicles: loadVehicles,
        openAddVehicleModal: openAddVehicleModal,
        editVehicle: editVehicle,
        deleteVehicle: deleteVehicle,
        searchVehicles: searchVehicles,
        closeModal: closeModal
    };
}
