/**
 * productLoadService.js - Frontend product loading and rendering service
 * Merged from loadProducts.js
 * Handles AJAX requests, product filtering, and UI rendering
 */

let allProducts = [];

if (typeof window !== 'undefined') {
    window.allProducts = allProducts;
}

function escapeHtml(unsafe) {
    if (!unsafe || typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Main controller function - fetches products from API and renders them
 */
async function requestProducts(
    url = `${(typeof process !== 'undefined' && process.env && process.env.BASE_URL) || 'http://localhost:3000'}/api/products`,
    containerId = 'product-grid'
) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-5">
            Loading products from Server...
        </div>
    `;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        allProducts = Array.isArray(data) ? data : (data.products || []);
        if (typeof window !== 'undefined') {
            window.allProducts = allProducts;
        }

        renderUI(allProducts, container);
        initializeSearch();

    } catch (error) {
        console.error("Backend connection failed:", error);
        container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger text-center">
                Unable to connect to Bookly Server. Ensure your backend is running at ${url}.
            </div>
        </div>
        `;
    }
}

/**
 * Renders product cards to the DOM
 */
function renderUI(products, container) {
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = `
<div class="col-12 text-center py-5">
    <h4>No Product Match</h4>
    <p>Try another title or category.</p>
</div>
`;
        return;
    }

    products.forEach(product => {
        container.insertAdjacentHTML(
            'beforeend',
            createProductCard(product)
        );
    });

    initializeTooltips();
}

/**
 * Filters products by title and category
 */
function filterProducts(searchText = '', category = '') {
    const trimmedText = searchText.trim();

    const filteredProducts = allProducts.filter(product => {
        const titleMatch =
            trimmedText === '' ||
            product.title.trim().includes(trimmedText);

        const categoryMatch =
            category === '' ||
            product.category === category;

        return titleMatch && categoryMatch;
    });

    const container = document.getElementById('product-grid');
    renderUI(filteredProducts, container);
}

/**
 * Initialize search and category filters
 */
function initializeSearch() {
    const searchInput = document.querySelector('#search-form');
    const categoryLinks = document.querySelectorAll('.cat-list a');

    let activeCategory = '';

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterProducts(this.value, activeCategory);
        });

        const form = searchInput.closest('form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                filterProducts(searchInput.value, activeCategory);
            });
        }
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            activeCategory =
                this.textContent.trim() === 'All'
                    ? ''
                    : this.textContent.trim();

            filterProducts(
                searchInput ? searchInput.value : '',
                activeCategory
            );
        });
    });
}

/**
 * Creates a single product card HTML
 */
function createProductCard(product) {
    const quantity = Number(product.quantity || 0);
    const isOutOfStock = quantity === 0;
    const stockLabel = isOutOfStock
        ? `<span class="badge bg-secondary">Out of stock</span>`
        : `<span class="badge bg-success">In stock: ${quantity}</span>`;

    return `
<div class="col-lg-3 col-md-4 col-sm-6">

<div class="card position-relative p-4 border rounded-3 h-100 ${isOutOfStock ? 'opacity-50' : ''}">

${product.rating >= 5 ? `
<div class="position-absolute">
<p class="bg-primary py-1 px-3 fs-6 text-white rounded-2">
Best Seller
</p>
</div>
` : ''}

<img
src="${escapeHtml(product.image)}"
class="img-fluid shadow-sm"
alt="${escapeHtml(product.title)}"
>

<h6 class="mt-4 mb-0 fw-bold">
<a href="single-product.html">
${escapeHtml(product.title)}
</a>
</h6>

<div class="review-content d-flex">

<p class="my-2 me-2 fs-6 text-black-50">
${escapeHtml(product.author)}
</p>

<div class="rating text-warning d-flex align-items-center">
${generateRatingStars(product.rating)}
</div>

</div>

<span class="price text-primary fw-bold mb-2 fs-5">
${escapeHtml(product.price)}
</span>

${stockLabel}

<div class="card-concern position-absolute start-0 end-0 d-flex gap-2">

<button 
  type="button" 
  class="btn btn-dark" 
  title="Add to Cart"
  data-id="${product.id}" 
  data-price="${escapeHtml(product.price)}"
  data-title="${escapeHtml(product.title)}"
  ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}>
<svg class="cart">
<use xlink:href="#cart"></use>
</svg>
</button>

<a href="#" class="btn btn-dark${isOutOfStock ? ' disabled' : ''}">
<span>
<svg class="wishlist">
<use xlink:href="#heart"></use>
</svg>
</span>
</a>

</div>

</div>
</div>
`;
}

/**
 * Generates star rating HTML
 */
function generateRatingStars(rating) {
    let stars = '';

    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += `
        <svg class="star star-fill">
        <use xlink:href="#star-fill"></use>
        </svg>
        `;
        } else {
            stars += `
        <svg class="star star-empty">
        <use xlink:href="#star-empty"></use>
        </svg>
        `;
        }
    }

    return stars;
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const triggerList =
        [].slice.call(
            document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            )
        );

    triggerList.map(
        tooltipTriggerEl =>
            new bootstrap.Tooltip(
                tooltipTriggerEl
            )
    );
}

// Initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        requestProducts();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        requestProducts,
        renderUI,
        filterProducts,
        initializeSearch,
        createProductCard,
        generateRatingStars,
        initializeTooltips,
        allProducts
    };
}
