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

function updateLoginModalState() {
    const token = localStorage.getItem('token');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const logoutPlaceholder = document.getElementById('logoutPlaceholder');

    if (token) {
        loginFormContainer.classList.add('d-none');
        logoutPlaceholder.classList.remove('d-none');
    } else {
        loginFormContainer.classList.remove('d-none');
        logoutPlaceholder.classList.add('d-none');
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    showSuccessToast('Logged out successfully.');
    updateLoginModalState();
}

async function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
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
            alert(`Error: ${data.message || 'Unauthorized access'}`);
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('Server is currently unreachable. Please try again later.');
    }
}

const authModal = document.getElementById('exampleModal');
if (authModal) {
    authModal.addEventListener('show.bs.modal', updateLoginModalState);
}

window.addEventListener('DOMContentLoaded', updateLoginModalState);