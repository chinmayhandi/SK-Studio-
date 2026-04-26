document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // 2. Header Scroll Effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      header.style.padding = '0';
    } else {
      header.style.boxShadow = 'var(--shadow-sm)';
      header.style.padding = '0';
    }
  });

  // 4. Render Best Sellers (index.html)
  const bestSellersContainer = document.getElementById('best-sellers-grid');
  if (bestSellersContainer && typeof products !== 'undefined') {
    const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
    renderProducts(bestSellers, bestSellersContainer);
  }

  // 5. Render All Products & Setup Filters (products.html)
  const allProductsContainer = document.getElementById('all-products-grid');
  if (allProductsContainer && typeof products !== 'undefined') {
    
    // Check URL params for category or search
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) {
      const radios = document.getElementsByName('category');
      for (let r of radios) {
        if (r.value === categoryParam) r.checked = true;
      }
    }
    
    if (searchParam) {
      const searchInput = document.getElementById('search-input');
      const globalSearch = document.getElementById('global-search');
      if(searchInput) searchInput.value = searchParam;
      if(globalSearch) globalSearch.value = searchParam;
    }
    
    filterAndRenderProducts(); // Initial render
    
    // Event Listeners for Filters
    const radios = document.getElementsByName('category');
    for (let r of radios) {
      r.addEventListener('change', filterAndRenderProducts);
    }
    
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) sortFilter.addEventListener('change', filterAndRenderProducts);
    
    const priceSlider = document.getElementById('price-slider');
    const priceDisplay = document.getElementById('price-display');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        priceDisplay.textContent = '₹' + e.target.value + '+';
        filterAndRenderProducts();
      });
    }
  }

  // 6. Product Details Page Logic (product.html)
  const productContainer = document.getElementById('product-container');
  if (productContainer && typeof products !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    const product = products.find(p => p.id === productId);
    
    if (product) {
      productContainer.style.display = 'grid'; // Show container
      
      // Populate Details
      document.getElementById('pd-title').textContent = product.name;
      document.getElementById('pd-category').textContent = product.category;
      document.getElementById('pd-price').textContent = `₹${product.price}`;
      document.getElementById('pd-old-price').textContent = product.oldPrice ? `₹${product.oldPrice}` : '';
      document.getElementById('pd-desc').textContent = product.description;
      const mainImg = document.getElementById('pd-main-img');
      mainImg.src = product.image;
      mainImg.style.cursor = 'zoom-in';
      mainImg.onclick = function() {
        const modalImg = document.getElementById('modal-img');
        const modal = document.getElementById('image-modal');
        if(modalImg && modal) {
          modalImg.src = this.src;
          modal.style.display = 'flex';
        }
      };
      
      document.getElementById('pd-thumb-1').src = product.image;
      
      const thumb2 = document.getElementById('pd-thumb-2');
      const thumb3 = document.getElementById('pd-thumb-3');
      const thumb4 = document.getElementById('pd-thumb-4');
      
      if (thumb2) thumb2.src = product.image;
      if (thumb3) thumb3.src = product.image;
      if (thumb4) thumb4.src = product.image;
      
      // Setup Size Logic & Price
      let basePrice = product.price;
      const sizeGroup = document.getElementById('pd-size-group');
      const sizeSelect = document.getElementById('pd-size');
      if (product.category === 'Photo Frames' && product.sizes && product.sizes.length > 0) {
        sizeGroup.style.display = 'block';
        sizeSelect.required = true;
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        product.sizes.forEach((sizeObj) => {
          const sizeName = sizeObj.size;
          const sizePrice = sizeObj.price;
          sizeSelect.innerHTML += `<option value="${sizeName}" data-price="${sizePrice}">${sizeName} (₹${sizePrice})</option>`;
        });
        
        // Add event listener to update displayed price
        sizeSelect.addEventListener('change', function() {
          const selectedOption = this.options[this.selectedIndex];
          if (selectedOption.value) {
            document.getElementById('pd-price').textContent = `₹${selectedOption.getAttribute('data-price')}`;
          } else {
            document.getElementById('pd-price').textContent = `₹${basePrice}`;
          }
        });
      } else {
        sizeGroup.style.display = 'none';
        sizeSelect.required = false;
        sizeSelect.innerHTML = '<option value="Size not required">Size not required</option>';
      }
      
      // Form Submit (handled manually now via button click)
      
      // Render Similar Products
      const similarContainer = document.getElementById('similar-products-grid');
      if (similarContainer) {
        let similarProducts = products.filter(p => p.category === product.category && p.id !== product.id);
        if (similarProducts.length === 0) {
          // If no same category, just show random
          similarProducts = products.filter(p => p.id !== product.id).slice(0, 4);
        } else {
          similarProducts = similarProducts.slice(0, 4);
        }
        renderProducts(similarProducts, similarContainer);
      }
      
    } else {
      document.getElementById('product-not-found').style.display = 'block';
    }
  }

  // 7. Checkout Page Logic (checkout.html)
  const checkoutContainer = document.getElementById('checkout-page-container');
  if (checkoutContainer) {
    const pendingOrderStr = sessionStorage.getItem('pendingOrder');
    if (!pendingOrderStr) {
      // If accessed directly without an order, redirect to shop
      window.location.href = 'products.html';
      return;
    }
    
    const data = JSON.parse(pendingOrderStr);
    
    document.getElementById('chk-product').textContent = data.productName;
    document.getElementById('chk-size').textContent = data.size;
    document.getElementById('chk-qty').textContent = data.qty;
    document.getElementById('chk-price').textContent = `₹${data.price * data.qty}`;
    document.getElementById('chk-photo-count').textContent = data.photoCount;
  }
});

// --- HELPER FUNCTIONS ---

function renderProducts(productList, container) {
  container.innerHTML = '';
  
  // Update count if on shop page
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = `Showing ${productList.length} products`;
  
  if (productList.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px; font-size:1.1rem; color:var(--text-muted);">No products found matching your criteria.</p>';
    return;
  }
  
  productList.forEach(product => {
    const card = document.createElement('a');
    card.href = `product.html?id=${product.id}`; // Link to dedicated page
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-container">
        ${product.isNewArrival ? '<span class="badge">New Arrival</span>' : ''}
        <div class="wishlist-btn-overlay" onclick="event.preventDefault(); this.style.color='red';"><i class="fas fa-heart"></i></div>
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="ui-rating">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
          <span>(12)</span>
        </div>
        <div class="product-price-wrapper">
          <span class="price">₹${product.price}</span>
          ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterAndRenderProducts() {
  const allProductsContainer = document.getElementById('all-products-grid');
  if (!allProductsContainer) return;
  
  // Get Category Radio
  let categoryFilter = '';
  const radios = document.getElementsByName('category');
  for (let r of radios) {
    if (r.checked) categoryFilter = r.value;
  }
  
  const sortFilter = document.getElementById('sort-filter').value;
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const maxPrice = parseInt(document.getElementById('price-slider').value);
  
  let filteredProducts = products.filter(product => {
    const matchCategory = categoryFilter ? product.category === categoryFilter : true;
    const matchSearch = product.name.toLowerCase().includes(searchInput);
    const matchPrice = product.price <= maxPrice;
    return matchCategory && matchSearch && matchPrice;
  });
  
  if (sortFilter === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortFilter === 'newest') {
    filteredProducts.sort((a, b) => (b.isNewArrival === a.isNewArrival) ? 0 : b.isNewArrival ? 1 : -1);
  }
  
  renderProducts(filteredProducts, allProductsContainer);
}

function clearFilters() {
  // Reset Category
  const radios = document.getElementsByName('category');
  for (let r of radios) {
    r.checked = (r.value === '');
  }
  // Reset Price
  const slider = document.getElementById('price-slider');
  slider.value = 5000;
  document.getElementById('price-display').textContent = '₹5000+';
  // Reset Search
  document.getElementById('search-input').value = '';
  const globalSearch = document.getElementById('global-search');
  if(globalSearch) globalSearch.value = '';
  // Reset Sort
  document.getElementById('sort-filter').value = 'default';
  
  filterAndRenderProducts();
}

function toggleCheckoutDelivery() {
  const deliveryOption = document.querySelector('input[name="chk_delivery_option"]:checked').value;
  const pincodeGroup = document.getElementById('chk-pincode-group');
  const addressGroup = document.getElementById('chk-address-group');
  const homeDeliveryInfo = document.getElementById('chk-home-delivery-info');
  const pincodeInput = document.getElementById('chk-pincode');
  const addressInput = document.getElementById('chk-address');
  
  if (deliveryOption === 'Home Delivery') {
    pincodeGroup.style.display = 'block';
    addressGroup.style.display = 'block';
    homeDeliveryInfo.style.display = 'block';
    pincodeInput.required = true;
    addressInput.required = true;
  } else {
    pincodeGroup.style.display = 'none';
    addressGroup.style.display = 'none';
    homeDeliveryInfo.style.display = 'none';
    pincodeInput.required = false;
    addressInput.required = false;
  }
}

let currentOrderData = null;

function proceedToCheckout() {
  // Validate Size if required
  const sizeSelect = document.getElementById('pd-size');
  if (sizeSelect.required && !sizeSelect.value) {
    alert("Please select a frame size.");
    return;
  }

  // Get Product Info
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const size = sizeSelect.value || 'Size not required';
  
  let finalPrice = product.price;
  if (sizeSelect.options.length > 0 && sizeSelect.selectedIndex > -1) {
    const selectedPrice = sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price');
    if (selectedPrice) finalPrice = selectedPrice;
  }
  
  const qty = document.getElementById('pd-qty').value;
  const msg = document.getElementById('pd-msg').value;

  // Save data to session storage
  const orderData = {
    productName: product.name,
    category: product.category,
    price: finalPrice,
    size: size,
    qty: qty,
    photoCount: product.photoCount,
    msg: msg
  };
  
  sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));

  // Redirect to checkout page
  window.location.href = 'checkout.html';
}

function confirmWhatsAppOrder(e) {
  e.preventDefault();
  
  const pendingOrderStr = sessionStorage.getItem('pendingOrder');
  if (!pendingOrderStr) return;
  const data = JSON.parse(pendingOrderStr);
  
  const deliveryOption = document.querySelector('input[name="chk_delivery_option"]:checked').value;
  const name = document.getElementById('chk-name').value;
  const phone = document.getElementById('chk-phone').value;
  const pincode = document.getElementById('chk-pincode').value;
  const address = document.getElementById('chk-address').value;

  // Construct WhatsApp Message
  let waMessage = `Hello Sk Studio Gift,\n\n`;
  waMessage += `I want to order a customized gift.\n\n`;
  waMessage += `Product Name: ${data.productName}\n`;
  waMessage += `Category: ${data.category}\n`;
  waMessage += `Price: ₹${data.price * data.qty}\n`;
  waMessage += `Selected Size: ${data.size}\n`;
  waMessage += `Quantity: ${data.qty}\n`;
  waMessage += `Required Photos: ${data.photoCount} (Sending soon in Document Format)\n\n`;
  
  waMessage += `Delivery Option: ${deliveryOption}\n`;
  waMessage += `Customer Name: ${name}\n`;
  waMessage += `Phone Number: ${phone}\n`;
  
  if (deliveryOption === 'Home Delivery') {
    waMessage += `Address: ${address}\n`;
    waMessage += `Pincode: ${pincode}\n`;
  }
  waMessage += `\n`;
  
  if (data.msg) {
    waMessage += `Special Message:\n${data.msg}\n\n`;
  }
  
  waMessage += `Note: I will send ${data.photoCount} photos in Document Format right here to complete the order.`;
  
  // Clear the session storage
  sessionStorage.removeItem('pendingOrder');
  
  // Open WhatsApp
  const shopPhone = "917090924592";
  const encodedMessage = encodeURIComponent(waMessage);
  window.location.href = `https://wa.me/${shopPhone}?text=${encodedMessage}`;
}
