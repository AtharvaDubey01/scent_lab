/* ============================================
   SCENTLAB — Shop Catalog Scripts
   ============================================ */

let currentProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 24;

// Mobile Sidebar
function openMobileSidebar() {
  document.getElementById('shopSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  document.getElementById('shopSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleFilterGroup(element) {
  element.classList.toggle('collapsed');
  const options = element.nextElementSibling;
  options.classList.toggle('collapsed');
}

// Initialize Shop Page
async function initShop() {
  if (!document.getElementById('productGrid')) return;

  const products = await loadProducts();
  currentProducts = [...products];

  // Populate dynamic filters
  populateDynamicFilters(products);

  // Read URL Params and set initial filters
  applyUrlParams();

  // Initial render
  applyFilters();
}

function populateDynamicFilters(products) {
  // Scent Families
  const categories = [...new Set(products.map(p => p.category))].sort();
  const catContainer = document.getElementById('categoryFilters');
  if (catContainer) {
    catContainer.innerHTML = categories.map(cat => `
      <label class="filter-check"><input type="checkbox" value="${cat}" onchange="applyFilters()"> ${cat}</label>
    `).join('');
  }

  // Brands (Inspired By)
  const brands = [...new Set(products.map(p => p.brand))].sort();
  const brandContainer = document.getElementById('brandFilters');
  if (brandContainer) {
    brandContainer.innerHTML = brands.map(brand => `
      <label class="filter-check"><input type="checkbox" value="${brand}" onchange="applyFilters()"> ${brand}</label>
    `).join('');
  }
}

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  
  // Set Gender
  const gender = params.get('gender');
  if (gender) {
    const cb = document.querySelector(`#genderFilters input[value="${gender}"]`);
    if (cb) cb.checked = true;
    
    // Update title
    document.getElementById('shopTitle').textContent = `Shop ${gender}`;
  }

  // Set Category
  const category = params.get('category');
  if (category) {
    const cb = document.querySelector(`#categoryFilters input[value="${category}"]`);
    if (cb) cb.checked = true;
    document.getElementById('shopTitle').textContent = `${category} Fragrances`;
  }

  // Set Tag (bestseller/new)
  const tag = params.get('tag');
  if (tag === 'bestseller') {
    document.getElementById('shopTitle').textContent = `Best Sellers`;
    // We handle tag filtering manually since it's not a checkbox
    window.currentTagFilter = tag; 
  } else if (tag === 'new') {
    document.getElementById('shopTitle').textContent = `New Arrivals`;
    window.currentTagFilter = tag;
  }
}

function getCheckedValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const checked = Array.from(container.querySelectorAll('input:checked'));
  return checked.map(cb => cb.value);
}

function applyFilters() {
  if (productsData.length === 0) return;

  const searchQuery = document.getElementById('shopSearch').value.toLowerCase();
  const selectedGenders = getCheckedValues('genderFilters');
  const selectedCategories = getCheckedValues('categoryFilters');
  const selectedBrands = getCheckedValues('brandFilters');
  const selectedPrices = getCheckedValues('priceFilters');
  const sortValue = document.getElementById('sortSelect').value;

  // Filter
  let filtered = productsData.filter(p => {
    // Search
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery) && !p.brand.toLowerCase().includes(searchQuery)) {
      return false;
    }
    
    // Tag (from URL)
    if (window.currentTagFilter && !p.tags.includes(window.currentTagFilter)) {
      return false;
    }

    // Gender
    if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender)) return false;

    // Category
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;

    // Brand
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

    // Price
    if (selectedPrices.length > 0) {
      const price = p.sizes[0].price;
      const matchesPrice = selectedPrices.some(range => {
        const [min, max] = range.split('-');
        return price >= parseInt(min) && price <= parseInt(max);
      });
      if (!matchesPrice) return false;
    }

    return true;
  });

  // Sort
  if (sortValue === 'price-asc') {
    filtered.sort((a, b) => a.sizes[0].price - b.sizes[0].price);
  } else if (sortValue === 'price-desc') {
    filtered.sort((a, b) => b.sizes[0].price - a.sizes[0].price);
  } else if (sortValue === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortValue === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortValue === 'newest') {
    filtered.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
  }

  currentProducts = filtered;
  currentPage = 1;
  
  updateActiveFilters(selectedGenders, selectedCategories, selectedBrands, selectedPrices);
  renderGrid();
}

function updateActiveFilters(genders, categories, brands, prices) {
  const container = document.getElementById('activeFilters');
  if (!container) return;
  
  let html = '';
  const allFilters = [...genders, ...categories, ...brands, ...prices];
  
  if (allFilters.length > 0) {
    html = allFilters.map(f => {
      let label = f;
      if (f.includes('-')) {
        const [min, max] = f.split('-');
        label = max === '99999' ? `₹${min}+` : `₹${min} - ₹${max}`;
      }
      return `<div class="filter-pill">${label}</div>`;
    }).join('');
  }
  
  container.innerHTML = html;
}

function clearAllFilters() {
  document.querySelectorAll('.filter-check input').forEach(cb => cb.checked = false);
  document.getElementById('shopSearch').value = '';
  window.currentTagFilter = null;
  document.getElementById('shopTitle').textContent = 'All Perfumes';
  
  // Clear URL params without reloading
  window.history.replaceState({}, document.title, window.location.pathname);
  
  applyFilters();
}

function renderGrid() {
  const grid = document.getElementById('productGrid');
  const countDisplay = document.getElementById('resultsCount');
  
  if (!grid) return;

  countDisplay.textContent = `${currentProducts.length} products`;

  if (currentProducts.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;"><h3 style="color:var(--navy);margin-bottom:10px;">No products found</h3><p style="color:var(--gray-600);">Try adjusting your filters or search query.</p><button class="btn-primary" style="margin-top:20px;" onclick="clearAllFilters()">Clear All Filters</button></div>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const pageProducts = currentProducts.slice(startIdx, endIdx);

  grid.innerHTML = pageProducts.map(p => createProductCard(p)).join('');

  renderPagination();
}

function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(currentProducts.length / ITEMS_PER_PAGE);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  
  // Prev button
  html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(${currentPage - 1})">‹</button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, and current +/- 1
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="color:var(--gray-400);">...</span>`;
    }
  }

  // Next button
  html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${currentPage + 1})">›</button>`;

  container.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(currentProducts.length / ITEMS_PER_PAGE);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', initShop);
