/*
Name: google_sheets.js
Version: 1.0.0
Purpose: Google Sheets integration for vehicle maintenance data storage and synchronization
Path: /home/ubuntu/vehicle_maintenance_app/js/google_sheets.js
Copyright: 2025 Superior Networks LLC

Key Features:
- Google Apps Script web app integration
- CRUD operations for vehicles, maintenance, receipts, and reminders
- Data synchronization between local storage and Google Sheets
- Error handling and retry logic
- Offline capability with local storage fallback
- Image upload handling via Google Drive integration

Input: 
- Application data (vehicles, maintenance records, receipts)
- User authentication tokens
- API requests and responses

Output:
- Synchronized data between local and cloud storage
- Success/error status for operations
- Updated application state

Dependencies:
- Google Apps Script web app deployment
- Google Sheets API access
- Google Drive API for image storage
- Modern browser with fetch API support

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
*/

// Google Sheets Configuration
const GOOGLE_CONFIG = {
    // This will be set when the Google Apps Script is deployed
    webAppUrl: '', // To be configured during setup
    apiVersion: 'v1',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
};

// API Endpoints
const API_ENDPOINTS = {
    vehicles: '/vehicles',
    maintenance: '/maintenance',
    receipts: '/receipts',
    reminders: '/reminders',
    sync: '/sync',
    upload: '/upload'
};

// Connection status
let isOnline = navigator.onLine;
let lastSyncTime = null;

/**
 * Initialize Google Sheets integration
 */
function initializeGoogleSheets() {
    console.log('Initializing Google Sheets integration...');
    
    // Check if web app URL is configured
    if (!GOOGLE_CONFIG.webAppUrl) {
        console.warn('Google Apps Script web app URL not configured');
        return false;
    }
    
    // Set up connection monitoring
    window.addEventListener('online', () => {
        isOnline = true;
        console.log('Connection restored');
        syncData();
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        console.log('Connection lost - working offline');
    });
    
    return true;
}

/**
 * Make API request to Google Apps Script
 */
async function makeApiRequest(endpoint, method = 'GET', data = null) {
    if (!GOOGLE_CONFIG.webAppUrl) {
        throw new Error('Google Apps Script web app URL not configured');
    }
    
    const url = GOOGLE_CONFIG.webAppUrl + endpoint;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: GOOGLE_CONFIG.timeout
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    let lastError;
    
    // Retry logic
    for (let attempt = 1; attempt <= GOOGLE_CONFIG.retryAttempts; attempt++) {
        try {
            console.log(`API Request (attempt ${attempt}): ${method} ${endpoint}`);
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            console.log(`API Request successful: ${method} ${endpoint}`);
            return result;
            
        } catch (error) {
            lastError = error;
            console.error(`API Request failed (attempt ${attempt}):`, error);
            
            if (attempt < GOOGLE_CONFIG.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, GOOGLE_CONFIG.retryDelay * attempt));
            }
        }
    }
    
    throw lastError;
}

/**
 * Sync all data with Google Sheets
 */
async function syncData() {
    if (!isOnline || !GOOGLE_CONFIG.webAppUrl) {
        console.log('Skipping sync - offline or not configured');
        return false;
    }
    
    try {
        console.log('Starting data synchronization...');
        
        if (window.APP) {
            window.APP.showLoading('Syncing data...');
        }
        
        // Get last sync timestamp
        const lastSync = window.APP ? window.APP.getFromStorage('lastSync') : null;
        
        // Sync each data type
        await syncVehicles(lastSync);
        await syncMaintenanceRecords(lastSync);
        await syncReceipts(lastSync);
        await syncReminders(lastSync);
        
        // Update last sync time
        lastSyncTime = Date.now();
        if (window.APP) {
            window.APP.saveToStorage('lastSync', lastSyncTime);
        }
        
        console.log('Data synchronization completed');
        
        if (window.APP) {
            window.APP.showToast('Data synchronized successfully', 'success');
        }
        
        return true;
        
    } catch (error) {
        console.error('Data synchronization failed:', error);
        
        if (window.APP) {
            window.APP.showToast('Sync failed - working offline', 'warning');
        }
        
        return false;
    } finally {
        if (window.APP) {
            window.APP.hideLoading();
        }
    }
}

/**
 * Sync vehicles data
 */
async function syncVehicles(lastSync) {
    try {
        const response = await makeApiRequest(API_ENDPOINTS.vehicles + (lastSync ? `?since=${lastSync}` : ''));
        
        if (response.data && Array.isArray(response.data)) {
            // Merge with local data
            const localVehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
            const mergedVehicles = mergeData(localVehicles, response.data, 'vehicle_id');
            
            // Save merged data
            if (window.APP) {
                window.APP.saveToStorage('vehicles', mergedVehicles);
                window.APP.state.vehicles = mergedVehicles;
            }
            
            console.log(`Synced ${response.data.length} vehicles`);
        }
    } catch (error) {
        console.error('Failed to sync vehicles:', error);
        throw error;
    }
}

/**
 * Sync maintenance records
 */
async function syncMaintenanceRecords(lastSync) {
    try {
        const response = await makeApiRequest(API_ENDPOINTS.maintenance + (lastSync ? `?since=${lastSync}` : ''));
        
        if (response.data && Array.isArray(response.data)) {
            const localRecords = window.APP ? window.APP.getFromStorage('maintenanceRecords') || [] : [];
            const mergedRecords = mergeData(localRecords, response.data, 'log_id');
            
            if (window.APP) {
                window.APP.saveToStorage('maintenanceRecords', mergedRecords);
                window.APP.state.maintenanceRecords = mergedRecords;
            }
            
            console.log(`Synced ${response.data.length} maintenance records`);
        }
    } catch (error) {
        console.error('Failed to sync maintenance records:', error);
        throw error;
    }
}

/**
 * Sync receipts
 */
async function syncReceipts(lastSync) {
    try {
        const response = await makeApiRequest(API_ENDPOINTS.receipts + (lastSync ? `?since=${lastSync}` : ''));
        
        if (response.data && Array.isArray(response.data)) {
            const localReceipts = window.APP ? window.APP.getFromStorage('receipts') || [] : [];
            const mergedReceipts = mergeData(localReceipts, response.data, 'receipt_id');
            
            if (window.APP) {
                window.APP.saveToStorage('receipts', mergedReceipts);
                window.APP.state.receipts = mergedReceipts;
            }
            
            console.log(`Synced ${response.data.length} receipts`);
        }
    } catch (error) {
        console.error('Failed to sync receipts:', error);
        throw error;
    }
}

/**
 * Sync reminders
 */
async function syncReminders(lastSync) {
    try {
        const response = await makeApiRequest(API_ENDPOINTS.reminders + (lastSync ? `?since=${lastSync}` : ''));
        
        if (response.data && Array.isArray(response.data)) {
            const localReminders = window.APP ? window.APP.getFromStorage('reminders') || [] : [];
            const mergedReminders = mergeData(localReminders, response.data, 'reminder_id');
            
            if (window.APP) {
                window.APP.saveToStorage('reminders', mergedReminders);
                window.APP.state.reminders = mergedReminders;
            }
            
            console.log(`Synced ${response.data.length} reminders`);
        }
    } catch (error) {
        console.error('Failed to sync reminders:', error);
        throw error;
    }
}

/**
 * Merge local and remote data
 */
function mergeData(localData, remoteData, idField) {
    const merged = [...localData];
    const localIds = new Set(localData.map(item => item[idField]));
    
    // Add new remote items
    remoteData.forEach(remoteItem => {
        if (!localIds.has(remoteItem[idField])) {
            merged.push(remoteItem);
        } else {
            // Update existing items with remote data (remote takes precedence)
            const index = merged.findIndex(item => item[idField] === remoteItem[idField]);
            if (index !== -1) {
                merged[index] = { ...merged[index], ...remoteItem };
            }
        }
    });
    
    return merged;
}

/**
 * Add new vehicle
 */
async function addVehicle(vehicleData) {
    try {
        // Add to local storage immediately
        const vehicleId = window.APP ? window.APP.generateId() : Date.now().toString();
        const vehicle = {
            vehicle_id: vehicleId,
            ...vehicleData,
            created_date: new Date().toISOString(),
            last_updated: new Date().toISOString()
        };
        
        // Save locally first
        if (window.APP) {
            const vehicles = window.APP.getFromStorage('vehicles') || [];
            vehicles.push(vehicle);
            window.APP.saveToStorage('vehicles', vehicles);
            window.APP.state.vehicles = vehicles;
        }
        
        // Sync to Google Sheets if online
        if (isOnline && GOOGLE_CONFIG.webAppUrl) {
            await makeApiRequest(API_ENDPOINTS.vehicles, 'POST', vehicle);
        }
        
        return vehicle;
        
    } catch (error) {
        console.error('Failed to add vehicle:', error);
        throw error;
    }
}

/**
 * Update vehicle
 */
async function updateVehicle(vehicleId, vehicleData) {
    try {
        const updatedVehicle = {
            ...vehicleData,
            vehicle_id: vehicleId,
            last_updated: new Date().toISOString()
        };
        
        // Update locally first
        if (window.APP) {
            const vehicles = window.APP.getFromStorage('vehicles') || [];
            const index = vehicles.findIndex(v => v.vehicle_id === vehicleId);
            if (index !== -1) {
                vehicles[index] = { ...vehicles[index], ...updatedVehicle };
                window.APP.saveToStorage('vehicles', vehicles);
                window.APP.state.vehicles = vehicles;
            }
        }
        
        // Sync to Google Sheets if online
        if (isOnline && GOOGLE_CONFIG.webAppUrl) {
            await makeApiRequest(API_ENDPOINTS.vehicles + '/' + vehicleId, 'PUT', updatedVehicle);
        }
        
        return updatedVehicle;
        
    } catch (error) {
        console.error('Failed to update vehicle:', error);
        throw error;
    }
}

/**
 * Delete vehicle
 */
async function deleteVehicle(vehicleId) {
    try {
        // Remove locally first
        if (window.APP) {
            const vehicles = window.APP.getFromStorage('vehicles') || [];
            const filteredVehicles = vehicles.filter(v => v.vehicle_id !== vehicleId);
            window.APP.saveToStorage('vehicles', filteredVehicles);
            window.APP.state.vehicles = filteredVehicles;
        }
        
        // Sync to Google Sheets if online
        if (isOnline && GOOGLE_CONFIG.webAppUrl) {
            await makeApiRequest(API_ENDPOINTS.vehicles + '/' + vehicleId, 'DELETE');
        }
        
        return true;
        
    } catch (error) {
        console.error('Failed to delete vehicle:', error);
        throw error;
    }
}

/**
 * Add maintenance record
 */
async function addMaintenanceRecord(maintenanceData) {
    try {
        const logId = window.APP ? window.APP.generateId() : Date.now().toString();
        const record = {
            log_id: logId,
            ...maintenanceData,
            created_date: new Date().toISOString()
        };
        
        // Save locally first
        if (window.APP) {
            const records = window.APP.getFromStorage('maintenanceRecords') || [];
            records.push(record);
            window.APP.saveToStorage('maintenanceRecords', records);
            window.APP.state.maintenanceRecords = records;
        }
        
        // Sync to Google Sheets if online
        if (isOnline && GOOGLE_CONFIG.webAppUrl) {
            await makeApiRequest(API_ENDPOINTS.maintenance, 'POST', record);
        }
        
        return record;
        
    } catch (error) {
        console.error('Failed to add maintenance record:', error);
        throw error;
    }
}

/**
 * Add receipt
 */
async function addReceipt(receiptData) {
    try {
        const receiptId = window.APP ? window.APP.generateId() : Date.now().toString();
        const receipt = {
            receipt_id: receiptId,
            ...receiptData,
            created_date: new Date().toISOString()
        };
        
        // Save locally first
        if (window.APP) {
            const receipts = window.APP.getFromStorage('receipts') || [];
            receipts.push(receipt);
            window.APP.saveToStorage('receipts', receipts);
            window.APP.state.receipts = receipts;
        }
        
        // Sync to Google Sheets if online
        if (isOnline && GOOGLE_CONFIG.webAppUrl) {
            await makeApiRequest(API_ENDPOINTS.receipts, 'POST', receipt);
        }
        
        return receipt;
        
    } catch (error) {
        console.error('Failed to add receipt:', error);
        throw error;
    }
}

/**
 * Upload image file
 */
async function uploadImage(file, folder = 'vehicle_images') {
    if (!isOnline || !GOOGLE_CONFIG.webAppUrl) {
        throw new Error('Image upload requires internet connection');
    }
    
    try {
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        const uploadData = {
            filename: file.name,
            mimeType: file.type,
            data: base64,
            folder: folder
        };
        
        const response = await makeApiRequest(API_ENDPOINTS.upload, 'POST', uploadData);
        
        if (response.url) {
            return response.url;
        } else {
            throw new Error('Upload failed - no URL returned');
        }
        
    } catch (error) {
        console.error('Failed to upload image:', error);
        throw error;
    }
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data:image/jpeg;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * Configure Google Apps Script web app URL
 */
function configureWebAppUrl(url) {
    GOOGLE_CONFIG.webAppUrl = url;
    console.log('Google Apps Script web app URL configured');
    
    // Save to local storage
    if (window.APP) {
        window.APP.saveToStorage('webAppUrl', url);
    }
    
    // Initialize connection
    return initializeGoogleSheets();
}

/**
 * Get configuration status
 */
function getConfigurationStatus() {
    return {
        configured: !!GOOGLE_CONFIG.webAppUrl,
        online: isOnline,
        lastSync: lastSyncTime,
        webAppUrl: GOOGLE_CONFIG.webAppUrl
    };
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved web app URL
    if (window.APP) {
        const savedUrl = window.APP.getFromStorage('webAppUrl');
        if (savedUrl) {
            GOOGLE_CONFIG.webAppUrl = savedUrl;
        }
    }
    
    initializeGoogleSheets();
});

// Export functions for global use
window.GoogleSheets = {
    configure: configureWebAppUrl,
    sync: syncData,
    getStatus: getConfigurationStatus,
    vehicles: {
        add: addVehicle,
        update: updateVehicle,
        delete: deleteVehicle
    },
    maintenance: {
        add: addMaintenanceRecord
    },
    receipts: {
        add: addReceipt
    },
    upload: uploadImage
};

