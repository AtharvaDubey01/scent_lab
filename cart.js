/* ============================================
   SCENTLAB — Cart & Checkout Scripts
   ============================================ */

function initCartPage() {
  if (!document.getElementById('cartItems')) return;
  renderCartPage();
}

function renderCartPage() {
  const cart = getCart();
  const emptyState = document.getElementById('cartEmpty');
  const cartContent = document.getElementById('cartContent');
  
  if (cart.length === 0) {
    emptyState.style.display = 'block';
    cartContent.style.display = 'none';
    document.getElementById('checkoutSection').style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  cartContent.style.display = 'block';

  const itemsContainer = document.getElementById('cartItems');
  
  itemsContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.qty;
    const formattedPrice = new Intl.NumberFormat('en-IN').format(item.price);
    const formattedTotal = new Intl.NumberFormat('en-IN').format(itemTotal);
    
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <img src="assets/images/${item.image}" alt="${item.name}">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-size">Inspired by ${item.inspiredBy} — ${item.size}ml</div>
          </div>
        </div>
        <div class="cart-item-price">₹${formattedPrice}</div>
        <div class="cart-qty-control">
          <button class="cart-qty-btn" onclick="updateCartQty(${index}, -1)">−</button>
          <div class="cart-qty-val">${item.qty}</div>
          <button class="cart-qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
        </div>
        <div class="cart-item-total">₹${formattedTotal}</div>
        <button class="cart-item-remove" onclick="removeCartItem(${index})" aria-label="Remove">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
  updateCartSummary(cart);
}

function updateCartQty(index, delta) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    if (cart[index].qty > 10) cart[index].qty = 10;
    saveCart(cart);
    renderCartPage();
    if (document.getElementById('checkoutSection').style.display === 'block') {
      renderCheckoutSummary();
    }
  }
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
  if (document.getElementById('checkoutSection').style.display === 'block') {
    renderCheckoutSummary();
  }
}

function updateCartSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const formattedSubtotal = new Intl.NumberFormat('en-IN').format(subtotal);
  
  document.getElementById('cartSubtotal').textContent = `₹${formattedSubtotal}`;
  
  let shipping = 'Free';
  let total = subtotal;
  
  if (subtotal > 0 && subtotal < 2000) {
    shipping = '₹99';
    total += 99;
  }
  
  document.getElementById('cartShipping').textContent = shipping;
  document.getElementById('cartTotal').textContent = `₹${new Intl.NumberFormat('en-IN').format(total)}`;
}

function showCheckout() {
  document.getElementById('checkoutSection').style.display = 'block';
  document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const cart = getCart();
  const summaryContainer = document.getElementById('checkoutItems');
  
  summaryContainer.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <span>${item.qty}x ${item.name} (${item.size}ml)</span>
      <span>₹${new Intl.NumberFormat('en-IN').format(item.price * item.qty)}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal < 2000 ? 99 : 0;
  
  if (shipping > 0) {
    summaryContainer.innerHTML += `
      <div class="checkout-item" style="margin-top:8px;">
        <span>Shipping</span>
        <span>₹99</span>
      </div>
    `;
  }

  const total = subtotal + shipping;
  document.getElementById('checkoutTotal').textContent = `₹${new Intl.NumberFormat('en-IN').format(total)}`;
}

function placeOrder(e) {
  e.preventDefault();
  
  // Generate random order number
  const orderNum = Math.floor(100000 + Math.random() * 900000);
  document.getElementById('orderNumber').textContent = `SL-${orderNum}`;
  
  // Clear cart
  saveCart([]);
  
  // Show modal
  document.getElementById('orderModal').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', initCartPage);
