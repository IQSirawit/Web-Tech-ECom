async function loginUser(event) {
    event.preventDefault();
    
    // Get values from the form
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) { // Status 200
            // 1. Save token to localStorage
            localStorage.setItem('token', data.token);

            // 2. Pop up success message
            alert("Login Successful! Welcome back.");

            // 3. Close the Bootstrap Modal
            const loginModalElement = document.getElementById('exampleModal');
            const modalInstance = bootstrap.Modal.getInstance(loginModalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Optional: Redirect or refresh UI
            // window.location.reload(); 
        } else {
            // Status 401 or other errors
            alert(`Error: ${data.message || 'Unauthorized access'}`);
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('Server is currently unreachable. Please try again later.');
    }
}