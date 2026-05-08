/**
 * registerService.js - Frontend registration service
 * Handles user registration and password validation
 * Dependencies: loginService (showSuccessToast, showErrorToast, updateLoginModalState)
 */

// Live password requirement checker
function validatePasswordLive(value) {
    const rules = [
        { id: 'req-length',  test: v => v.length >= 8 },
        { id: 'req-upper',   test: v => /[A-Z]/.test(v) },
        { id: 'req-special', test: v => /[^A-Za-z0-9]/.test(v) }
    ];

    const labels = {
        'req-length':  ['✓ At least 8 characters',         '✗ At least 8 characters'],
        'req-upper':   ['✓ At least one uppercase letter',  '✗ At least one uppercase letter'],
        'req-special': ['✓ At least one special character', '✗ At least one special character']
    };

    rules.forEach(({ id, test }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const passed = test(value);
        el.textContent = passed ? labels[id][0] : labels[id][1];
        el.className   = passed ? 'text-success' : 'text-danger';
    });
}

// Register form submit handler
async function registerUser(event) {
    event.preventDefault();

    const name     = document.getElementById('registerName').value.trim();
    const email    = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // Frontend validation
    if (!name) {
        showErrorToast('Please enter your full name.');
        return;
    }
    if (password.length < 8) {
        showErrorToast('Password must be at least 8 characters.');
        return;
    }
    if (!/[A-Z]/.test(password)) {
        showErrorToast('Password must contain at least one uppercase letter.');
        return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        showErrorToast('Password must contain at least one special character.');
        return;
    }

    // Backend API call
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showSuccessToast(`Welcome, ${name}! Your account has been created.`);

            const loginModalElement = document.getElementById('exampleModal');
            const modalInstance = bootstrap.Modal.getInstance(loginModalElement);
            if (modalInstance) modalInstance.hide();

            updateLoginModalState();
        } else {
            showErrorToast(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Register Error:', error);
        showErrorToast('Server is currently unreachable. Please try again later.');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validatePasswordLive,
        registerUser
    };
}
