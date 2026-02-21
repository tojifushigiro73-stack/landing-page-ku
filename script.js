
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

    // Animation for feedback
    cartCountElements.forEach(el => {
        el.style.transform = "scale(1.5)";
        setTimeout(() => {
            el.style.transform = "scale(1)";
        }, 200);
    });

    if (!cartDrawer.classList.contains('active')) {
        toggleCart();
    }
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
