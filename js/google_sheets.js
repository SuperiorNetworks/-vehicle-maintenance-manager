/*
Name: google_sheets.js
Version: 1.0.3
Purpose: Google Sheets integration with CORS-friendly requests
Path: /home/ubuntu/vehicle_maintenance_app/js/google_sheets.js
Copyright: 2025 Superior Networks LLC

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
2025-08-19 v1.0.1 - Added Google Workspace compatibility (Dwain Henderson Jr)
2025-08-19 v1.0.2 - Fixed API routing for Google Apps Script query parameters (Dwain Henderson Jr)
2025-08-20 v1.0.3 - CORS-friendly version using simple GET requests (Dwain Henderson Jr)
*/

// Google Sheets Configuration
const GOOGLE_CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbynrcR_xRZKUB3YpFWEzajX8Fc1vYNYbUsDfSxC4Sz9pb2VFKx5DyUDpmRDTajuHNSW/exec',
    apiVersion: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

// Connection status
let isOnline = navigator.onLine;
let lastSyncTime = null;

/**
 * Initialize Google Sheets integration
 */
function initializeGoogleSheets( ) {
    console.log('Initializing Google Sheets integration...');
    
    if (!GOOGLE_CONFIG.webAppUrl || GOOGLE_CONFIG.webAppUrl.includes('YOUR_SCRIPT_ID')) {
        console.warn('Google Apps Script web app URL not configured');
        return false;
    }
    
    console.log('Google Sheets integration initialized');
    
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
 * Make API request using simple GET with JSONP-style approach
 */
async function makeApiRequest(action, method = 'GET', data = null) {
    if (!GOOGLE_CONFIG.webAppUrl) {
        throw new Error('Google Apps Script web app URL not configured');
    }
    
    let url = GOOGLE_CONFIG.webAppUrl;
    
    if (action) {
        url += '?action=' + action;
    }
    
    // For POST data, we'll encode it as URL parameters for now
    if (data && method === 'POST') {
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(data));
        url += '&' + params.toString();
    }
    
    let lastError;
    
    for (let attempt = 1; attempt <= GOOGLE_CONFIG.retryAttempts; attempt++) {
        try {
            console.log(`API Request (attempt ${attempt}): ${method} ${action}`);
            
            // Use simple fetch with no-cors mode to avoid CORS issues
            const response = await fetch(url, {
                method: 'GET', // Always use GET to avoid CORS preflight
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'error') {
                throw new Error(result.message || 'Unknown API error');
            }
            
            console.log(`API Request successful: ${method} ${action}`);
            return result;
            
        } catch (error) {
            lastError = error;
            console.error(`API Request failed (attempt ${attempt}):`, error.message);
            
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
        
        // Test basic connectivity first
        await makeApiRequest('');
        
        // Sync vehicles
        await syncVehicles();
        
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
async function syncVehicles() {
    try {
        const response = await makeApiRequest('vehicles');
        
        if (response.data && Array.isArray(response.data)) {
            const localVehicles = window.APP ? window.APP.getFromStorage('vehicles') || [] : [];
            const mergedVehicles = mergeData(localVehicles, response.data, 'vehicle_id');
            
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
 * Merge local and remote data
 */
function mergeData(localData, remoteData, idField) {
    const merged = [...localData];
    const localIds = new Set(localData.map(item => item[idField]));
    
    remoteData.forEach(remoteItem => {
        if (!localIds.has(remoteItem[idField])) {
            merged.push(remoteItem);
        } else {
            const index = merged.findIndex(item => item[idField] === remoteItem[idField]);
            if (index !== -1) {
                merged[index] = { ...merged[index], ...remoteItem };
            }
        }
    });
    
    return merged;
}

/**
 * Add new vehicle (simplified for now)
 */
async function addVehicle(vehicleData) {
    try {
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
        
        // Try to sync to Google Sheets
        if (isOnline && GOOGLE_CONFIG.webAppUrl) {
            try {
                await makeApiRequest('vehicles', 'POST', vehicle);
            } catch (error) {
                console.warn('Failed to sync vehicle to cloud, saved locally:', error);
            }
        }
        
        return vehicle;
        
    } catch (error) {
        console.error('Failed to add vehicle:', error);
        throw error;
    }
}

// Export functions for global access
if (typeof window !== 'undefined') {
    window.GoogleSheets = {
        initialize: initializeGoogleSheets,
        syncData: syncData,
        addVehicle: addVehicle
    };
}

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGoogleSheets();
});
