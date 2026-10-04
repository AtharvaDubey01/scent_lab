/* ============================================
   SCENTLAB — Shared Scripts
   ============================================ */

// 1. Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// 2. Global State
let productsData = [];

// 3. Fetch Products
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    productsData = await response.json();
    return productsData;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// 4. Header Scroll Effect
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// 5. Mobile Menu Toggle
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  if (mobileNav) {
    mobileNav.classList.toggle('open');
  }
}

// 6. Search Overlay Toggle
function toggleSearch() {
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  if (searchOverlay) {
    searchOverlay.classList.toggle('open');
    if (searchOverlay.classList.contains('open') && searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }
}

// 7. Announcement Bar
const announcements = [
  { text: 'FREE Shipping on Orders Above ₹2,000', link: 'shop.html' },
  { text: 'Discover Your Signature Scent Today', link: 'shop.html' },
  { text: '100% Vegan & Cruelty-Free Fragrances', link: 'shop.html' }
];
let currentAnnouncement = 0;

function updateAnnouncement() {
  const textEl = document.getElementById('announcementText');
  if (!textEl) return;
  const item = announcements[currentAnnouncement];
  textEl.style.opacity = 0;
  setTimeout(() => {
    textEl.innerHTML = `<a href="${item.link}">${item.text} <span class="arrow-icon">→</span></a>`;
    textEl.style.opacity = 1;
  }, 250);
}

function changeAnnouncement(dir) {
  currentAnnouncement = (currentAnnouncement + dir + announcements.length) % announcements.length;
  updateAnnouncement();
}

// Auto-rotate announcement every 5 seconds
if (document.getElementById('announcementText')) {
  setInterval(() => changeAnnouncement(1), 5000);
}

// 8. Cart State Management (localStorage)
function getCart() {
  const cart = localStorage.getItem('scentlab_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('scentlab_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const countEls = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  countEls.forEach(el => {
    el.textContent = totalItems;
    // Animate badge
    el.style.transform = 'scale(1.2)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
  });
}

// Initialize cart badge on load
document.addEventListener('DOMContentLoaded', updateCartBadge);

// 9. Utility: Create Product Card HTML
function createProductCard(product) {
  let badgeHtml = '';
  if (product.tags.includes('bestseller')) {
    badgeHtml = '<div class="badge badge-bestseller">Best Seller</div>';
  } else if (product.tags.includes('new')) {
    badgeHtml = '<div class="badge badge-new">New Arrival</div>';
  } else if (product.tags.includes('trending')) {
    badgeHtml = '<div class="badge badge-trending">Trending</div>';
  }

  // Format price (assuming lowest size price as starting price)
  const startingPrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : 0;
  const formattedPrice = new Intl.NumberFormat('en-IN').format(startingPrice);

  return `
    <a href="product.html?id=${product.id}" class="product-card">
      <div class="card-image">
        ${badgeHtml}
        <img src="assets/images/${product.image || 'product-bottle.jpg'}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/product-bottle.jpg'">
      </div>
      <div class="card-body">
        <div class="card-inspired">Inspired by ${product.inspiredBy}</div>
        <h4>${product.name}</h4>
        <div class="card-price">₹${formattedPrice} <span>onwards</span></div>
        <button class="quick-add-btn" onclick="quickAdd(event, ${product.id})">Quick View</button>
      </div>
    </a>
  `;
}

function quickAdd(event, productId) {
  event.preventDefault(); // Prevent navigating to product page immediately if clicking the button
  window.location.href = `product.html?id=${productId}`;
}

// 10. Global Search Functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.toLowerCase().trim();

      if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
      }

      if (productsData.length === 0) {
        await loadProducts();
      }

      const results = productsData.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.inspiredBy.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      ).slice(0, 5); // Limit to 5 results

      if (results.length > 0) {
        searchResults.innerHTML = results.map(p => {
          const startingPrice = p.sizes && p.sizes.length > 0 ? p.sizes[0].price : 0;
          return `
            <div class="search-result-item" onclick="window.location.href='product.html?id=${p.id}'">
              <img src="assets/images/${p.image || 'product-bottle.jpg'}" alt="${p.name}" onerror="this.src='assets/images/product-bottle.jpg'">
              <div class="sr-info">
                <div class="sr-name">${p.name}</div>
                <div class="sr-brand">Inspired by ${p.inspiredBy}</div>
              </div>
              <div class="sr-price">₹${startingPrice}</div>
            </div>
          `;
        }).join('');
      } else {
        searchResults.innerHTML = '<div style="padding: 16px; color: var(--gray-400); text-align: center;">No products found</div>';
      }
    });
  }
});

// 11. Homepage Slider Rendering
async function initHomepage() {
  // Only run on homepage
  if (!document.getElementById('bestsellers-slider')) return;

  const products = await loadProducts();

  const renderSlider = (sliderId, filterFn) => {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const filtered = products.filter(filterFn).slice(0, 10);
    if (filtered.length > 0) {
      slider.innerHTML = filtered.map(p => createProductCard(p)).join('');
    } else {
      slider.innerHTML = '<p>No products available right now.</p>';
    }
  };

  renderSlider('bestsellers-slider', p => p.tags.includes('bestseller'));
  renderSlider('newarrivals-slider', p => p.tags.includes('new'));
  renderSlider('trending-slider', p => p.tags.includes('trending'));
}

// 12. Slider Navigation
function slideProducts(sliderId, dir) {
  const slider = document.getElementById(sliderId);
  if (slider) {
    const scrollAmount = 236; // Card width + gap
    slider.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  }
}

// Initialize homepage if we are on it
document.addEventListener('DOMContentLoaded', initHomepage);

// 13. Active Nav Link Management
function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // First, remove active class from all
  navLinks.forEach(link => link.classList.remove('active'));

  let matched = false;

  // Check for exact matches including query params
  navLinks.forEach(link => {
    // Ignore placeholder links
    if (link.getAttribute('href') === '#') return;

    // Catch cases where URL is absolute or relative
    const linkUrl = new URL(link.href, window.location.origin);

    // Only target links within the same domain
    if (linkUrl.origin === window.location.origin) {
      if (linkUrl.pathname === currentPath && linkUrl.search === currentSearch) {
        link.classList.add('active');
        matched = true;
      }
    }
  });

  // If no exact match with query param, fallback to path only (e.g. for shop.html without params, or product.html)
  if (!matched) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#') return;

      const linkUrl = new URL(link.href, window.location.origin);
      if (linkUrl.origin === window.location.origin) {
        if (linkUrl.pathname === currentPath && linkUrl.search === '') {
          link.classList.add('active');
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', updateActiveNavLink);

// Language Toggle Logic
function toggleLanguage() {
  const isArabic = document.getElementById('langSwitch').checked;

  // We update the cookie first to ensure state is saved
  document.cookie = `googtrans=/en/${isArabic ? 'ar' : 'en'}; path=/`;
  document.cookie = `googtrans=/en/${isArabic ? 'ar' : 'en'}; path=/; domain=${window.location.hostname}`;

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = isArabic ? 'ar' : 'en';
    select.dispatchEvent(new Event('change'));
  } else {
    // If select hasn't loaded yet, reload the page
    window.location.reload();
  }

  if (isArabic) {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check initial language state
  setTimeout(() => {
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
      const isArabic = document.cookie.includes('/en/ar');
      langSwitch.checked = isArabic;
      if (isArabic) {
        document.documentElement.setAttribute('dir', 'rtl');
      }
    }
  }, 500);
});
