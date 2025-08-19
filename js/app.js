/*
Name: app.js
Version: 1.0.0
Purpose: Main application logic and core functionality for vehicle maintenance manager
Path: /home/ubuntu/vehicle_maintenance_app/js/app.js
Copyright: 2025 Superior Networks LLC

Key Features:
- Application initialization and setup
- Navigation menu handling
- Mobile menu toggle functionality
- Loading overlay management
- Toast notification system
- Local storage management
- Error handling and logging
- Utility functions for common operations

Input: 
- User interactions (clicks, form submissions)
- DOM events (load, resize, etc.)
- Data from other modules

Output:
- DOM manipulations
- Event handlers
- Toast notifications
- Loading states
- Navigation updates

Dependencies:
- Modern browser with ES6+ support
- DOM API
- Local Storage API
- google_sheets.js (Google Sheets integration)

Change Log:
2025-08-19 v1.0.0 - Initial release (Dwain Henderson Jr)
*/

// Application Configuration
const APP_CONFIG = {
    name: 'Vehicle Maintenance Manager',
    version: '1.0.0',
    author: 'Dwain Henderson Jr.',
    company: 'Superior Networks LLC',
    storagePrefix: 'vm_app_',
    toastDuration: 5000,
    loadingDelay: 300
};

// Application State
let appState = {
    currentPage: '',
    isLoading: false,
    vehicles: [],
    maintenanceRecords: [],
    receipts: [],
    reminders: []
};

// DOM Elements Cache
const elements = {
    menuToggle: null,
    navMenu: null,
    loadingOverlay: null,
    toastContainer: null
};

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showToast('Failed to initialize application', 'error');
    }
});

/**
 * Initialize the application
 */
function initializeApp() {
    console.log(`Initializing ${APP_CONFIG.name} v${APP_CONFIG.version}`);
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize navigation
    initializeNavigation();
    
    // Load initial data
    loadInitialData();
    
    // Set up periodic data sync
    setupDataSync();
    
    console.log('Application initialized successfully');
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    elements.menuToggle = document.getElementById('menuToggle');
    elements.navMenu = document.getElementById('navMenu');
    elements.loadingOverlay = document.getElementById('loadingOverlay');
    elements.toastContainer = document.getElementById('toastContainer');
    
    // Create toast container if it doesn't exist
    if (!elements.toastContainer) {
        elements.toastContainer = document.createElement('div');
        elements.toastContainer.id = 'toastContainer';
        elements.toastContainer.className = 'toast-container';
        document.body.appendChild(elements.toastContainer);
    }
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Mobile menu toggle
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (elements.navMenu && elements.navMenu.classList.contains('active')) {
            if (!elements.navMenu.contains(event.target) && !elements.menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
    
    // Handle online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Initialize navigation system
 */
function initializeNavigation() {
    // Determine current page
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    appState.currentPage = page;
    
    // Update active navigation link
    updateActiveNavLink(page);
}

/**
 * Update active navigation link
 */
function updateActiveNavLink(currentPage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    if (elements.navMenu) {
        elements.navMenu.classList.toggle('active');
        elements.menuToggle.classList.toggle('active');
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    if (elements.navMenu) {
        elements.navMenu.classList.remove('active');
        elements.menuToggle.classList.remove('active');
    }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

/**
 * Handle online status
 */
function handleOnlineStatus() {
    showToast('Connection restored', 'success');
    // Sync data when back online
    if (typeof syncData === 'function') {
        syncData();
    }
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
    showToast('You are offline. Some features may not work.', 'warning');
}

/**
 * Handle page visibility changes
 */
function handleVisibilityChange() {
    if (!document.hidden) {
        // Page became visible, refresh data if needed
        const lastSync = getFromStorage('lastSync');
        const now = Date.now();
        if (!lastSync || (now - lastSync) > 300000) { // 5 minutes
            if (typeof syncData === 'function') {
                syncData();
            }
        }
    }
}

/**
 * Load initial data
 */
async function loadInitialData() {
    try {
        showLoading('Loading data...');
        
        // Load data from local storage first
        loadFromLocalStorage();
        
        // Then sync with Google Sheets if available
        if (typeof syncData === 'function') {
            await syncData();
        }
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Load data from local storage
 */
function loadFromLocalStorage() {
    try {
        appState.vehicles = getFromStorage('vehicles') || [];
        appState.maintenanceRecords = getFromStorage('maintenanceRecords') || [];
        appState.receipts = getFromStorage('receipts') || [];
        appState.reminders = getFromStorage('reminders') || [];
        
        console.log('Data loaded from local storage');
    } catch (error) {
        console.error('Failed to load from local storage:', error);
    }
}

/**
 * Set up periodic data synchronization
 */
function setupDataSync() {
    // Sync every 10 minutes when page is visible
    setInterval(() => {
        if (!document.hidden && typeof syncData === 'function') {
            syncData();
        }
    }, 600000); // 10 minutes
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
    if (elements.loadingOverlay) {
        const messageElement = elements.loadingOverlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
        elements.loadingOverlay.classList.add('active');
        appState.isLoading = true;
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    if (elements.loadingOverlay) {
        setTimeout(() => {
            elements.loadingOverlay.classList.remove('active');
            appState.isLoading = false;
        }, APP_CONFIG.loadingDelay);
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = APP_CONFIG.toastDuration) {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="closeToast(this)">&times;</button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-hide toast
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, duration);
}

/**
 * Get icon for toast type
 */
function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

/**
 * Close toast notification
 */
function closeToast(closeButton) {
    const toast = closeButton.closest('.toast');
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

/**
 * Save data to local storage
 */
function saveToStorage(key, data) {
    try {
        const storageKey = APP_CONFIG.storagePrefix + key;
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to storage:', error);
        return false;
    }
}

/**
 * Get data from local storage
 */
function getFromStorage(key) {
    try {
        const storageKey = APP_CONFIG.storagePrefix + key;
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get from storage:', error);
        return null;
    }
}

/**
 * Remove data from local storage
 */
function removeFromStorage(key) {
    try {
        const storageKey = APP_CONFIG.storagePrefix + key;
        localStorage.removeItem(storageKey);
        return true;
    } catch (error) {
        console.error('Failed to remove from storage:', error);
        return false;
    }
}

/**
 * Clear all application data from local storage
 */
function clearAllStorage() {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(APP_CONFIG.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Failed to clear storage:', error);
        return false;
    }
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date for display
 */
function formatDate(date, options = {}) {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format number with commas
 */
function formatNumber(number) {
    if (typeof number !== 'number') return '0';
    return new Intl.NumberFormat('en-US').format(number);
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validate email address
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Handle form validation
 */
function validateForm(form) {
    const errors = [];
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push(`${field.name || field.id} is required`);
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Handle image file upload and preview
 */
function handleImageUpload(input, previewContainer) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB', 'error');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        previewContainer.classList.add('active');
    };
    reader.readAsDataURL(file);
}

/**
 * Export data to CSV
 */
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/**
 * Print current page
 */
function printPage() {
    window.print();
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

// Export functions for use in other modules
window.APP = {
    config: APP_CONFIG,
    state: appState,
    showLoading,
    hideLoading,
    showToast,
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    generateId,
    formatDate,
    formatCurrency,
    formatNumber,
    debounce,
    isValidEmail,
    isValidPhone,
    sanitizeHTML,
    validateForm,
    handleImageUpload,
    exportToCSV,
    printPage
};

