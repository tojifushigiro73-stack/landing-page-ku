
// Sticky Header Transformation
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        navbar.style.padding = "10px 0";
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.boxShadow = "none";
        navbar.style.padding = "20px 0";
    }
});

// Product Category Filtering (with Skeleton Shimmer + Empty State)
function filterCategory(category, fromScrollspy = false) {
    const products = document.querySelectorAll('.product-card');
    const buttons = document.querySelectorAll('.tab-btn');
    const grid = document.getElementById('productGrid');
    const emptyState = document.getElementById('emptyState');

    // Update Active Button
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
            if (!fromScrollspy) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

                // On mobile, also scroll to the top of catalog to "focus" the menu
                if (window.innerWidth <= 768) {
                    const catalog = document.querySelector('.catalog-section');
                    if (catalog) {
                        window.scrollTo({
                            top: catalog.offsetTop - 70, // offset for sticky categories
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }
    });

    // Trigger skeleton shimmer on the grid during transition
    grid.classList.add('filtering');

    setTimeout(() => {
        let visibleCount = 0;

        products.forEach(product => {
            const productCat = product.dataset.category;

            if (category === 'all' || productCat === category) {
                visibleCount++;
                product.style.display = 'flex';
                product.classList.remove('hidden');
                setTimeout(() => {
                    product.style.opacity = '1';
                    product.style.transform = 'scale(1)';
                }, 50);
            } else {
                product.classList.add('hidden');
                product.style.opacity = '0';
                product.style.transform = 'scale(0.92)';
                setTimeout(() => {
                    if (product.classList.contains('hidden')) {
                        product.style.display = 'none';
                    }
                }, 350);
            }
        });

        // Hide category-anchor divs when filtering to specific category
        document.querySelectorAll('.category-anchor').forEach(anchor => {
            anchor.style.display = (category === 'all') ? 'block' : 'none';
        });

        // Show / hide empty state
        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Remove shimmer after transition settles
        setTimeout(() => grid.classList.remove('filtering'), 500);

    }, 200);
}

// ===== Scrollspy: sync tabs with visible category as user scrolls =====
let scrollspyEnabled = true;  // disabled temporarily while user clicks tabs

function initScrollspy() {
    const anchors = document.querySelectorAll('.category-anchor');
    if (!anchors.length) return;

    const observer = new IntersectionObserver((entries) => {
        if (!scrollspyEnabled) return;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cat = entry.target.dataset.categoryLabel;
                if (cat) updateActiveTab(cat);
            }
        });
    }, {
        rootMargin: '-30% 0px -60% 0px', // Trigger when anchor hits top third of screen
        threshold: 0
    });

    anchors.forEach(anchor => observer.observe(anchor));
}

function updateActiveTab(category) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

// ===== Image Lazy Load: add .loaded class after image loads to hide shimmer =====
function initImageLoadObserver() {
    document.querySelectorAll('.product-image img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollspy();
    initImageLoadObserver();
    initProductCards();
});

// ===== 1. FLY-TO-CART ANIMATION =====
function flyToCart(triggerEl) {
    const cartIcon = document.querySelector('.cart-icon') || document.querySelector('.floating-cart');
    if (!cartIcon) return;

    // Create flying particle (small cookie emoji orb)
    const fly = document.createElement('div');
    fly.className = 'fly-particle';
    fly.textContent = '🍪';
    document.body.appendChild(fly);

    // Position: start from the button
    const btnRect = triggerEl.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    fly.style.left = (btnRect.left + btnRect.width / 2) + 'px';
    fly.style.top = (btnRect.top + btnRect.height / 2) + 'px';

    // Destination
    const dx = (cartRect.left + cartRect.width / 2) - (btnRect.left + btnRect.width / 2);
    const dy = (cartRect.top + cartRect.height / 2) - (btnRect.top + btnRect.height / 2);

    fly.style.setProperty('--fly-dx', dx + 'px');
    fly.style.setProperty('--fly-dy', dy + 'px');

    fly.classList.add('flying');

    fly.addEventListener('animationend', () => {
        fly.remove();
        // Cart icon bounce on landing
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
    }, { once: true });
}

// Wrap addToCart to include fly animation
const _originalAddToCart = window.addToCart;
function addToCartWithFly(name, price, triggerEl) {
    if (triggerEl) flyToCart(triggerEl);
    addToCart(name, price);
}

// ===== 2. PRODUCT DETAIL BOTTOM SHEET / MODAL =====
const productDetails = {
    'nastar': {
        name: 'Nastar',
        img: 'nastar.jpg',
        desc: 'Kukis nastar klasik dengan selai nanas homemade yang melimpah dan tekstur lumer di mulut.',
        details: [
            { icon: '⚖️', label: 'Pilihan Berat', value: '500g · Toples 800ml · 1 Kg' },
            { icon: '📅', label: 'Ketahanan', value: '14–21 hari (suhu ruang)' },
            { icon: '🥚', label: 'Bahan Utama', value: 'Mentega premium, tepung terigu, nanas segar' },
            { icon: '📦', label: 'Kemasan', value: 'Toples cantik / plastik standing pouch' },
            { icon: '🔥', label: 'Status', value: 'Best Seller — tersedia setiap hari' },
        ],
        prices: [
            { label: '1 Kg', price: 210000, key: 'Signature Nastar Gold (1Kg)' },
            { label: '500g', price: 135000, key: 'Signature Nastar Gold (500g)' },
            { label: 'Toples 800ml', price: 65000, key: 'Signature Nastar Gold (Toples 800ml)' },
        ]
    },
    'nestum': {
        name: 'Havana Nestum',
        img: 'Havana Nestum (1).png',
        desc: 'Kukis sereal Nestum yang super renyah dengan aroma susu yang menggugah selera.',
        details: [
            { icon: '⚖️', label: 'Pilihan Berat', value: 'Toples 800ml · 500g · 1 Kg' },
            { icon: '📅', label: 'Ketahanan', value: '14–21 hari (suhu ruang)' },
            { icon: '🥚', label: 'Bahan Utama', value: 'Nestum sereal, mentega premium, susu' },
            { icon: '📦', label: 'Kemasan', value: 'Toples cantik / plastik standing pouch' },
            { icon: '🔥', label: 'Status', value: 'Favorit Pelanggan — stok terbatas' },
        ],
        prices: [
            { label: '1 Kg', price: 250000, key: 'Havana Nestum (1Kg)' },
            { label: '500g', price: 135000, key: 'Havana Nestum (500g)' },
            { label: 'Toples 800ml', price: 85000, key: 'Havana Nestum (Toples 800ml)' },
        ]
    },
    'butter_cookies': {
        name: 'Butter Cookies',
        img: 'butter cookies (1).png',
        desc: 'Kukis mentega lembut yang gurih dan manis, dibuat dengan mentega premium pilihan.',
        details: [
            { icon: '⚖️', label: 'Pilihan Berat', value: 'Toples 800ml · 500g · 1 Kg' },
            { icon: '📅', label: 'Ketahanan', value: '14–21 hari (suhu ruang)' },
            { icon: '🥚', label: 'Bahan Utama', value: 'Mentega premium, gula halus, tepung terigu' },
            { icon: '📦', label: 'Kemasan', value: 'Toples cantik / plastik standing pouch' },
            { icon: '✨', label: 'Status', value: 'Kukis Klasik Premium' },
        ],
        prices: [
            { label: '1 Kg', price: 210000, key: 'Butter Cookies (1Kg)' },
            { label: '500g', price: 120000, key: 'Butter Cookies (500g)' },
            { label: 'Toples 800ml', price: 80000, key: 'Butter Cookies (Toples 800ml)' },
        ]
    },
    'choco_chips': {
        name: 'Choco Chips',
        img: 'Choco chips (1).png',
        desc: 'Kukis renyah dengan butiran coklat melimpah yang lumer di setiap gigitan.',
        details: [
            { icon: '⚖️', label: 'Pilihan Berat', value: 'Toples 800ml · 500g · 1 Kg' },
            { icon: '📅', label: 'Ketahanan', value: '14–21 hari (suhu ruang)' },
            { icon: '🍫', label: 'Bahan Utama', value: 'Dark choco chips, mentega, brown sugar' },
            { icon: '📦', label: 'Kemasan', value: 'Toples cantik / plastik standing pouch' },
            { icon: '😋', label: 'Status', value: 'Favorit Semua Umur' },
        ],
        prices: [
            { label: '1 Kg', price: 230000, key: 'Choco Chips (1Kg)' },
            { label: '500g', price: 120000, key: 'Choco Chips (500g)' },
            { label: 'Toples 800ml', price: 80000, key: 'Choco Chips (Toples 800ml)' },
        ]
    },
    'cornflakes': {
        name: 'Cornflakes',
        img: 'Cornflakes (1).png',
        desc: 'Kukis sereal cornflakes yang ekstra renyah dan gurih dengan sentuhan manis yang pas.',
        details: [
            { icon: '⚖️', label: 'Pilihan Berat', value: 'Toples 800ml · 500g · 1 Kg' },
            { icon: '📅', label: 'Ketahanan', value: '14–21 hari (suhu ruang)' },
            { icon: '🥣', label: 'Bahan Utama', value: 'Cornflakes renyah, mentega, susu' },
            { icon: '📦', label: 'Kemasan', value: 'Toples cantik / plastik standing pouch' },
            { icon: '👂', label: 'Status', value: 'Ekstra Crunchy!' },
        ],
        prices: [
            { label: '1 Kg', price: 230000, key: 'Cornflakes (1Kg)' },
            { label: '500g', price: 120000, key: 'Cornflakes (500g)' },
            { label: 'Toples 800ml', price: 80000, key: 'Cornflakes (Toples 800ml)' },
        ]
    },
    'tekwan': {
        name: 'Tekwan',
        img: 'tekwan (1).png',
        desc: 'Tekwan khas Palembang dengan kuah yang gurih, lengkap dengan jamur kuping, soun, dan bengkoang.',
        details: [
            { icon: '⚖️', label: 'Pilihan Berat', value: '500g · 1 Kg' },
            { icon: '📅', label: 'Ketahanan', value: '2–3 hari (kulkas)' },
            { icon: '🦐', label: 'Bahan Utama', value: 'Ikan, tapioka, kuah kaldu udang' },
            { icon: '📦', label: 'Kemasan', value: 'Pouch vakum / Wadah take away' },
            { icon: '⭐', label: 'Status', value: 'Menu Spesial — Fresh Everyday' },
        ],
        prices: [
            { label: '1 Kg', price: 100000, key: 'Tekwan (1Kg)' },
            { label: '500g', price: 55000, key: 'Tekwan (500g)' },
        ]
    }
};

function openProductDetail(productKey) {
    const data = productDetails[productKey];
    if (!data) return;

    const sheet = document.getElementById('productDetailSheet');
    const overlay = document.getElementById('productDetailOverlay');

    sheet.querySelector('.detail-img').src = data.img;
    sheet.querySelector('.detail-img').alt = data.name;
    sheet.querySelector('.detail-name').textContent = data.name;
    sheet.querySelector('.detail-desc').textContent = data.desc;

    // Detail rows
    sheet.querySelector('.detail-info-list').innerHTML = data.details.map(d => `
        <div class="detail-info-row">
            <span class="detail-info-icon">${d.icon}</span>
            <div>
                <span class="detail-info-label">${d.label}</span>
                <span class="detail-info-value">${d.value}</span>
            </div>
        </div>
    `).join('');

    // Price / CTA buttons
    sheet.querySelector('.detail-prices').innerHTML = data.prices.map(p => `
        <button class="btn-detail-add" onclick="addToCart('${p.key}', ${p.price}); closeProductDetail();">
            ${p.price ? `<strong>${p.label}</strong> — Rp ${p.price.toLocaleString('id-ID')}` : `${p.label}`}
            <i class="fas fa-shopping-bag"></i>
        </button>
    `).join('');

    overlay.style.display = 'block';
    sheet.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
        overlay.classList.add('active');
        sheet.classList.add('active');
    });
}

function closeProductDetail() {
    const sheet = document.getElementById('productDetailSheet');
    const overlay = document.getElementById('productDetailOverlay');
    sheet.classList.remove('active');
    overlay.classList.remove('active');
    setTimeout(() => {
        sheet.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }, 380);
}

// ===== 3. INIT PRODUCT CARD CLICK (open detail, but NOT on button clicks) =====
function initProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open detail if user clicked a button
            if (e.target.closest('button')) return;
            const key = card.dataset.detailKey;
            if (key) openProductDetail(key);
        });
    });

    // Attach fly animation to all float-cart buttons
    document.querySelectorAll('.btn-float-cart, .btn-quick-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent card click
            flyToCart(btn);
        });
    });
}


// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cart Functionality
let cart = [];
const cartCountElements = document.querySelectorAll('.cart-count');
const cartIcons = document.querySelectorAll('.cart-icon, .floating-cart');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalAmountElement = document.getElementById('cartTotalAmount');

// Map & Delivery Logic
let map;
let marker;
const shopLocation = [-5.154633, 105.300084]; // Metro, Lampung updated lokasi
const locationSection = document.getElementById('locationSection');
const coordsInput = document.getElementById('coords');
const distanceInput = document.getElementById('distance');
const locationStatus = document.getElementById('locationStatus');

// Helper Functions for Delivery
function hitungJarak() {
    return parseFloat(distanceInput.value) || 0;
}

function hitungOngkir(jarak) {
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    let ongkir = 0;
    if (totalItemsCount >= 3 && jarak <= 7) {
        ongkir = 0;
    } else if (jarak <= 5) {
        ongkir = 0;
    } else if (jarak <= 7) {
        ongkir = 5000;
    } else {
        ongkir = 2000 * Math.ceil(jarak);
    }
    return ongkir;
}

function cekJangkauan() {
    const jarak = hitungJarak();
    const batasMaksimal = 10;
    const tombolPesan = document.getElementById('btn-wa');
    const displayOngkir = document.getElementById('locationStatus');

    if (!tombolPesan || !displayOngkir) return;

    if (jarak > batasMaksimal) {
        // Mode Luar Jangkauan
        displayOngkir.innerHTML = `<b style="color: #d35400;">📍 Wah, lokasi Anda cukup jauh (${jarak} km)</b>`;
        tombolPesan.innerHTML = '<i class="fab fa-whatsapp"></i> Tanya Ongkir Khusus via WA';

        // Tambahkan animasi pulse
        tombolPesan.classList.remove('tombol-normal');
        tombolPesan.classList.add('tombol-luar-jangkauan');
        return "luar_jangkauan";
    } else {
        // Mode Normal
        const ongkir = hitungOngkir(jarak);
        if (jarak > 0) {
            displayOngkir.innerHTML = `🛵 Ongkir Kurir Instan: <b>${ongkir === 0 ? 'GRATIS' : 'Rp ' + ongkir.toLocaleString('id-ID')}</b> (${jarak} km)`;
        }
        tombolPesan.innerHTML = '<i class="fab fa-whatsapp"></i> Lanjut ke pemesanan 🛒📱';

        // Hapus animasi
        tombolPesan.classList.remove('tombol-luar-jangkauan');
        tombolPesan.classList.add('tombol-normal');
        return "dalam_jangkauan";
    }
}


function initMap() {
    if (map) return;

    map = L.map('map', {
        scrollWheelZoom: false, // Disable scroll zoom to allow page scrolling
        tap: false              // Fix for some mobile touch issues
    }).setView(shopLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    map.on('click', function (e) {
        setMarker(e.latlng);
    });
}

function setMarker(latlng) {
    if (marker) {
        marker.setLatLng(latlng);
    } else {
        marker = L.marker(latlng).addTo(map);
    }

    const lat = latlng.lat;
    const lng = latlng.lng;
    coordsInput.value = `${lat},${lng}`;

    // Calculate distance
    const shopLatLng = L.latLng(shopLocation);
    const distMeter = shopLatLng.distanceTo(latlng);
    const distKm = (distMeter / 1000).toFixed(2);
    distanceInput.value = distKm;

    // Trigger UI update to show distance and delivery fee
    updateCartUI();
}

async function searchAddress() {
    const query = document.getElementById('searchAddr').value;
    if (!query) return;

    locationStatus.innerText = "Mencari alamat...";

    try {
        // Tambahkan "Metro Lampung" ke pencarian agar hasil lebih relevan dengan lokasi toko
        const fullQuery = query + " Metro Lampung";
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            const latlng = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            };
            map.setView(latlng, 16);
            setMarker(latlng);
            locationStatus.innerText = "Alamat ditemukan! Silakan sesuaikan titik jika perlu.";
        } else {
            locationStatus.innerText = "Alamat tidak ditemukan. Coba ketik lebih spesifik.";
        }
    } catch (error) {
        console.error("Search Error:", error);
        locationStatus.innerText = "Gagal mencari alamat. Silakan klik manual di peta.";
    }
}

function useCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation tidak didukung oleh browser Anda.");
        return;
    }

    locationStatus.innerText = "Mencari lokasi Anda...";

    // Strategi: Coba metode cepat (High Accuracy = false) dulu agar user tidak menunggu
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setView(latlng, 15);
            setMarker(latlng);
            locationStatus.innerText = "Lokasi ditemukan! (Mengkalibrasi akurasi...)";

            // Sambil sudah ketemu, coba cari yang lebih presisi (High Accuracy)
            navigator.geolocation.getCurrentPosition(
                (highResPos) => {
                    const highResLatlng = {
                        lat: highResPos.coords.latitude,
                        lng: highResPos.coords.longitude
                    };
                    setMarker(highResLatlng);
                    locationStatus.innerText = "Lokasi ditemukan! (Akurasi tinggi)";
                },
                null,
                { enableHighAccuracy: true, timeout: 5000 }
            );
        },
        (error) => {
            console.error("Geo Error:", error);
            const status = document.getElementById('locationStatus');
            if (error.code === error.TIMEOUT) {
                status.innerText = "Waktu habis. Silakan klik manual pada peta.";
            } else if (error.code === error.PERMISSION_DENIED) {
                alert("Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser atau klik manual di peta.");
                status.innerText = "Izin lokasi ditolak.";
            } else {
                status.innerText = "Gagal: " + error.message + ". Klik manual di peta.";
            }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
}



function toggleCart(e) {
    if (e) e.preventDefault();
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');

    if (cartDrawer.classList.contains('active')) {
        document.body.style.overflow = 'hidden'; // Lock background scroll
        setTimeout(() => {
            initMap();
            if (map) map.invalidateSize();
        }, 300);
    } else {
        document.body.style.overflow = ''; // Unlock background scroll
    }
}

function addToCart(name, price) {
    // Check if item already exists
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const itemPrice = price !== undefined ? price : 0;
        cart.push({ name, price: itemPrice, quantity: 1, isPreOrder: price === undefined });
    }

    updateCartUI();

    // Feedback: Show Toast
    showToast(`${name} telah ditambahkan ke keranjang! 🍰`);

    // Animation for feedback
    cartCountElements.forEach(el => {
        el.style.transform = "scale(1.5)";
        setTimeout(() => {
            el.style.transform = "scale(1)";
        }, 200);
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => el.textContent = totalItems);

    if (totalItems > 0) {
        cartIcons.forEach(icon => icon.classList.add('pulse'));
        locationSection.style.display = 'block';
    } else {
        cartIcons.forEach(icon => icon.classList.remove('pulse'));
        locationSection.style.display = 'none';
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Keranjang Anda kosong</div>';
        // Reset stored Invoice ID for new orders
        const invoiceIdElement = document.getElementById('orderInvoiceId');
        if (invoiceIdElement) delete invoiceIdElement.dataset.currentId;
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x ${item.isPreOrder ? '<span class="pre-order-text">Pre-Order (Tanya Harga)</span>' : 'Rp ' + item.price.toLocaleString('id-ID')}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Hapus</button>
            </div>
        `).join('');
    }

    // Subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartSubtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;

    // Delivery Fee Logic (Refactored)
    const distKm = hitungJarak();
    const ongkir = hitungOngkir(distKm);

    document.getElementById('displayDistance').textContent = distKm;
    document.getElementById('deliveryFeeDisplay').textContent = (ongkir === 0 && distKm > 0) ? "GRATIS" : `Rp ${ongkir.toLocaleString('id-ID')}`;

    // Update UI status and button based on distance
    cekJangkauan();

    // Total Bayar
    const totalBayar = subtotal + ongkir;
    cartTotalAmountElement.textContent = `Rp ${totalBayar.toLocaleString('id-ID')}`;
}

function checkoutToWhatsApp() {
    console.log("Checkout button clicked!");
    if (cart.length === 0) {
        alert("Keranjang Anda masih kosong!");
        return;
    }

    const koordinat = document.getElementById('coords').value;
    console.log("Koordinat:", koordinat);

    if (!koordinat) {
        alert("Silakan pilih lokasi pengiriman pada peta terlebih dahulu!");
        return;
    }

    showOrderSummary();
}

function showOrderSummary() {
    const orderSummaryModal = document.getElementById('orderSummaryModal');
    const summaryItems = document.getElementById('summaryItems');
    const invoiceIdElement = document.getElementById('orderInvoiceId');
    const subtotalElement = document.getElementById('summarySubtotal');
    const shippingElement = document.getElementById('summaryShipping');
    const totalElement = document.getElementById('summaryTotal');
    const addressElement = document.getElementById('summaryAddress');

    // Generate Invoice ID if not exists
    let invoiceId;
    if (!invoiceIdElement.dataset.currentId) {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0');
        const randomId = Math.floor(1000 + Math.random() * 9000);
        invoiceId = `#INV-${dateStr}-${randomId}`;
        invoiceIdElement.textContent = invoiceId;
        invoiceIdElement.dataset.currentId = invoiceId;
    } else {
        invoiceId = invoiceIdElement.dataset.currentId;
        invoiceIdElement.textContent = invoiceId;
    }

    // Populate Items
    summaryItems.innerHTML = cart.map((item) => `
        <div class="summary-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>${item.isPreOrder ? 'N/A' : 'Rp ' + (item.price * item.quantity).toLocaleString('id-ID')}</span>
        </div>
    `).join('');

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const distKm = hitungJarak();
    const ongkir = hitungOngkir(distKm);

    const total = subtotal + ongkir;

    subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    shippingElement.textContent = ongkir === 0 ? "GRATIS" : `Rp ${ongkir.toLocaleString('id-ID')}`;
    totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;

    // Address
    const locationStatusText = document.getElementById('locationStatus').innerText;
    addressElement.textContent = locationStatusText.replace('Terpilih: ', '');

    // Show Modal
    orderSummaryModal.style.display = 'flex';
    setTimeout(() => orderSummaryModal.classList.add('active'), 10);

    // Close cart drawer if open
    if (cartDrawer.classList.contains('active')) {
        toggleCart();
    }
}

function closeOrderSummary() {
    const modal = document.getElementById('orderSummaryModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} tersalin!`);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function confirmOrderToWhatsApp() {
    const btn = document.getElementById('confirmWaBtn');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    const customerName = document.getElementById('customerName').value || "Pelanggan";

    // Show Loading
    btnText.style.opacity = '0.5';
    loader.style.display = 'inline-block';
    btn.disabled = true;

    // Delay for "System Processing" effect
    setTimeout(() => {
        const adminNumber = "6285836695103";
        const invoiceId = document.getElementById('orderInvoiceId').textContent;
        const total = document.getElementById('summaryTotal').textContent;
        const address = document.getElementById('summaryAddress').textContent;

        let message = `Halo Admin, *${customerName}* Transfer dan upload bukti transfernya.🙏 *${total}*.\n\n`;
        message += `*Detail Pesanan:*\n`;

        cart.forEach((item) => {
            message += `- ${item.quantity}x ${item.name}\n`;
        });

        message += `\n*Lokasi:* https://www.google.com/maps?q=${coordsInput.value}\n`;
        message += `*Alamat:* ${address}\n`;
        message += `*ID Pesanan:* ${invoiceId}\n\n`;
        message += `Silahkan upload bukti transfernya di chat ini yaa. Terima kasih.🙏`;

        const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;

        // Reset button state
        btnText.style.opacity = '1';
        loader.style.display = 'none';
        btn.disabled = false;

        window.open(whatsappUrl, '_blank');
        closeOrderSummary();

        // Empty cart after successful checkout
        cart = [];
        updateCartUI();
    }, 1500);
}


// Exit Intent Popup
const exitPopup = document.getElementById('exitPopup');
const ramadanPopup = document.getElementById('ramadanPopup');
let hasShownPopup = false;
let isRamadanOpen = false;

// Ramadan Popup Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        showRamadanPopup();
    }, 2000); // Show after 2 seconds
});

function showRamadanPopup() {
    isRamadanOpen = true;
    ramadanPopup.style.display = 'flex';
    setTimeout(() => { ramadanPopup.classList.add('active'); }, 10);
}

function closeRamadanPopup() {
    ramadanPopup.classList.remove('active');
    setTimeout(() => {
        ramadanPopup.style.display = 'none';
        isRamadanOpen = false;
    }, 500);
}

// Ramadan close on outside click
ramadanPopup.addEventListener('click', (e) => {
    if (e.target === ramadanPopup) closeRamadanPopup();
});

// Show on mouse leave (Desktop)
document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0 && !hasShownPopup && !isRamadanOpen) {
        showPopup();
    }
});

// Show on timer (Mobile fallback)
setTimeout(() => {
    if (!hasShownPopup && !isRamadanOpen) {
        // Only show if user hasn't scrolled much (inactive)
        if (window.scrollY < 300) {
            showPopup();
        }
    }
}, 10000); // 10 seconds

function showPopup() {
    exitPopup.classList.add('active'); // Add class for animation
    exitPopup.style.display = 'flex';
    hasShownPopup = true;
}

function closeModal() {
    exitPopup.classList.remove('active');
    setTimeout(() => {
        exitPopup.style.display = 'none';
    }, 500); // Wait for transition
}

// Close popup on outside click
exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) {
        closeModal();
    }
});

// Mobile Menu Toggle
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    // Simple toggle for demo
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = '#fff';
        navLinks.style.padding = '20px';
        navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    }
});
