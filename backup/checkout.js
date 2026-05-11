async function getAvailableProducts() {
    if (window.allProducts && window.allProducts.length) {
        return window.allProducts;
    }

    try {
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/products`);
        if (!response.ok) {
            throw new Error('Unable to fetch products');
        }
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        window.allProducts = products;
        return products;
    } catch (error) {
        console.error('Checkout product load error:', error);
        return [];
    }
}

async function handleCheckout() {
    if (cart.totalItems === 0) {
        showErrorToast('Your cart is empty. Add some items before checking out.');
        return;
    }

    const products = await getAvailableProducts();
    const productMap = {};

    // Ensure the map keys are consistently Numbers
    products.forEach(p => {
        productMap[Number(p.id)] = p;
    });

    const stockErrors = [];
    for (const [id, item] of Object.entries(cart.items)) {
        // Convert the cart item ID to a Number to match the map
        const product = productMap[Number(id)];

        if (!product) {
            stockErrors.push(`Product ${id} does not exist.`);
        } else if (item.quantity > Number(product.quantity || 0)) {
            stockErrors.push(`Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${item.quantity}.`);
        }
    }

    if (stockErrors.length > 0) {
        showErrorToast(stockErrors.join('\n'));
        return;
    }

    const dropdownToggle = document.querySelector('.cart-dropdown .dropdown-toggle');
    if (dropdownToggle) {
        const instance = bootstrap.Dropdown.getInstance(dropdownToggle);
        if (instance) {
            instance.hide();
        }
    }

    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    checkoutModal.show();
}

async function processCheckout() {
    const email = document.getElementById('checkoutEmail').value.trim();
    const card = document.getElementById('checkoutCard').value.trim();

    try {
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send cart.items as an object (keyed by product ID) so the backend
            // can use Object.entries(cart) and get real product IDs as keys.
            // Sending Object.values() turns it into an array whose keys become
            // "0","1","2" (array indices), causing "Product X does not exist."
            body: JSON.stringify({
                cart: cart.items,
                email: email,
                card: card
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccessToast(data.message || 'Checkout successful!');
            clearCart();
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (modal) modal.hide();
        } else {
            const errors = Array.isArray(data.errors) ? data.errors : [data.message || 'Checkout failed.'];
            showErrorToast(errors.join('\n'));
        }
    } catch (error) {
        console.error('Checkout submit error:', error);
        showErrorToast('An error occurred during checkout. Please try again later.');
    }
}

function showSuccessToast(message) {
    const existingToast = document.getElementById('cartSuccessToast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'cartSuccessToast';
    toast.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-4 shadow';
    toast.style.zIndex = 1080;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            handleCheckout();
        });
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (event) {
            event.preventDefault();
            processCheckout();
        });
    }
});