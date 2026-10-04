/* ============================================
   SCENTLAB — Product Detail Scripts
   ============================================ */

let currentProduct = null;
let selectedSizeIdx = 0;

async function initProduct() {
  if (!document.getElementById('pdpTitle')) return;

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));

  if (!productId) {
    window.location.href = 'shop.html';
    return;
  }

  const products = await loadProducts();
  currentProduct = products.find(p => p.id === productId);

  if (!currentProduct) {
    document.getElementById('pdpTitle').textContent = 'Product Not Found';
    return;
  }

  renderProductDetails();
  renderRelatedProducts(products);
}

function renderProductDetails() {
  const p = currentProduct;
  
  // Breadcrumb
  const breadcrumb = document.getElementById('breadcrumbProduct');
  if (breadcrumb) breadcrumb.textContent = p.name;

  // Image & Badges
  document.getElementById('pdpImage').src = `assets/images/${p.image || 'product-bottle.jpg'}`;
  
  const badgesContainer = document.getElementById('pdpBadges');
  let badges = '';
  if (p.tags.includes('bestseller')) badges += '<div class="badge badge-bestseller" style="position:static">Best Seller</div>';
  if (p.tags.includes('new')) badges += '<div class="badge badge-new" style="position:static">New Arrival</div>';
  if (p.tags.includes('trending')) badges += '<div class="badge badge-trending" style="position:static">Trending</div>';
  badgesContainer.innerHTML = badges;

  // Info
  document.getElementById('pdpInspired').textContent = `Inspired by — ${p.inspiredBy}`;
  document.getElementById('pdpTitle').textContent = p.name;
  document.getElementById('pdpBrand').textContent = p.brand;
  document.getElementById('pdpGender').textContent = p.gender;
  document.getElementById('pdpCategory').textContent = p.category;
  document.getElementById('pdpDescription').textContent = p.description;

  // Sizes
  const sizeContainer = document.getElementById('sizeOptions');
  sizeContainer.innerHTML = p.sizes.map((size, index) => `
    <button class="size-btn ${index === 0 ? 'active' : ''}" onclick="selectSize(${index})">
      ${size.ml}ml
    </button>
  `).join('');

  // Initial Price
  updatePriceDisplay();

  // Notes
  if (p.notes) {
    document.getElementById('topNotes').innerHTML = p.notes.top.map(n => `<span class="note-tag">${n}</span>`).join('');
    document.getElementById('heartNotes').innerHTML = p.notes.heart.map(n => `<span class="note-tag">${n}</span>`).join('');
    document.getElementById('baseNotes').innerHTML = p.notes.base.map(n => `<span class="note-tag">${n}</span>`).join('');
  }
}

function selectSize(index) {
  selectedSizeIdx = index;
  
  // Update UI classes
  const buttons = document.querySelectorAll('.size-btn');
  buttons.forEach((btn, i) => {
    if (i === index) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  updatePriceDisplay();
}

function updatePriceDisplay() {
  const priceEl = document.getElementById('pdpPrice');
  const sizeLabelEl = document.getElementById('pdpSizeLabel');
  
  const sizeObj = currentProduct.sizes[selectedSizeIdx];
  const formattedPrice = new Intl.NumberFormat('en-IN').format(sizeObj.price);
  
  priceEl.textContent = `₹${formattedPrice}`;
  sizeLabelEl.textContent = `for ${sizeObj.ml}ml Extrait de Parfum`;
}

function changeQty(delta) {
  const input = document.getElementById('qtyInput');
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 10) val = 10;
  input.value = val;
}

function addToCart() {
  if (!currentProduct) return;

  const qty = parseInt(document.getElementById('qtyInput').value);
  const sizeObj = currentProduct.sizes[selectedSizeIdx];
  
  const cartItem = {
    productId: currentProduct.id,
    name: currentProduct.name,
    inspiredBy: currentProduct.inspiredBy,
    image: currentProduct.image || 'product-bottle.jpg',
    size: sizeObj.ml,
    price: sizeObj.price,
    qty: qty
  };

  const cart = getCart();
  
  // Check if same product + size exists
  const existingIdx = cart.findIndex(item => item.productId === cartItem.productId && item.size === cartItem.size);
  
  if (existingIdx > -1) {
    cart[existingIdx].qty += cartItem.qty;
  } else {
    cart.push(cartItem);
  }

  saveCart(cart);

  // Show success message
  const btn = document.getElementById('addToCartBtn');
  const success = document.getElementById('cartSuccess');
  
  btn.innerHTML = `<i data-lucide="check"></i> ADDED TO CART`;
  btn.style.background = 'var(--green)';
  success.classList.add('show');
  
  setTimeout(() => {
    btn.innerHTML = `<i data-lucide="shopping-bag"></i> ADD TO CART`;
    btn.style.background = '';
    // Optional: Hide success after a few seconds
    // success.classList.remove('show');
  }, 3000);
}

function renderRelatedProducts(allProducts) {
  const slider = document.getElementById('relatedSlider');
  if (!slider || !currentProduct) return;

  // Find products with same category or brand, exclude current
  const related = allProducts
    .filter(p => p.id !== currentProduct.id && (p.category === currentProduct.category || p.brand === currentProduct.brand))
    .slice(0, 5);

  if (related.length > 0) {
    slider.innerHTML = related.map(p => createProductCard(p)).join('');
  } else {
    slider.parentElement.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initProduct);
