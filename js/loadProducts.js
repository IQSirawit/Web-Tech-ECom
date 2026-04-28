/**
 * BOOKLY PRODUCT LOADER
 */

async function loadProducts(
  url = './data/products.json',
  containerId='product-grid'
){

  const container = document.getElementById(containerId);

  if(!container) return;

  try{

    const response = await fetch(url);

    if(!response.ok){
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();

    const products = data.products || [];

    container.innerHTML = '';

    products.forEach(product=>{
      container.insertAdjacentHTML(
        'beforeend',
        createProductCard(product)
      );
    });

    initializeTooltips();

  }
  catch(error){

    console.error(error);

    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          Unable to load products.
        </div>
      </div>
    `;
  }
}



function createProductCard(product){

return `
<div class="col-lg-3 col-md-4 col-sm-6">

<div class="card position-relative p-4 border rounded-3 h-100">

${product.rating >=5 ? `
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
data-bs-toggle="tooltip"
title="Add to Cart"
>
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



function generateRatingStars(rating){

let stars='';

for(let i=1;i<=5;i++){

if(i<=rating){
stars += `
<svg class="star star-fill">
<use xlink:href="#star-fill"></use>
</svg>
`;
}
else{
stars += `
<svg class="star star-empty">
<use xlink:href="#star-empty"></use>
</svg>
`;
}

}

return stars;

}



function initializeTooltips(){

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



document.addEventListener(
'DOMContentLoaded',
()=>{
loadProducts();
}
);