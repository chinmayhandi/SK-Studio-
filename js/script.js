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

  const WA_NUMBER = "12345678900"; // Shop Owner WhatsApp number

  function generateProductHTML(product) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    const waText = encodeURIComponent(`Hello, I am interested in this product: ${product.name} - ₹${product.price}`);
    const waLink = `https://wa.me/${WA_NUMBER}?text=${waText}`;

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
              <a href="${waLink}" target="_blank" class="btn btn-secondary whatsapp-enquire">
                  <i class="fa-brands fa-whatsapp"></i> Enquire on WhatsApp
              </a>
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
});
