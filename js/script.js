document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // Sticky Header
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Check where we are rendering
  const productsGridContainer = document.getElementById('products-grid-container');
  const trendingContainer = document.getElementById('trending-products-container');

  const productsData = [
    {
      id: 1,
      name: "Family Photo Frame",
      description: "A classic wooden frame perfect for a large family portrait. High-quality finish.",
      category: "frames",
      image: "images/frame.png",
      price: 999,
      originalPrice: 1299,
      isTrending: true
    },
    {
      id: 2,
      name: "Couple Name Gift",
      description: "Personalized 3D letter display. A beautiful anniversary or wedding gift.",
      category: "gifts",
      image: "images/custom.png",
      price: 499,
      originalPrice: 699,
      isTrending: true
    },
    {
      id: 3,
      name: "Speaking Memory Frame",
      description: "Scan the QR code to listen to your custom audio message. Very emotional gift.",
      category: "special",
      image: "images/speaking.png",
      price: 1499,
      originalPrice: 1999,
      isTrending: true
    },
    {
      id: 4,
      name: "Collage Wall Frame",
      description: "Combine multiple memories into one beautiful wall frame. Available in black & white.",
      category: "frames",
      image: "images/hero.png",
      price: 899,
      originalPrice: 1199,
      isTrending: false
    },
    {
      id: 5,
      name: "Custom Printed Mug",
      description: "A lovely daily reminder. Can be printed with a photo or text message.",
      category: "gifts",
      image: "images/custom.png",
      price: 299,
      originalPrice: 399,
      isTrending: false
    },
    {
      id: 6,
      name: "Scan & Play Spotify Frame",
      description: "Scan the code to instantly play a dedicated Spotify song along with a photo.",
      category: "special",
      image: "images/speaking.png",
      price: 599,
      originalPrice: 899,
      isTrending: false
    }
  ];

  const WA_NUMBER = "6364156092"; // Shop Owner WhatsApp number

  function generateProductHTML(product) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return `
      <div class="product-card product-item" data-category="${product.category}" data-price="${product.price}">
          <div class="product-img-wrapper">
              <img src="${product.image}" alt="${product.name}">
              ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
          </div>
          <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
              <div class="product-price-wrapper">
                  <span class="current-price">₹${product.price}</span>
                  ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
              </div>
              <button class="btn btn-secondary whatsapp-enquire order-now-btn" style="width: 100%;" data-name="${product.name}" data-price="${product.price}">
                  <i class="fa-brands fa-whatsapp"></i> Order on WhatsApp
              </button>
          </div>
      </div>
    `;
  }

  function renderProducts(products, container) {
    if (!container) return;
    container.innerHTML = products.map(generateProductHTML).join('');
  }

  // Initial Render
  if (productsGridContainer) {
    renderProducts(productsData, productsGridContainer);
  }
  if (trendingContainer) {
    const trendingProducts = productsData.filter(p => p.isTrending);
    renderProducts(trendingProducts, trendingContainer);
  }

  // Gallery Filtering & Sorting
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('price-sort');

  let currentFilter = 'all';
  let currentSort = 'default';

  function applyFiltersAndSort() {
    let filtered = productsData.filter(p => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'budget') return p.price < 500;
      return p.category === currentFilter;
    });

    if (currentSort === 'low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'high-low') {
      filtered.sort((a, b) => b.price - a.price);
    } // "default" relies on initial array order

    if (productsGridContainer) {
      renderProducts(filtered, productsGridContainer);
    }
  }

  if (filterBtns.length > 0 && productsGridContainer) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        applyFiltersAndSort();
      });
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndSort();
    });
  }

  // --- WhatsApp Order Modal Implementation ---

  // Inject Modal HTML
  const modalHTML = `
    <div class="order-modal-overlay" id="orderModal">
      <div class="order-modal">
        <i class="fa-solid fa-times close-modal" id="closeModal"></i>
        <h2>Place Order</h2>
        <p class="subtitle">Complete details to order via WhatsApp. Payment link will be shared by our team.</p>
        
        <form id="orderForm">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="custName" required placeholder="John Doe">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" id="custPhone" required placeholder="Enter 10-digit mobile number" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
              <div class="error-text" id="phoneError">Please enter a valid 10-digit phone number.</div>
            </div>
            <div class="form-group">
              <label>Alternate Phone</label>
              <input type="tel" id="custAltPhone" placeholder="Optional" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            </div>
          </div>

          <div class="form-group">
            <label>Full Address *</label>
            <textarea id="custAddress" required rows="2" placeholder="House No, Street Name..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Landmark</label>
              <input type="text" id="custLandmark" placeholder="Near Hospital...">
            </div>
            <div class="form-group">
              <label>City / Village *</label>
              <input type="text" id="custCity" required placeholder="City name">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Pincode *</label>
              <input type="text" id="custPincode" required placeholder="Enter pincode">
            </div>
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" id="orderQty" required min="1" value="1">
            </div>
          </div>

          <div class="form-group">
            <label>Custom Message (Optional)</label>
            <textarea id="custMessage" rows="2" placeholder="Any specific requirements..."></textarea>
          </div>

          <div class="order-summary">
            <p><span>Product:</span> <span id="summaryName">Product Name</span></p>
            <p><span>Price:</span> <span id="summaryPrice">₹0</span></p>
            <p><span>Quantity:</span> <span id="summaryQty">1</span></p>
            <p style="font-weight: bold; padding-top: 5px; border-top: 1px solid #ddd; margin-top: 5px;"><span>Total Payable Amount:</span> <span id="summaryTotal">₹0</span></p>
          </div>

          <div class="payment-section" style="text-align: center; margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 8px;">
            <h4 style="margin-bottom: 10px;">Scan to Pay</h4>
            <img id="paymentQR" src="" alt="Payment QR Code" style="width: 150px; height: 150px; display: none; margin: 0 auto; border: 1px solid #ccc; padding: 5px; border-radius: 8px;">
            <p style="font-size: 0.9em; margin-bottom: 10px; color: #555;">Or click below to pay via any UPI app</p>
            <a id="payNowBtn" href="#" class="btn btn-primary" style="background-color: #673ab7; color: #fff; width: 100%; margin-bottom: 10px; display: block; text-align: center; text-decoration: none;">
              <i class="fa-solid fa-qrcode"></i> Pay Now via UPI
            </a>
          </div>

          <input type="hidden" id="hiddenProductName">
          <input type="hidden" id="hiddenProductPrice">

          <button type="submit" class="btn btn-primary whatsapp-btn-green" style="width: 100%;">
            <i class="fa-brands fa-whatsapp"></i> Submit Order on WhatsApp
          </button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const orderModal = document.getElementById('orderModal');
  const closeModalBtn = document.getElementById('closeModal');
  const orderForm = document.getElementById('orderForm');

  // Elements for auto-calculate
  const orderQty = document.getElementById('orderQty');
  const hiddenProductName = document.getElementById('hiddenProductName');
  const hiddenProductPrice = document.getElementById('hiddenProductPrice');

  const summaryName = document.getElementById('summaryName');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryQty = document.getElementById('summaryQty');
  const summaryTotal = document.getElementById('summaryTotal');

  const UPI_ID = "6364156092@ybl"; // Replace with your actual UPI ID
  const UPI_NAME = "SK Studio Gifts";

  function updateTotal() {
    const price = parseFloat(hiddenProductPrice.value) || 0;
    const qty = parseInt(orderQty.value) || 1;
    const total = price * qty;
    const prodName = hiddenProductName.value || "";

    summaryQty.textContent = qty;
    summaryTotal.textContent = `₹${total}`;

    // Update UPI Link & QR
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(prodName)}`;
    
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) payNowBtn.href = upiLink;

    const paymentQR = document.getElementById('paymentQR');
    if (paymentQR && total > 0) {
      paymentQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
      paymentQR.style.display = 'block';
    }
  }

  // Open modal on clicking any order button
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.order-now-btn');
    if (btn) {
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');

      hiddenProductName.value = name;
      hiddenProductPrice.value = price;
      orderQty.value = 1;

      summaryName.textContent = name;
      summaryPrice.textContent = `₹${price}`;
      updateTotal();

      orderModal.classList.add('active');
    }
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    orderModal.classList.remove('active');
  });

  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
      orderModal.classList.remove('active');
    }
  });

  orderQty.addEventListener('input', updateTotal);

  // --- Validation Logic ---
  const custPhone = document.getElementById('custPhone');
  const phoneError = document.getElementById('phoneError');

  function validatePhone() {
    const val = custPhone.value.trim();
    if (val.length === 10) {
      custPhone.classList.remove('input-error');
      custPhone.classList.add('input-success');
      phoneError.style.display = 'none';
      return true;
    } else {
      custPhone.classList.add('input-error');
      custPhone.classList.remove('input-success');
      if (val.length > 0) phoneError.style.display = 'block';
      return false;
    }
  }

  custPhone.addEventListener('input', validatePhone);
  custPhone.addEventListener('blur', validatePhone);

  // Handle Form Submit
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }
    
    const isPhoneValid = validatePhone();
    
    if (!isPhoneValid) {
      return; 
    }

    const name = document.getElementById('custName').value.trim();
    const phone = custPhone.value.trim();
    const altPhone = document.getElementById('custAltPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const landmark = document.getElementById('custLandmark').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const pincode = document.getElementById('custPincode').value.trim();
    const message = document.getElementById('custMessage').value.trim();

    const qty = parseInt(orderQty.value) || 1;
    const price = parseFloat(hiddenProductPrice.value);
    const prodName = hiddenProductName.value;
    const totalAmount = price * qty;

    const waMessage = `*Hello, I want to place an order from SK Studio Gifts.*\n\n*Customer Details:*\nName: ${name}\nPhone: ${phone}\nAlternate Phone: ${altPhone || 'N/A'}\nAddress: ${address}\nLandmark: ${landmark || 'N/A'}\nCity/Village: ${city}\nPincode: ${pincode}\n\n*Order Details:*\nProduct: ${prodName}\nPrice: ₹${price}\nQuantity: ${qty}\nTotal Amount: *₹${totalAmount}*\n\n*Customization Details:*\n${message || 'N/A'}\n\n_I have completed the payment via UPI. Please find the payment screenshot attached. Kindly confirm my order._`;

    const waLink = `https://wa.me/916364156092?text=${encodeURIComponent(waMessage)}`;

    // Redirect to WA
    window.open(waLink, '_blank');
    orderModal.classList.remove('active');
    orderForm.reset();
    
    // Reset validation classes
    custPhone.classList.remove('input-success', 'input-error');
    phoneError.style.display = 'none';
  });
});