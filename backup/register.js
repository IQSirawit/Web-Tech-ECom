/* ============================================================
   register.js — Handles all registration-related frontend logic
   Depends on: showSuccessToast, showErrorToast, updateLoginModalState
               (defined in login.js, loaded before this file)
   ============================================================ */

/* ──────────────────────────────────────────
   Live password requirement checker
   Called via oninput="validatePasswordLive(this.value)" on the
   password field in index.html
────────────────────────────────────────── */
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

/* ──────────────────────────────────────────
   Register form submit handler
   Called via onsubmit="registerUser(event)" on #registerForm
────────────────────────────────────────── */
async function registerUser(event) {
    event.preventDefault();

    const name     = document.getElementById('registerName').value.trim();
    const email    = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // ── Frontend validation ──────────────────────────
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

    // ── Backend call ────────────────────────────────
    try {
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Auto-login: store the JWT returned by the server
            localStorage.setItem('token', data.token);
            showSuccessToast(`Welcome, ${name}! Your account has been created.`);

            // Close the modal
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
