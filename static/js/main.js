// Main JavaScript for Attendance Management System

// Global variables
let currentTheme = 'light';
let notifications = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupGlobalEventListeners();
    checkForUpdates();
});

// Initialize application
function initializeApp() {
    console.log('Attendance Management System initialized');

    // Set current date as default for date inputs
    setDefaultDates();

    // Initialize tooltips
    initializeTooltips();

    // Setup auto-save for forms
    setupAutoSave();

    // Initialize keyboard shortcuts
    setupKeyboardShortcuts();
}

// Set default dates for date inputs
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');

    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Handle form submissions
    document.addEventListener('submit', handleFormSubmission);

    // Handle dynamic content loading
    document.addEventListener('click', handleDynamicClicks);

    // Handle keyboard events
    document.addEventListener('keydown', handleKeyboardEvents);

    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
}

// Handle form submissions with loading states
function handleFormSubmission(event) {
    const form = event.target;
    if (form.tagName === 'FORM') {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Processing...';
            submitBtn.disabled = true;

            // Re-enable button after 3 seconds (fallback)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    }
}

// Handle dynamic clicks
function handleDynamicClicks(event) {
    const target = event.target;

    // Handle quick action buttons
    if (target.closest('.btn[data-action]')) {
        const action = target.closest('.btn').dataset.action;
        handleQuickAction(action);
    }

    // Handle table row clicks
    if (target.closest('table tbody tr')) {
        handleTableRowClick(target.closest('tr'));
    }
}

// Handle keyboard events
function handleKeyboardEvents(event) {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
            activeForm.requestSubmit();
        }
    }

    // Escape key to close modals
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            bootstrap.Modal.getInstance(openModal).hide();
        }
    }
}

// Handle window resize
function handleWindowResize() {
    // Adjust chart sizes if charts exist
    if (window.Chart && Chart.instances) {
        Chart.instances.forEach(chart => {
            chart.resize();
        });
    }
}

// Setup auto-save functionality
function setupAutoSave() {
    const forms = document.querySelectorAll('form[data-autosave]');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                saveFormData(form);
            });
        });
    });
}

// Save form data to localStorage
function saveFormData(form) {
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    const formId = form.id || form.getAttribute('data-form-id');
    if (formId) {
        localStorage.setItem(`form_${formId}`, JSON.stringify(data));
        showNotification('Form data saved automatically', 'info', 2000);
    }
}

// Load saved form data
function loadFormData(formId) {
    const savedData = localStorage.getItem(`form_${formId}`);
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.getElementById(formId);

        if (form) {
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            });
        }
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    const shortcuts = {
        'Alt+H': () => window.location.href = '/',
        'Alt+R': () => window.location.href = '/register',
        'Alt+A': () => window.location.href = '/attendance',
        'Alt+T': () => window.location.href = '/reports'
    };

    document.addEventListener('keydown', (event) => {
        const key = `${event.altKey ? 'Alt+' : ''}${event.ctrlKey ? 'Ctrl+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.key}`;

        if (shortcuts[key]) {
            event.preventDefault();
            shortcuts[key]();
        }
    });
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remove after duration
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, duration);
}

// Handle quick actions
function handleQuickAction(action) {
    switch (action) {
        case 'backup':
            showNotification('Creating backup...', 'info');
            // Implement backup functionality
            break;
        case 'export':
            showNotification('Exporting data...', 'info');
            // Implement export functionality
            break;
        case 'import':
            showNotification('Import functionality coming soon', 'warning');
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// Handle table row clicks
function handleTableRowClick(row) {
    // Add visual feedback
    row.style.backgroundColor = '#e3f2fd';
    setTimeout(() => {
        row.style.backgroundColor = '';
    }, 200);
}

// Utility functions
const Utils = {
    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Calculate percentage
    calculatePercentage: (present, total) => {
        if (total === 0) return 0;
        return Math.round((present / total) * 100);
    },

    // Validate form
    validateForm: (form) => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format number with commas
    numberWithCommas: (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

// Check for updates (placeholder)
function checkForUpdates() {
    // This would typically check for system updates
    console.log('Checking for updates...');
}

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData = {}) {
    console.log('Event tracked:', eventName, eventData);
    // Implement analytics tracking here
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
    showNotification('An error occurred. Please refresh the page if problems persist.', 'danger');
});

// Service worker registration (for offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when service worker is implemented
        // navigator.serviceWorker.register('/sw.js')
        //     .then(function(registration) {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(function(registrationError) {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

// Export utilities for use in other scripts
window.AttendanceSystem = {
    Utils,
    showNotification,
    trackEvent
};