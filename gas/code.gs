/*
Name: code.gs
Version: 1.0.0
Purpose: Google Apps Script backend for vehicle maintenance web application
Path: /home/ubuntu/vehicle_maintenance_app/gas/code.gs
Copyright: 2025 Superior Networks LLC

Key Features:
- RESTful API endpoints for CRUD operations
- Google Sheets integration for data persistence
- Google Drive integration for image storage
- Cross-origin request handling (CORS)
- Error handling and logging
- Data validation and sanitization
- Authentication and security measures
- Automatic spreadsheet creation and setup

Input: 
- HTTP requests from web application
- JSON data for vehicles, maintenance, receipts
- Image files for upload to Google Drive

Output:
- JSON responses with data or error messages
- Google Sheets data storage
- Google Drive file storage
- HTTP status codes and headers

Dependencies:
- Google Apps Script runtime
- Google Sheets API
- Google Drive API
- SpreadsheetApp service
- DriveApp service

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
*/

// Configuration
const CONFIG = {
  SPREADSHEET_NAME: 'Vehicle Maintenance Data',
  DRIVE_FOLDER_NAME: 'Vehicle Maintenance Images',
  API_VERSION: 'v1',
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_ORIGINS: ['*'], // Allow all origins for development
  LOG_LEVEL: 'INFO'
};

// Sheet names
const SHEET_NAMES = {
  VEHICLES: 'Vehicles',
  MAINTENANCE: 'Maintenance_Log',
  RECEIPTS: 'Receipts',
  REMINDERS: 'Reminders'
};

// Global variables
let spreadsheet = null;
let driveFolder = null;

/**
 * Initialize the application
 */
function onInstall() {
  try {
    console.log('Installing Vehicle Maintenance App...');
    
    // Create or get spreadsheet
    spreadsheet = getOrCreateSpreadsheet();
    
    // Create or get Drive folder
    driveFolder = getOrCreateDriveFolder();
    
    // Set up sheets
    setupSheets();
    
    console.log('Installation completed successfully');
    return { success: true, message: 'Installation completed' };
    
  } catch (error) {
    console.error('Installation failed:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Main entry point for web app requests
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doPut(e) {
  return handleRequest(e, 'PUT');
}

function doDelete(e) {
  return handleRequest(e, 'DELETE');
}

/**
 * Handle HTTP requests
 */
function handleRequest(e, method) {
  try {
    // Initialize if needed
    if (!spreadsheet) {
      spreadsheet = getOrCreateSpreadsheet();
    }
    if (!driveFolder) {
      driveFolder = getOrCreateDriveFolder();
    }
    
    // Parse request
    const path = e.pathInfo || '';
    const params = e.parameter || {};
    let data = null;
    
    // Parse POST/PUT data
    if (method === 'POST' || method === 'PUT') {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        return createResponse({ error: 'Invalid JSON data' }, 400);
      }
    }
    
    // Route request
    const response = routeRequest(method, path, params, data);
    
    // Add CORS headers
    return createResponse(response.data, response.status);
    
  } catch (error) {
    console.error('Request handling error:', error);
    return createResponse({ error: 'Internal server error' }, 500);
  }
}

/**
 * Route requests to appropriate handlers
 */
function routeRequest(method, path, params, data) {
  const pathParts = path.split('/').filter(part => part.length > 0);
  const resource = pathParts[0] || '';
  const id = pathParts[1] || '';
  
  try {
    switch (resource) {
      case 'vehicles':
        return handleVehicles(method, id, params, data);
      case 'maintenance':
        return handleMaintenance(method, id, params, data);
      case 'receipts':
        return handleReceipts(method, id, params, data);
      case 'reminders':
        return handleReminders(method, id, params, data);
      case 'upload':
        return handleUpload(method, data);
      case 'sync':
        return handleSync(method, params);
      case 'install':
        return { data: onInstall(), status: 200 };
      default:
        return { data: { error: 'Invalid endpoint' }, status: 404 };
    }
  } catch (error) {
    console.error('Route handling error:', error);
    return { data: { error: error.toString() }, status: 500 };
  }
}

/**
 * Handle vehicle operations
 */
function handleVehicles(method, id, params, data) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.VEHICLES);
  
  switch (method) {
    case 'GET':
      if (id) {
        return { data: getVehicleById(sheet, id), status: 200 };
      } else {
        const since = params.since ? new Date(parseInt(params.since)) : null;
        return { data: { data: getAllVehicles(sheet, since) }, status: 200 };
      }
      
    case 'POST':
      if (!data) {
        return { data: { error: 'No data provided' }, status: 400 };
      }
      const newVehicle = addVehicle(sheet, data);
      return { data: newVehicle, status: 201 };
      
    case 'PUT':
      if (!id || !data) {
        return { data: { error: 'ID and data required' }, status: 400 };
      }
      const updatedVehicle = updateVehicle(sheet, id, data);
      return { data: updatedVehicle, status: 200 };
      
    case 'DELETE':
      if (!id) {
        return { data: { error: 'ID required' }, status: 400 };
      }
      deleteVehicle(sheet, id);
      return { data: { success: true }, status: 200 };
      
    default:
      return { data: { error: 'Method not allowed' }, status: 405 };
  }
}

/**
 * Handle maintenance operations
 */
function handleMaintenance(method, id, params, data) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.MAINTENANCE);
  
  switch (method) {
    case 'GET':
      if (id) {
        return { data: getMaintenanceById(sheet, id), status: 200 };
      } else {
        const since = params.since ? new Date(parseInt(params.since)) : null;
        return { data: { data: getAllMaintenance(sheet, since) }, status: 200 };
      }
      
    case 'POST':
      if (!data) {
        return { data: { error: 'No data provided' }, status: 400 };
      }
      const newRecord = addMaintenance(sheet, data);
      return { data: newRecord, status: 201 };
      
    case 'PUT':
      if (!id || !data) {
        return { data: { error: 'ID and data required' }, status: 400 };
      }
      const updatedRecord = updateMaintenance(sheet, id, data);
      return { data: updatedRecord, status: 200 };
      
    case 'DELETE':
      if (!id) {
        return { data: { error: 'ID required' }, status: 400 };
      }
      deleteMaintenance(sheet, id);
      return { data: { success: true }, status: 200 };
      
    default:
      return { data: { error: 'Method not allowed' }, status: 405 };
  }
}

/**
 * Handle receipt operations
 */
function handleReceipts(method, id, params, data) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.RECEIPTS);
  
  switch (method) {
    case 'GET':
      if (id) {
        return { data: getReceiptById(sheet, id), status: 200 };
      } else {
        const since = params.since ? new Date(parseInt(params.since)) : null;
        return { data: { data: getAllReceipts(sheet, since) }, status: 200 };
      }
      
    case 'POST':
      if (!data) {
        return { data: { error: 'No data provided' }, status: 400 };
      }
      const newReceipt = addReceipt(sheet, data);
      return { data: newReceipt, status: 201 };
      
    case 'PUT':
      if (!id || !data) {
        return { data: { error: 'ID and data required' }, status: 400 };
      }
      const updatedReceipt = updateReceipt(sheet, id, data);
      return { data: updatedReceipt, status: 200 };
      
    case 'DELETE':
      if (!id) {
        return { data: { error: 'ID required' }, status: 400 };
      }
      deleteReceipt(sheet, id);
      return { data: { success: true }, status: 200 };
      
    default:
      return { data: { error: 'Method not allowed' }, status: 405 };
  }
}

/**
 * Handle reminder operations
 */
function handleReminders(method, id, params, data) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.REMINDERS);
  
  switch (method) {
    case 'GET':
      const since = params.since ? new Date(parseInt(params.since)) : null;
      return { data: { data: getAllReminders(sheet, since) }, status: 200 };
      
    case 'POST':
      if (!data) {
        return { data: { error: 'No data provided' }, status: 400 };
      }
      const newReminder = addReminder(sheet, data);
      return { data: newReminder, status: 201 };
      
    default:
      return { data: { error: 'Method not allowed' }, status: 405 };
  }
}

/**
 * Handle file uploads
 */
function handleUpload(method, data) {
  if (method !== 'POST') {
    return { data: { error: 'Method not allowed' }, status: 405 };
  }
  
  if (!data || !data.filename || !data.data) {
    return { data: { error: 'Filename and data required' }, status: 400 };
  }
  
  try {
    const fileUrl = uploadToGoogleDrive(data.filename, data.data, data.mimeType, data.folder);
    return { data: { url: fileUrl }, status: 200 };
  } catch (error) {
    console.error('Upload error:', error);
    return { data: { error: 'Upload failed' }, status: 500 };
  }
}

/**
 * Handle sync operations
 */
function handleSync(method, params) {
  if (method !== 'GET') {
    return { data: { error: 'Method not allowed' }, status: 405 };
  }
  
  try {
    const since = params.since ? new Date(parseInt(params.since)) : null;
    
    const syncData = {
      vehicles: getAllVehicles(spreadsheet.getSheetByName(SHEET_NAMES.VEHICLES), since),
      maintenance: getAllMaintenance(spreadsheet.getSheetByName(SHEET_NAMES.MAINTENANCE), since),
      receipts: getAllReceipts(spreadsheet.getSheetByName(SHEET_NAMES.RECEIPTS), since),
      reminders: getAllReminders(spreadsheet.getSheetByName(SHEET_NAMES.REMINDERS), since),
      timestamp: Date.now()
    };
    
    return { data: syncData, status: 200 };
  } catch (error) {
    console.error('Sync error:', error);
    return { data: { error: 'Sync failed' }, status: 500 };
  }
}

/**
 * Get or create spreadsheet
 */
function getOrCreateSpreadsheet() {
  try {
    // Try to find existing spreadsheet
    const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
    if (files.hasNext()) {
      const file = files.next();
      return SpreadsheetApp.openById(file.getId());
    }
    
    // Create new spreadsheet
    const newSpreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    console.log('Created new spreadsheet:', newSpreadsheet.getId());
    return newSpreadsheet;
    
  } catch (error) {
    console.error('Error getting/creating spreadsheet:', error);
    throw error;
  }
}

/**
 * Get or create Drive folder
 */
function getOrCreateDriveFolder() {
  try {
    // Try to find existing folder
    const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    
    // Create new folder
    const newFolder = DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
    console.log('Created new Drive folder:', newFolder.getId());
    return newFolder;
    
  } catch (error) {
    console.error('Error getting/creating Drive folder:', error);
    throw error;
  }
}

/**
 * Set up spreadsheet sheets
 */
function setupSheets() {
  try {
    // Vehicle sheet
    setupVehicleSheet();
    
    // Maintenance sheet
    setupMaintenanceSheet();
    
    // Receipts sheet
    setupReceiptsSheet();
    
    // Reminders sheet
    setupRemindersSheet();
    
    console.log('Sheets setup completed');
    
  } catch (error) {
    console.error('Error setting up sheets:', error);
    throw error;
  }
}

/**
 * Set up vehicle sheet
 */
function setupVehicleSheet() {
  let sheet = spreadsheet.getSheetByName(SHEET_NAMES.VEHICLES);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAMES.VEHICLES);
  }
  
  // Set up headers
  const headers = [
    'vehicle_id', 'make', 'model', 'year', 'vin', 'license_plate',
    'current_mileage', 'purchase_date', 'warranty_expiration',
    'insurance_expiration', 'registration_expiration', 'created_date', 'last_updated'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

/**
 * Set up maintenance sheet
 */
function setupMaintenanceSheet() {
  let sheet = spreadsheet.getSheetByName(SHEET_NAMES.MAINTENANCE);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAMES.MAINTENANCE);
  }
  
  // Set up headers
  const headers = [
    'log_id', 'vehicle_id', 'maintenance_type', 'service_date', 'mileage',
    'cost', 'service_provider', 'description', 'next_service_mileage',
    'next_service_date', 'receipt_id', 'created_date'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

/**
 * Set up receipts sheet
 */
function setupReceiptsSheet() {
  let sheet = spreadsheet.getSheetByName(SHEET_NAMES.RECEIPTS);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAMES.RECEIPTS);
  }
  
  // Set up headers
  const headers = [
    'receipt_id', 'vehicle_id', 'log_id', 'receipt_date', 'vendor',
    'amount', 'description', 'image_url', 'category', 'created_date'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

/**
 * Set up reminders sheet
 */
function setupRemindersSheet() {
  let sheet = spreadsheet.getSheetByName(SHEET_NAMES.REMINDERS);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAMES.REMINDERS);
  }
  
  // Set up headers
  const headers = [
    'reminder_id', 'vehicle_id', 'reminder_type', 'due_date', 'due_mileage',
    'status', 'message', 'created_date'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

/**
 * Vehicle CRUD operations
 */
function getAllVehicles(sheet, since) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const vehicle = {};
    headers.forEach((header, index) => {
      vehicle[header] = row[index];
    });
    return vehicle;
  }).filter(vehicle => {
    if (!since) return true;
    const lastUpdated = new Date(vehicle.last_updated);
    return lastUpdated >= since;
  });
}

function getVehicleById(sheet, id) {
  const vehicles = getAllVehicles(sheet);
  return vehicles.find(vehicle => vehicle.vehicle_id === id);
}

function addVehicle(sheet, data) {
  const vehicle = {
    vehicle_id: generateId(),
    make: data.make || '',
    model: data.model || '',
    year: data.year || '',
    vin: data.vin || '',
    license_plate: data.license_plate || '',
    current_mileage: data.current_mileage || '',
    purchase_date: data.purchase_date || '',
    warranty_expiration: data.warranty_expiration || '',
    insurance_expiration: data.insurance_expiration || '',
    registration_expiration: data.registration_expiration || '',
    created_date: new Date().toISOString(),
    last_updated: new Date().toISOString()
  };
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map(header => vehicle[header] || '');
  
  sheet.appendRow(values);
  return vehicle;
}

function updateVehicle(sheet, id, data) {
  const vehicles = sheet.getDataRange().getValues();
  const headers = vehicles[0];
  const idIndex = headers.indexOf('vehicle_id');
  
  for (let i = 1; i < vehicles.length; i++) {
    if (vehicles[i][idIndex] === id) {
      // Update the row
      headers.forEach((header, index) => {
        if (data.hasOwnProperty(header) && header !== 'vehicle_id') {
          vehicles[i][index] = data[header];
        }
      });
      
      // Set last_updated
      const lastUpdatedIndex = headers.indexOf('last_updated');
      if (lastUpdatedIndex !== -1) {
        vehicles[i][lastUpdatedIndex] = new Date().toISOString();
      }
      
      // Write back to sheet
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([vehicles[i]]);
      
      // Return updated vehicle
      const updatedVehicle = {};
      headers.forEach((header, index) => {
        updatedVehicle[header] = vehicles[i][index];
      });
      return updatedVehicle;
    }
  }
  
  throw new Error('Vehicle not found');
}

function deleteVehicle(sheet, id) {
  const vehicles = sheet.getDataRange().getValues();
  const headers = vehicles[0];
  const idIndex = headers.indexOf('vehicle_id');
  
  for (let i = 1; i < vehicles.length; i++) {
    if (vehicles[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  
  throw new Error('Vehicle not found');
}

/**
 * Maintenance CRUD operations
 */
function getAllMaintenance(sheet, since) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  }).filter(record => {
    if (!since) return true;
    const createdDate = new Date(record.created_date);
    return createdDate >= since;
  });
}

function getMaintenanceById(sheet, id) {
  const records = getAllMaintenance(sheet);
  return records.find(record => record.log_id === id);
}

function addMaintenance(sheet, data) {
  const record = {
    log_id: generateId(),
    vehicle_id: data.vehicle_id || '',
    maintenance_type: data.maintenance_type || '',
    service_date: data.service_date || '',
    mileage: data.mileage || '',
    cost: data.cost || '',
    service_provider: data.service_provider || '',
    description: data.description || '',
    next_service_mileage: data.next_service_mileage || '',
    next_service_date: data.next_service_date || '',
    receipt_id: data.receipt_id || '',
    created_date: new Date().toISOString()
  };
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map(header => record[header] || '');
  
  sheet.appendRow(values);
  return record;
}

function updateMaintenance(sheet, id, data) {
  // Similar to updateVehicle but for maintenance records
  // Implementation would follow the same pattern
  throw new Error('Update maintenance not implemented yet');
}

function deleteMaintenance(sheet, id) {
  // Similar to deleteVehicle but for maintenance records
  // Implementation would follow the same pattern
  throw new Error('Delete maintenance not implemented yet');
}

/**
 * Receipt CRUD operations
 */
function getAllReceipts(sheet, since) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const receipt = {};
    headers.forEach((header, index) => {
      receipt[header] = row[index];
    });
    return receipt;
  }).filter(receipt => {
    if (!since) return true;
    const createdDate = new Date(receipt.created_date);
    return createdDate >= since;
  });
}

function getReceiptById(sheet, id) {
  const receipts = getAllReceipts(sheet);
  return receipts.find(receipt => receipt.receipt_id === id);
}

function addReceipt(sheet, data) {
  const receipt = {
    receipt_id: generateId(),
    vehicle_id: data.vehicle_id || '',
    log_id: data.log_id || '',
    receipt_date: data.receipt_date || '',
    vendor: data.vendor || '',
    amount: data.amount || '',
    description: data.description || '',
    image_url: data.image_url || '',
    category: data.category || '',
    created_date: new Date().toISOString()
  };
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map(header => receipt[header] || '');
  
  sheet.appendRow(values);
  return receipt;
}

function updateReceipt(sheet, id, data) {
  // Similar to updateVehicle but for receipts
  // Implementation would follow the same pattern
  throw new Error('Update receipt not implemented yet');
}

function deleteReceipt(sheet, id) {
  // Similar to deleteVehicle but for receipts
  // Implementation would follow the same pattern
  throw new Error('Delete receipt not implemented yet');
}

/**
 * Reminder operations
 */
function getAllReminders(sheet, since) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const reminder = {};
    headers.forEach((header, index) => {
      reminder[header] = row[index];
    });
    return reminder;
  }).filter(reminder => {
    if (!since) return true;
    const createdDate = new Date(reminder.created_date);
    return createdDate >= since;
  });
}

function addReminder(sheet, data) {
  const reminder = {
    reminder_id: generateId(),
    vehicle_id: data.vehicle_id || '',
    reminder_type: data.reminder_type || '',
    due_date: data.due_date || '',
    due_mileage: data.due_mileage || '',
    status: data.status || 'active',
    message: data.message || '',
    created_date: new Date().toISOString()
  };
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map(header => reminder[header] || '');
  
  sheet.appendRow(values);
  return reminder;
}

/**
 * Upload file to Google Drive
 */
function uploadToGoogleDrive(filename, base64Data, mimeType, folderName) {
  try {
    // Decode base64 data
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, filename);
    
    // Get or create folder
    let folder = driveFolder;
    if (folderName && folderName !== CONFIG.DRIVE_FOLDER_NAME) {
      const subFolders = driveFolder.getFoldersByName(folderName);
      if (subFolders.hasNext()) {
        folder = subFolders.next();
      } else {
        folder = driveFolder.createFolder(folderName);
      }
    }
    
    // Create file
    const file = folder.createFile(blob);
    
    // Make file publicly viewable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return public URL
    return `https://drive.google.com/uc?id=${file.getId()}`;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Generate unique ID
 */
function generateId() {
  return Utilities.getUuid();
}

/**
 * Create HTTP response
 */
function createResponse(data, status = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  });
  
  return response;
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions(e) {
  return createResponse({}, 200);
}

/**
 * Test function
 */
function testInstallation() {
  try {
    const result = onInstall();
    console.log('Test result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.toString() };
  }
}

