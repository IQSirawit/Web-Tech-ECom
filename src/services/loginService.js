/**
 * loginService.js - Frontend login service
 * Handles user authentication and modal state management
 */

// Toast notification helpers
function showSuccessToast(message) {
    const existingToast = document.getElementById('loginSuccessToast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'loginSuccessToast';
    toast.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-4 shadow';
    toast.style.zIndex = 1080;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

function showErrorToast(message) {
    const existingToast = document.getElementById('loginErrorToast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'loginErrorToast';
    toast.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-4 shadow';
    toast.style.zIndex = 1080;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

// Update UI based on login state
function updateLoginModalState() {
    const token = localStorage.getItem('token');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const logoutPlaceholder = document.getElementById('logoutPlaceholder');
    const navTabs = document.getElementById('nav-tab');

    if (token) {
        loginFormContainer.classList.add('d-none');
        logoutPlaceholder.classList.remove('d-none');
        if (navTabs) navTabs.classList.add('d-none');
    } else {
        loginFormContainer.classList.remove('d-none');
        logoutPlaceholder.classList.add('d-none');
        if (navTabs) navTabs.classList.remove('d-none');
    }
}

// Logout handler
function logoutUser() {
    localStorage.removeItem('token');
    showSuccessToast('Logged out successfully.');
    updateLoginModalState();
}

// Login handler
async function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${(typeof process !== 'undefined' && process.env && process.env.BASE_URL) || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showSuccessToast('Login successful! Welcome back.');

            const loginModalElement = document.getElementById('exampleModal');
            const modalInstance = bootstrap.Modal.getInstance(loginModalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            updateLoginModalState();
        } else {
            showErrorToast(data.message || 'Invalid email or password.');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showErrorToast('Server is currently unreachable. Please try again later.');
    }
}

// Initialize on page load
if (typeof document !== 'undefined') {
    const authModal = document.getElementById('exampleModal');
    if (authModal) {
        authModal.addEventListener('show.bs.modal', updateLoginModalState);
    }

    window.addEventListener('DOMContentLoaded', updateLoginModalState);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loginUser,
        logoutUser,
        updateLoginModalState,
        showSuccessToast,
        showErrorToast
    };
}
