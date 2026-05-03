/*
========================================================
BOOKLY PRODUCT LOADER
Demonstrates:
1. AJAX request using fetch()
2. Loading JSON product data
3. Rendering data dynamically into HTML

DATA FLOW:

Browser loads page
↓
DOMContentLoaded fires
↓
requestProducts() starts
↓
fetch() requests products.json (AJAX request)
↓
JSON response returned from server
↓
Convert response into JavaScript objects
↓
renderUI(products) generates product cards
↓
Products appear in webpage
========================================================
*/

let allProducts = [];

/*
--------------------------------------------------------
Main Controller Function
Starts the product loading process
--------------------------------------------------------
*/
async function requestProducts(
    url = 'http://localhost:3000/api/products',
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
        // AJAX REQUEST TO YOUR NEW API
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        /*
        Because your productService.js returns 'parsedData.products',
        'data' here is already the Array of products.
        */
        const data = await response.json();

        // Check if data is an array directly, or fallback to an empty array
        allProducts = Array.isArray(data) ? data : (data.products || []);

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

/*
--------------------------------------------------------
renderUI()

Receives product data
Loops through each product
Builds HTML cards
Injects cards into page
--------------------------------------------------------
*/
function renderUI(products, container) {

    /*
    Clear previous content
    */
    container.innerHTML = '';



    /*
    If no products matched
    show fallback message
    */
    if (products.length === 0) {

        container.innerHTML = `
<div class="col-12 text-center py-5">
    <h4>No Product Match</h4>
    <p>Try another title or category.</p>
</div>
`;

        return;

    }



    /*
    Render matched products
    */
    products.forEach(product => {

        container.insertAdjacentHTML(
            'beforeend',
            createProductCard(product)
        );

    });


    initializeTooltips();

}

/*
----------------------------------------
Filters products by:
1. Title search (case sensitive)
2. Category search
Uses trim() and filter()
----------------------------------------
*/

function filterProducts(searchText = '', category = '') {

    const trimmedText = searchText.trim();

    const filteredProducts = allProducts.filter(product => {

        const titleMatch =
            trimmedText === '' ||
            product.title.trim().includes(trimmedText)
        // Case-sensitive by default

        const categoryMatch =
            category === '' ||
            product.category === category;

        return titleMatch && categoryMatch;

    });

    const container =
        document.getElementById('product-grid');

    renderUI(filteredProducts, container);

}

/*
----------------------------------------
Search Controls
----------------------------------------
*/

function initializeSearch() {

    const searchInput =
        document.querySelector('#search-form');

    const categoryLinks =
        document.querySelectorAll('.cat-list a');

    let activeCategory = '';



    /*
    Title Search
    Typing filters live
    */
    searchInput.addEventListener(
        'input',
        function () {

            filterProducts(
                this.value,
                activeCategory
            );

        }
    );



    /*
    Press Enter prevents form reload
    */
    searchInput.closest('form')
        .addEventListener(
            'submit',
            function (e) {

                e.preventDefault();

                filterProducts(
                    searchInput.value,
                    activeCategory
                );

            }
        );



    /*
    Category Search
    Click category to filter
    */
    categoryLinks.forEach(link => {

        link.addEventListener(
            'click',
            function (e) {

                e.preventDefault();

                activeCategory =
                    this.textContent.trim() === 'All'
                        ? ''
                        : this.textContent.trim();

                filterProducts(
                    searchInput.value,
                    activeCategory
                );

            }

        );

    });

}





/*
--------------------------------------------------------
Creates one product card
Uses data from each product object
--------------------------------------------------------
*/
function createProductCard(product) {

    return `
<div class="col-lg-3 col-md-4 col-sm-6">

<div class="card position-relative p-4 border rounded-3 h-100">

${product.rating >= 5 ? `
<div class="position-absolute">
<p class="bg-primary py-1 px-3 fs-6 text-white rounded-2">
Best Seller
</p>
</div>
` : ''}


<img
src="${product.image}"
class="img-fluid shadow-sm"
alt="${product.title}"
>


<h6 class="mt-4 mb-0 fw-bold">
<a href="single-product.html">
${product.title}
</a>
</h6>


<div class="review-content d-flex">

<p class="my-2 me-2 fs-6 text-black-50">
${product.author}
</p>


<div class="rating text-warning d-flex align-items-center">
${generateRatingStars(product.rating)}
</div>

</div>


<span class="price text-primary fw-bold mb-2 fs-5">
${product.price}
</span>



<div class="card-concern position-absolute start-0 end-0 d-flex gap-2">

<button 
  type="button" 
  class="btn btn-dark" 
  title="Add to Cart"
  data-id="${product.id}" 
  data-price="${product.price}"
  data-title="${product.title}">
<svg class="cart">
<use xlink:href="#cart"></use>
</svg>
</button>


<a href="#" class="btn btn-dark">
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



/*
--------------------------------------------------------
Generates star rating icons

rating = 4
★★★★☆
--------------------------------------------------------
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

        }
        else {

            stars += `
        <svg class="star star-empty">
        <use xlink:href="#star-empty"></use>
        </svg>
        `;

        }

    }

    return stars;

}



/*
--------------------------------------------------------
Initialize Bootstrap tooltips
--------------------------------------------------------
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



/*
--------------------------------------------------------
When HTML page finishes loading,
start requesting products
--------------------------------------------------------
*/
document.addEventListener(
    'DOMContentLoaded',
    function () {

        requestProducts();

    }
);