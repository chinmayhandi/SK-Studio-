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
      if (searchInput) searchInput.value = searchParam;
      if (globalSearch) globalSearch.value = searchParam;
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
      mainImg.onclick = function () {
        const modalImg = document.getElementById('modal-img');
        const modal = document.getElementById('image-modal');
        if (modalImg && modal) {
          modalImg.src = this.src;
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      };

      document.getElementById('pd-thumb-1').src = product.image;

      const thumb2 = document.getElementById('pd-thumb-2');
      const thumb3 = document.getElementById('pd-thumb-3');
      const thumb4 = document.getElementById('pd-thumb-4');

      if (thumb2) thumb2.src = product.image;
      if (thumb3) thumb3.src = product.image;
      if (thumb4) thumb4.src = product.image;

      // Populate Rich Description if available
      const richDescContainer = document.getElementById('rich-product-description');
      if (richDescContainer && product.descriptionTitle) {
        let html = `<h2 style="margin-bottom: 15px; font-size: 1.5rem; color: var(--primary-color);">${product.descriptionTitle}</h2>`;
        
        if (product.descriptionText) {
          const paragraphs = product.descriptionText.split('\n\n');
          paragraphs.forEach(p => {
            if(p.trim()) html += `<p style="margin-bottom: 15px;">${p.trim()}</p>`;
          });
        }

        if (product.customFeatures && product.customFeatures.length > 0) {
          html += `<p style="font-weight: 600; margin-bottom: 10px;">You can add:</p>`;
          html += `<ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">`;
          product.customFeatures.forEach(feature => {
            html += `<li style="margin-bottom: 8px;"><i class="fas fa-check" style="color: var(--secondary-color); margin-right: 8px;"></i>${feature}</li>`;
          });
          html += `</ul>`;
        }
        
        if (product.perfectFor && product.perfectFor.length > 0) {
          html += `<h3 style="font-size: 1.2rem; margin-bottom: 10px;">🎁 Perfect For:</h3>`;
          html += `<ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">`;
          product.perfectFor.forEach(occasion => {
            html += `<li style="margin-bottom: 8px;">- ${occasion}</li>`;
          });
          html += `</ul>`;
        }

        richDescContainer.innerHTML = html;
        richDescContainer.style.display = 'block';
      }

      // Initialize Inline Order Flow
      if (typeof initInlineOrderFlow === 'function') {
        initInlineOrderFlow(product);
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
    const frameTypeEl = document.getElementById('chk-frame-type');
    if (frameTypeEl) {
      if (data.frameType && data.frameType !== 'N/A') {
        frameTypeEl.textContent = data.frameType;
        frameTypeEl.parentElement.style.display = 'block';
      } else {
        frameTypeEl.parentElement.style.display = 'none';
      }
    }
    document.getElementById('chk-size').textContent = data.size;
    document.getElementById('chk-qty').textContent = data.qty;
    document.getElementById('chk-price').textContent = `₹${data.price * data.qty}`;
    document.getElementById('chk-photo-count').textContent = data.photoCount;

    const photoInstructions = document.getElementById('photo-instructions-section');
    if (photoInstructions) {
      if (data.photoCount > 0) {
        photoInstructions.style.display = 'block';
      } else {
        photoInstructions.style.display = 'none';
      }
    }

    // Modal Logic
    const instructionsModal = document.getElementById('checkout-instructions-modal');
    const understandBtn = document.getElementById('btn-understand-instructions');

    if (instructionsModal && understandBtn) {
      // Show modal on load
      setTimeout(() => {
        instructionsModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Play Success Sound
        playAudioAlert('success');

        // Soft tactile notification
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      }, 100);

      // Close modal on button click
      understandBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
      });
    }
  }

  // 8. Render Dynamic Gallery
  if (typeof galleryItems !== 'undefined') {
    // Render Home Page Portfolio (Latest 6)
    const homeGalleryGrid = document.getElementById('home-gallery-grid');
    if (homeGalleryGrid) {
      let html = '';
      const recentItems = galleryItems.slice(0, 6);
      recentItems.forEach(item => {
        const iconClass = item.isVideo ? 'fas fa-play-circle play-icon' : 'fab fa-instagram play-icon';
        const overlayClass = item.isLight ? 'portfolio-overlay-light' : 'portfolio-overlay';
        const iconColor = item.isLight ? 'color: rgba(255,255,255,0.9);' : '';
        html += `
          <div class="portfolio-item" onclick="window.open('${item.link}', '_blank')">
            <img src="${item.image}" alt="${item.title}">
            <i class="${iconClass}" style="${iconColor}"></i>
            <div class="${overlayClass}">
              <h3 class="portfolio-title">${item.title}</h3>
            </div>
          </div>
        `;
      });
      homeGalleryGrid.innerHTML = html;
    }

    // Render Gallery Page Full Grid
    const pageGalleryGrid = document.getElementById('page-gallery-grid');
    if (pageGalleryGrid) {
      let html = '';
      galleryItems.forEach(item => {
        const iconClass = item.isVideo ? 'fas fa-play-circle play-btn' : 'fab fa-instagram play-btn';
        html += `
          <div class="ig-item" onclick="window.open('${item.link}', '_blank')">
            <img src="${item.image}" alt="${item.title}">
            <div class="ig-overlay">
              <i class="${iconClass}"></i>
              <span style="font-weight:600;">
                <i class="fas fa-heart"></i> ${item.likes} &nbsp; 
                <i class="fas fa-comment"></i> ${item.comments}
              </span>
            </div>
          </div>
        `;
      });
      pageGalleryGrid.innerHTML = html;
    }
  }

});

// --- HELPER FUNCTIONS ---

// Global Audio Context
let audioCtx;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playAudioAlert(type) {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'error') {
      // Soft double beep
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(300, audioCtx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.25);

      gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
      gain2.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.2);
      gain2.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
      osc2.start(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'success') {
      // Pleasant chime
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.6);
    }
  } catch (e) {
    console.log("Audio not supported or blocked");
  }
}

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
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>

        <div class="product-price-wrapper">
          <span class="price">${product.priceRange ? product.priceRange : '₹' + product.price}</span>
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
  if (globalSearch) globalSearch.value = '';
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
  const collectionDateGroup = document.getElementById('chk-collection-date-group');
  const collectionDateInput = document.getElementById('chk-collection-date');

  if (deliveryOption === 'Home Delivery') {
    pincodeGroup.style.display = 'block';
    addressGroup.style.display = 'block';
    homeDeliveryInfo.style.display = 'block';
    pincodeInput.required = true;
    addressInput.required = true;
    
    if (collectionDateGroup) collectionDateGroup.style.display = 'none';
    if (collectionDateInput) collectionDateInput.required = false;
  } else {
    pincodeGroup.style.display = 'none';
    addressGroup.style.display = 'none';
    homeDeliveryInfo.style.display = 'none';
    pincodeInput.required = false;
    addressInput.required = false;
    
    if (collectionDateGroup) collectionDateGroup.style.display = 'block';
    if (collectionDateInput) collectionDateInput.required = true;
  }
}

// --- INLINE ORDER CUSTOMIZATION LOGIC ---
let inlineProduct = null;
let inlineSelectedFrame = null;
let inlineSelectedSize = null;
let inlineSelectedPrice = 0;

function initInlineOrderFlow(product) {
  inlineProduct = product;
  inlineSelectedFrame = null;
  inlineSelectedSize = null;
  inlineSelectedPrice = product.price;

  const customizeSection = document.getElementById('customize-order-section');
  if (!customizeSection) return;

  // Reset Quantities
  document.getElementById('inline-qty').value = 1;

  // Initial Hide
  document.getElementById('inline-size-section').style.display = 'none';
  document.getElementById('inline-summary-section').style.display = 'none';
  document.getElementById('inline-error-message').style.display = 'none';
  document.getElementById('is-name').textContent = product.name;

  // Populate Frames
  const frameGrid = document.getElementById('inline-frame-options');
  frameGrid.innerHTML = '';

  if (product.frameTypes && Object.keys(product.frameTypes).length > 0) {
    document.getElementById('inline-frame-section').style.display = 'block';

    Object.keys(product.frameTypes).forEach(frameName => {
      const frameData = product.frameTypes[frameName];
      const startingPrice = Object.values(frameData.prices)[0] || product.price; // Get first size price

      const card = document.createElement('div');
      card.className = 'modal-frame-option'; // Reusing the same class for styling
      card.innerHTML = `
        <img src="${frameData.image || product.image}" alt="${frameName}" onerror="this.src='${product.image}'">
        <span>${frameName}</span>
        <small>Starts from ₹${startingPrice}</small>
      `;

      card.addEventListener('click', function () {
        // Clear Error Message
        document.getElementById('inline-error-message').style.display = 'none';

        // Handle UI Selection
        document.querySelectorAll('#inline-frame-options .modal-frame-option').forEach(el => el.classList.remove('selected'));
        this.classList.add('selected');

        // Update State
        inlineSelectedFrame = frameName;
        inlineSelectedSize = null;
        inlineSelectedPrice = startingPrice;

        // Show next section
        document.getElementById('inline-size-section').style.display = 'block';
        document.getElementById('inline-selected-frame-name').textContent = frameName;
        document.getElementById('inline-frame-preview-img').src = frameData.image || product.image;

        // Reset summary until size is selected
        document.getElementById('inline-summary-section').style.display = 'none';

        // Populate Sizes
        const sizeGrid = document.getElementById('inline-size-options');
        sizeGrid.innerHTML = '';

        for (let size in frameData.prices) {
          const price = frameData.prices[size];
          const sizeBtn = document.createElement('div');
          sizeBtn.className = 'modal-size-option'; // Reusing class
          sizeBtn.textContent = size;

          sizeBtn.addEventListener('click', function () {
            // Clear Error Message
            document.getElementById('inline-error-message').style.display = 'none';

            document.querySelectorAll('#inline-size-options .modal-size-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');

            inlineSelectedSize = size;
            inlineSelectedPrice = price;

            // Show and Update Summary
            document.getElementById('inline-summary-section').style.display = 'block';
            document.getElementById('is-frame').textContent = inlineSelectedFrame;
            document.getElementById('is-size').textContent = inlineSelectedSize;
            document.getElementById('is-price').textContent = `₹${inlineSelectedPrice}`;
            updateInlineSummaryTotal();
          });

          sizeGrid.appendChild(sizeBtn);
        }
      });

      frameGrid.appendChild(card);
    });
  } else {
    // Product without frames fallback
    document.getElementById('inline-frame-section').style.display = 'none';
    inlineSelectedFrame = 'N/A';
    inlineSelectedSize = 'N/A';
    document.getElementById('inline-summary-section').style.display = 'block';
    document.getElementById('is-frame').textContent = 'N/A';
    document.getElementById('is-size').textContent = 'N/A';
    document.getElementById('is-price').textContent = `₹${inlineSelectedPrice}`;
    updateInlineSummaryTotal();
  }
}

window.updateInlineQty = function (change) {
  const input = document.getElementById('inline-qty');
  let val = parseInt(input.value) + change;
  if (val < 1) val = 1;
  input.value = val;
  updateInlineSummaryTotal();
};

function updateInlineSummaryTotal() {
  const qty = parseInt(document.getElementById('inline-qty').value) || 1;
  const total = inlineSelectedPrice * qty;
  document.getElementById('is-total').textContent = `₹${total}`;
}

window.proceedFromInline = function () {
  const errorMsg = document.getElementById('inline-error-message');
  if (inlineProduct.frameTypes && Object.keys(inlineProduct.frameTypes).length > 0) {
    if (!inlineSelectedFrame || !inlineSelectedSize) {
      errorMsg.style.display = 'block';
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      return;
    }
  }

  errorMsg.style.display = 'none';

  const qty = parseInt(document.getElementById('inline-qty').value) || 1;

  const orderData = {
    productName: inlineProduct.name,
    category: inlineProduct.category,
    frameType: inlineSelectedFrame || 'N/A',
    price: inlineSelectedPrice,
    size: inlineSelectedSize || 'N/A',
    qty: qty,
    photoCount: inlineProduct.photoCount
  };

  sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
  window.location.href = 'checkout.html';
};

function showModalAlert(msg) {
  playAudioAlert('error');
  if (navigator.vibrate) navigator.vibrate([100]);

  let existingPopup = document.getElementById('size-warning-popup');
  if (!existingPopup) {
    existingPopup = document.createElement('div');
    existingPopup.id = 'size-warning-popup';
    existingPopup.className = 'size-warning-popup';
    document.body.appendChild(existingPopup);
  }
  existingPopup.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;

  // Ensure popup is above modal
  existingPopup.style.zIndex = '9999999';

  void existingPopup.offsetWidth;
  existingPopup.classList.add('show');
  setTimeout(() => existingPopup.classList.remove('show'), 3000);
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
  const instructions = document.getElementById('chk-instructions').value;
  const collectionDateEl = document.getElementById('chk-collection-date');
  const collectionDate = collectionDateEl ? collectionDateEl.value : '';

  // Construct WhatsApp Message exactly as requested
  let waMessage = `Hello Sk Studio Gift,\n\n`;
  waMessage += `I want to order a customized gift.\n\n`;
  waMessage += `Product Name: ${data.productName}\n`;
  if (data.frameType && data.frameType !== 'N/A') {
    waMessage += `Frame Type: ${data.frameType}\n`;
  }
  waMessage += `Category: ${data.category}\n`;
  waMessage += `Price: ₹${data.price}\n`;
  waMessage += `Selected Size: ${data.size}\n`;
  waMessage += `Quantity: ${data.qty}\n`;
  waMessage += `Required Photos: ${data.photoCount} (Sending soon in Document Format)\n\n`;

  waMessage += `Delivery Option: ${deliveryOption}\n`;
  waMessage += `Customer Name: ${name}\n`;
  waMessage += `Phone Number: ${phone}\n`;
  
  if (deliveryOption === 'Home Delivery') {
    waMessage += `Address: ${address}\n`;
    waMessage += `Pincode: ${pincode}\n\n`;
  } else {
    waMessage += `Collection Date: ${collectionDate}\n\n`;
  }

  if (instructions) {
    waMessage += `Special Instructions: ${instructions}\n\n`;
  }

  waMessage += `Note: I will send ${data.photoCount} photos in Document Format right here to complete the order.`;

  // Clear the session storage
  sessionStorage.removeItem('pendingOrder');

  // Open WhatsApp
  const shopPhone = "917090924592";
  const encodedMessage = encodeURIComponent(waMessage);
  window.location.href = `https://wa.me/${shopPhone}?text=${encodedMessage}`;
}
