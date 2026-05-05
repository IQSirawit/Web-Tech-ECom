/**
 * BOOKLY CART SYSTEM
 */

function showErrorToast(message) {
    const existingToast = document.getElementById('cartErrorToast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'cartErrorToast';
    toast.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-4 shadow';
    toast.style.zIndex = 1080;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

// 1. Initialize the cart object from localStorage immediately
// This prevents the cart from "resetting" on page refresh
const savedItems = JSON.parse(localStorage.getItem('cart_items')) || {};
const cart = {
    items: savedItems,
    totalItems: Object.values(savedItems).reduce((acc, item) => acc + Number(item.quantity || 0), 0)
};

function saveCart() {
    cart.totalItems = Object.values(cart.items).reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    localStorage.setItem('cart_items', JSON.stringify(cart.items));
}

function decrementCartItem(id) {
    if (!cart.items[id]) return;

    cart.items[id].quantity = Number(cart.items[id].quantity || 0) - 1;

    if (cart.items[id].quantity <= 0) {
        delete cart.items[id];
    }

    saveCart();
    renderCart();
}

function removeCartItem(id) {
    if (!cart.items[id]) return;

    delete cart.items[id];
    saveCart();
    renderCart();
}

function clearCart() {
    cart.items = {};
    saveCart();
    renderCart();
}

/**
 * Handler function to update the cart object
 */
function handleAddToCart(id, price, title) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        showErrorToast('Please log in first to add items to your cart.');
        return;
    }

    if (cart.items[id]) {
        cart.items[id].quantity = Number(cart.items[id].quantity || 0) + 1;
    } else {
        cart.items[id] = {
            id: id,
            name: title,
            price: price,
            quantity: 1
        };
    }

    saveCart();
    renderCart();
}

/**
 * Event Listener
 */
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    
    // Initial render on page load to show existing items
    renderCart();

    if (productGrid) {
        productGrid.addEventListener('click', function(event) {
            const addButton = event.target.closest('button[title="Add to Cart"]');

            if (addButton) {
                event.preventDefault();
                const productID = addButton.getAttribute('data-id');
                const productPrice = addButton.getAttribute('data-price');
                const productTitle = addButton.getAttribute('data-title');

                handleAddToCart(productID, productPrice, productTitle);
            }
        });
    }

    const cartContainer = document.getElementById('cart-list-container');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    if (cartContainer) {
    cartContainer.addEventListener('click', function(event) {
        // This is the magic line that keeps the dropdown open
        event.stopPropagation(); 

        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const action = actionButton.getAttribute('data-action');
        const productID = actionButton.getAttribute('data-id');

        if (!productID) return;

        if (action === 'decrement') {
            decrementCartItem(productID);
        }

        if (action === 'remove-item') {
            removeCartItem(productID);
        }
    });
}

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            clearCart();
        });
    }
});

function renderCart() {
    const cartContainer = document.getElementById('cart-list-container');
    const badge = document.getElementById('cart-badge'); 
    const cartTotalPrice = document.getElementById('cart-total-price');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const cartCountHeader = document.querySelectorAll('.cart-dropdown .fs-6');
    
    if (!cartContainer) return;

    let totalHTML = '';
    let grandTotal = 0;
    const itemsArray = Object.values(cart.items);

    if (itemsArray.length === 0) {
        totalHTML = `
          <li class="list-group-item bg-transparent text-center py-4">
            <span class="text-muted">Your cart is empty.</span>
          </li>`;
    } else {
        itemsArray.forEach(item => {
            const quantity = Number(item.quantity || 0);
            const priceNum = typeof item.price === 'string'
                ? parseFloat(item.price.replace('$', ''))
                : Number(item.price || 0);

            grandTotal += priceNum * quantity;

            // Change the button classes in the template literal inside renderCart()
            totalHTML += `
            <li class="list-group-item bg-transparent d-flex justify-content-between align-items-start lh-sm">
                <div class="me-3">
                <h5 class="mb-1">${item.name}</h5>
                <small class="text-dark fw-semibold">Quantity: ${quantity}</small>
                <div class="mt-2 d-flex gap-2">
                    <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" style="font-size: 0.75rem;" data-action="decrement" data-id="${item.id}">-1</button>
                    <button type="button" class="btn btn-xs btn-outline-danger py-0 px-2" style="font-size: 0.75rem;" data-action="remove-item" data-id="${item.id}">Remove</button>
                </div>
                </div>
                <span class="text-primary">$${(priceNum * quantity).toFixed(2)}</span>
            </li>`;
        });

        totalHTML += `
          <li class="list-group-item d-flex justify-content-between">
            <span>Total (USD)</span>
            <strong id="cart-total-price">$${grandTotal.toFixed(2)}</strong>
          </li>`;
    }

    cartContainer.innerHTML = totalHTML;

    if (badge) badge.textContent = cart.totalItems;
    if (cartTotalPrice) cartTotalPrice.textContent = `$${grandTotal.toFixed(2)}`;
    if (clearCartBtn) clearCartBtn.disabled = itemsArray.length === 0;
    
    cartCountHeader.forEach(el => {
        el.textContent = `(${cart.totalItems.toString().padStart(2, '0')})`;
    });
}

