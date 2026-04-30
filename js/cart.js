/**
 * BOOKLY CART SYSTEM
 */

// 1. Initialize the cart object from localStorage immediately
// This prevents the cart from "resetting" on page refresh
const savedItems = JSON.parse(localStorage.getItem('cart_items')) || {};
const cart = {
    items: savedItems,
    totalItems: Object.values(savedItems).reduce((acc, item) => acc + item.quantity, 0)
};

/**
 * Handler function to update the cart object
 */
function handleAddToCart(id, price, title) {
    if (cart.items[id]) {
        cart.items[id].quantity += 1;
    } else {
        cart.items[id] = {
            id: id,
            name: title,
            price: price,
            quantity: 1
        };
    }
    
    // Calculate new total count
    cart.totalItems = Object.values(cart.items).reduce((acc, item) => acc + item.quantity, 0);

    // Save the entire items object to localStorage
    localStorage.setItem('cart_items', JSON.stringify(cart.items));

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
});

function renderCart() {
    const cartContainer = document.getElementById('cart-list-container');
    const badge = document.getElementById('cart-badge'); 
    const cartCountHeader = document.querySelectorAll('.cart-dropdown .fs-6');
    
    if (!cartContainer) return;

    let totalHTML = '';
    let grandTotal = 0;

    // Use the global cart object (which is now synced with localStorage)
    const itemsArray = Object.values(cart.items);

    itemsArray.forEach(item => {
        // Handle price strings like "$20.00" or "20.00"
        const priceNum = typeof item.price === 'string' 
            ? parseFloat(item.price.replace('$', '')) 
            : item.price;
            
        grandTotal += priceNum * item.quantity;

        totalHTML += `
          <li class="list-group-item bg-transparent d-flex justify-content-between lh-sm">
            <div>
              <h5 class="mb-0">${item.name}</h5>
              <small class="text-muted">Quantity: ${item.quantity}</small>
            </div>
            <span class="text-primary">${item.price}</span>
          </li>`;
    });

    // 1. Render the list
    cartContainer.innerHTML = totalHTML;

    // 2. Render the Total Row
    cartContainer.innerHTML += `
        <li class="list-group-item d-flex justify-content-between">
            <span>Total (USD)</span>
            <strong>$${grandTotal.toFixed(2)}</strong>
        </li>`;

    // 3. Update the Badge and Header
    if (badge) badge.textContent = cart.totalItems; 
    
    cartCountHeader.forEach(el => {
        el.textContent = `(${cart.totalItems.toString().padStart(2, '0')})`;
    });
}