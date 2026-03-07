/* --- PRODUCT DATA --- */
const products = [
    {
        id: 1, n: 'Nastar', c: 'cookies', i: 'nastar.jpg', b: 'Best Seller',
        d: 'Selai nanas homemade premium serta lumer di mulut.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 210000 }]
    },
    {
        id: 2, n: 'Havana Nestum', c: 'cookies', i: 'Havana Nestum (1).png', b: 'Hot',
        d: 'Kukis sereal nestum renyah dengan rasa susu yang creamy dan nikmat.',
        opts: [{ l: '500 gr', p: 135000 }, { l: '1 kg', p: 250000 }, { l: 'Toples 800ml', p: 85000 }]
    },
    {
        id: 3, n: 'Butter Cookies', c: 'cookies', i: 'butter cookies (1).png', b: 'New',
        d: 'Tekstur yang lembut di mulut dan rasa mentega yang sangat kaya.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 200000 }, { l: 'Toples 800ml', p: 80000 }]
    },
    {
        id: 4, n: 'Seasalt callebaut', c: 'cookies', i: 'Choco chips (1).png', b: 'Top',
        d: 'Coklat chip premium berlimpah di luar dan dalam kukis.',
        opts: [{ l: '500 gr', p: 130000 }, { l: '1 kg', p: 240000 }, { l: 'Toples 800ml', p: 80000 }]
    },
    {
        id: 5, n: 'Cornflakes', c: 'cookies', i: 'Cornflakes (1).png', b: 'Crunchy',
        d: 'Kukis sereal cornflakes yang ekstra renyah dan gurih dengan sentuhan manis yang pas.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 210000 }, { l: 'Toples 800ml', p: 80000 }]
    },
    {
        id: 6, n: 'Palm Cheese', c: 'cookies', i: 'palm_chesee.jpg', b: 'Signature',
        d: 'Kukis keju premium yang dibalut dengan gula palem yang legit dan wangi.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 200000 }]
    },
    {
        id: 7, n: 'Tekwan', c: 'cakes', i: 'tekwan (1).png', b: 'Fresh',
        d: 'Bakso ikan asli khas Palembang dengan kuah udang yang gurih segar.',
        opts: [{ l: 'Porsi 500gr', p: 55000 }, { l: 'Porsi 1kg', p: 100000 }]
    }
];

/* --- STATE --- */
let cart = JSON.parse(localStorage.getItem('cart_v17')) || [];
let map, marker, distance = 0, customerName = "";
const shopLoc = [-5.154633, 105.300084];

/* --- NAVIGATION & SCROLL --- */
function go(c) {
    const t = c === 'all' ? document.getElementById('menu') : document.getElementById('sec-' + c);
    if (!t) return;

    // Smooth scroll
    window.scrollTo({ top: t.offsetTop - 110, behavior: 'smooth' });

    // Visual update
    updateActiveTab(c);
}

function updateActiveTab(cat) {
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        if (t.getAttribute('onclick').includes(`'${cat}'`)) t.classList.add('active');
    });
}

// ScrollSpy Logic
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) window.scrollY > 30 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');

    // Detect active section
    const sections = ['cookies', 'cakes'];
    let current = 'all';

    for (const s of sections) {
        const el = document.getElementById('sec-' + s);
        if (el && window.scrollY >= el.offsetTop - 150) {
            current = s;
        }
    }
    updateActiveTab(current);
});

/* --- RENDER --- */
function render() {
    const groups = { cookies: 'grid-cookies', cakes: 'grid-cakes' };
    Object.keys(groups).forEach(key => {
        const el = document.getElementById(groups[key]);
        if (!el) return;
        const items = products.filter(x => x.c === key);
        el.innerHTML = items.map(p => `
            <div class="card" onclick="peek(${p.id})">
                <div class="img-wrap">
                    ${p.b ? `<div class="card-badge">${p.b}</div>` : ''}
                    <img src="${p.i}" class="card-img" onerror="this.src='https://placehold.co/400?text=${p.n}'">
                    <button class="btn-plus"><i class="fa-solid fa-eye"></i></button>
                    <div class="shimmer"></div>
                </div>
                <div class="card-body">
                    <div class="card-name">${p.n}</div>
                    <div class="card-price">Mulai Rp ${p.opts[0].p.toLocaleString('id-ID')}</div>
                </div>
            </div>
        `).join('') || '<p style="color:#ccc; font-style:italic">Stok segera kembali...</p>';
    });
}

/* --- CART LOGIC --- */
function add(pId, optIdx, e) {
    const p = products.find(x => x.id === pId);
    if (!p) return;
    const opt = p.opts[optIdx];
    cart.push({ n: p.n, l: opt.l, p: opt.p, i: p.i });
    localStorage.setItem('cart_v17', JSON.stringify(cart));
    updateUI();
    if (e && e.clientX) fly(e.clientX, e.clientY);
    hide();
}

function remove(idx) {
    cart.splice(idx, 1);
    localStorage.setItem('cart_v17', JSON.stringify(cart));
    openCart();
    updateUI();
}

function updateUI() {
    const cCount = document.getElementById('c-count');
    if (cCount) cCount.innerText = cart.length;

    const bar = document.getElementById('checkout-bar');
    if (!bar) return;

    if (cart.length > 0) {
        bar.style.display = 'flex';
        const subtotal = cart.reduce((s, i) => s + i.p, 0);
        const ongkir = (distance > 10) ? 0 : calcOngkir(distance);
        document.getElementById('total-val').innerText = `Rp ${(subtotal + ongkir).toLocaleString('id-ID')}`;
    } else {
        bar.style.display = 'none';
    }
}

function calcOngkir(dist) {
    if (dist === 0) return 0;
    if (cart.length >= 3 && dist <= 7) return 0;
    if (dist <= 5) return 0;
    if (dist <= 7) return 5000;
    return Math.ceil(dist) * 2000;
}

/* --- MAPS LOGIC --- */
function initMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    if (map) {
        map.remove();
        map = null;
    }

    map = L.map('map').setView(marker ? marker.getLatLng() : shopLoc, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.on('click', e => setPos(e.latlng));

    if (marker) {
        marker = L.marker(marker.getLatLng()).addTo(map);
        if (distance > 0) map.setView(marker.getLatLng(), 14);
    }
}

function setPos(latlng) {
    if (marker) marker.setLatLng(latlng); else marker = L.marker(latlng).addTo(map);
    distance = (L.latLng(shopLoc).distanceTo(latlng) / 1000).toFixed(2);

    // Update elements directly to avoid full sheet re-render (map flicker fix)
    const ong = calcOngkir(distance);
    const sub = cart.reduce((s, i) => s + i.p, 0);
    const isTooFar = distance > 10;

    const locStatus = document.getElementById('loc-status');
    const labelOng = document.getElementById('label-ong');
    const labelTotal = document.getElementById('label-total');
    const waBtn = document.getElementById('wa-btn');

    if (locStatus) {
        locStatus.style.color = isTooFar ? '#d35400' : 'var(--primary)';
        locStatus.innerHTML = isTooFar ?
            `📍 Wah, lokasi Anda cukup jauh (${distance} km)` :
            `Jarak: ${distance}km | Ongkir: ${ong === 0 ? 'GRATIS' : 'Rp ' + ong.toLocaleString('id-ID')}`;
    }

    if (labelOng) labelOng.innerText = isTooFar ? 'Tanya di WA' : (ong === 0 ? 'GRATIS' : 'Rp ' + ong.toLocaleString('id-ID'));
    if (labelTotal) labelTotal.innerText = 'Rp ' + (sub + (isTooFar ? 0 : ong)).toLocaleString('id-ID');

    if (waBtn) {
        waBtn.style.background = isTooFar ? '#e67e22' : '#27ae60';
        waBtn.innerHTML = (isTooFar ? 'Tanya Ongkir via WhatsApp' : 'Kirim ke WhatsApp') + ' <i class="fa-brands fa-whatsapp"></i>';
    }

    updateUI(); // Keep floating bar in sync
}

async function searchLoc() {
    const q = document.getElementById('s-addr').value; if (!q) return;
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ' Metro Lampung')}&limit=1`);
        const d = await res.json();
        if (d[0]) {
            const ll = { lat: d[0].lat, lng: d[0].lon };
            map.setView(ll, 16);
            setPos(ll);
        }
    } catch (err) { console.error(err); }
}

function useCurrentLoc() {
    if (!navigator.geolocation) return alert('GPS tidak didukung oleh browser Anda');
    navigator.geolocation.getCurrentPosition(pos => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setView(ll, 16);
        setPos(ll);
    }, err => alert('Gagal mengambil lokasi: ' + err.message));
}

/* --- UI COMPONENTS --- */
function peek(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('sheet-body').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr; gap:20px">
            <img src="${p.i}" style="width:100%; border-radius:24px" onerror="this.src='https://placehold.co/400?text=${p.n}'">
            <div>
                <h2 style="font-family:'Playfair Display',serif; margin-bottom:10px">${p.n}</h2>
                <p style="color:var(--text-muted); margin-bottom:20px; font-size:0.95rem">${p.d}</p>
                <p style="font-weight:700; margin-bottom:12px; color:var(--primary)">Pilih Varian / Berat:</p>
                <div>
                    ${p.opts.map((o, idx) => `
                        <button class="opt-btn" onclick="add(${p.id}, ${idx}, event)">
                            <span>${o.l}</span>
                            <span style="font-weight:700">Rp ${o.p.toLocaleString('id-ID')}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    show();
}

function openCart() {
    if (!cart.length) return hide();
    const sub = cart.reduce((s, i) => s + i.p, 0);
    const ong = calcOngkir(distance);
    const isTooFar = distance > 10;

    document.getElementById('sheet-body').innerHTML = `
        <h2 style="margin-bottom:20px">Cek Pesanan</h2>
        <div style="margin-bottom:24px">
            ${cart.map((item, idx) => `
                <div class="summary-item">
                    <div>
                        <div style="font-weight:700">${item.n}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted)">${item.l}</div>
                    </div>
                    <span>Rp ${item.p.toLocaleString('id-ID')} <i class="fa-solid fa-trash" style="color:#ff7675; cursor:pointer; margin-left:10px" onclick="remove(${idx})"></i></span>
                </div>
            `).join('')}
        </div>
        
        <div class="bank-box">
            <p style="font-weight:700; color:var(--primary); margin-bottom:10px">💳 Pembayaran Transfer</p>
            <div class="bank-item">
                <span>BRI: 009801076603506<br><small>a/n Rendy Sena Giwandita</small></span>
                <span class="copy-btn" onclick="copy('009801076603506')">SALIN</span>
            </div>
            <div class="bank-item" style="margin-top:8px">
                <span>GOPAY/DANA/OVO,ShopeePay: 082348315200<br><small>a/n Ferina Pratiwi</small></span>
                <span class="copy-btn" onclick="copy('082348315200')">SALIN</span>
            </div>
        </div>

        <div class="map-section">
            <p style="font-weight:700">📍 Lokasi Pengiriman</p>
            <input type="text" id="s-name" placeholder="Nama Penerima" class="loc-input" value="${customerName}" onchange="customerName=this.value">
            <input type="text" id="s-addr" placeholder="Cari Alamat..." class="loc-input" onkeydown="if(event.key==='Enter') searchLoc()">
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <button class="loc-btn" onclick="searchLoc()"><i class="fa-solid fa-search"></i> Cari</button>
                <button class="loc-btn" onclick="useCurrentLoc()" style="background:var(--primary); color:white"><i class="fa-solid fa-map-marker-alt"></i> Lokasi Saya</button>
            </div>

            <div id="map"></div>
            <div id="loc-status" style="font-size:0.85rem; color:${isTooFar ? '#d35400' : 'var(--primary)'}; font-weight:700">
                ${distance > 0 ?
            (isTooFar ?
                `📍 Wah, lokasi Anda cukup jauh (${distance} km)` :
                `Jarak: ${distance}km | Ongkir: ${ong === 0 ? 'GRATIS' : 'Rp ' + ong.toLocaleString('id-ID')}`)
            : 'Seret titik atau klik lokasi di peta'}
            </div>
        </div>

        <div style="margin-top:24px; border-top:2px solid #f0f0f0; padding-top:20px">
            <div class="summary-item"><span>Subtotal</span><span>Rp ${sub.toLocaleString('id-ID')}</span></div>
            <div class="summary-item"><span>Ongkir</span><span id="label-ong">${isTooFar ? 'Tanya di WA' : (ong === 0 ? 'GRATIS' : 'Rp ' + ong.toLocaleString('id-ID'))}</span></div>
            <div class="summary-item" style="font-size:1.2rem; font-weight:800; color:var(--primary)">
                <span>Total</span><span id="label-total">Rp ${(sub + (isTooFar ? 0 : ong)).toLocaleString('id-ID')}</span>
            </div>
            <button id="wa-btn" class="cta-btn" style="width:100%; border:none; margin-top:15px; background:${isTooFar ? '#e67e22' : '#27ae60'}" onclick="wa()">
                ${isTooFar ? 'Tanya Ongkir via WhatsApp' : 'Kirim ke WhatsApp'} <i class="fa-brands fa-whatsapp"></i>
            </button>
        </div>
    `;
    show();
    // Use a small delay to ensure the DOM element #map is ready
    setTimeout(initMap, 100);
}

function show() {
    document.getElementById('overlay').classList.add('active');
    document.getElementById('sheet').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hide() {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('sheet').classList.remove('active');
    document.body.style.overflow = '';
}

function copy(t) {
    navigator.clipboard.writeText(t);
    alert('Berhasil disalin ke clipboard! 😊');
}

/* --- WHATSAPP --- */
function wa() {
    if (!cart.length || distance == 0) return alert('Silakan lengkapi pesanan dan pilih lokasi pengiriman!');
    const sub = cart.reduce((s, i) => s + i.p, 0), ong = calcOngkir(distance);
    const isTooFar = distance > 10;

    let msg = `Halo La Misha! Saya *${customerName || 'Pelanggan'}* ingin pesan:\n\n`;
    cart.forEach(i => msg += `• ${i.n} (${i.l}) - Rp ${i.p.toLocaleString('id-ID')}\n`);
    msg += `\nSubtotal: Rp ${sub.toLocaleString('id-ID')}\n`;
    msg += `Ongkir: ${isTooFar ? '*Tanya via WA*' : (ong === 0 ? 'GRATIS' : 'Rp ' + ong.toLocaleString('id-ID'))}\n`;
    msg += `*Grand Total: Rp ${(sub + (isTooFar ? 0 : ong)).toLocaleString('id-ID')}*\n\n`;
    msg += `📍 Lokasi: https://www.google.com/maps?q=${marker.getLatLng().lat},${marker.getLatLng().lng}\n`;
    msg += `Alamat: ${document.getElementById('s-addr').value || 'Sesuai titik peta'}\n\n`;
    msg += isTooFar ? `Mohon info ongkirnya ya kak karena lokasi saya cukup jauh. 😊` : `Saya akan segera upload bukti transfernya. 😊`;

    window.open(`https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`, '_blank');
}

/* --- ANIMATION --- */
function fly(x, y) {
    const dest = document.querySelector('.cart-btn').getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'fly'; f.innerText = '🍪';
    f.style.left = x + 'px'; f.style.top = y + 'px';
    document.body.appendChild(f);

    requestAnimationFrame(() => {
        f.style.left = (dest.left + 22) + 'px';
        f.style.top = (dest.top + 22) + 'px';
        f.style.transform = 'scale(0.3) rotate(360deg)';
        f.style.opacity = '0';
    });

    setTimeout(() => {
        f.remove();
        const btn = document.querySelector('.cart-btn');
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }, 700);
}

/* --- INIT --- */
render();
updateUI();

// Inject 'Tanya Dulu' floating button
function injectAskWA() {
    const btn = document.createElement('div');
    btn.innerHTML = `
        <a href="https://wa.me/6285836695103?text=Halo%20La%20Misha,%20saya%20mau%20tanya-tanya%20dulu%20dong%20seputar%20kue-nya..." 
           target="_blank"
           style="position:fixed; bottom:100px; right:20px; z-index:1400; background:#25D366; color:white; padding:12px 20px; border-radius:50px; text-decoration:none; font-weight:700; font-size:0.85rem; box-shadow:0 8px 20px rgba(37,211,102,0.3); display:flex; align-items:center; gap:8px; animation: bounce 3s infinite">
           <i class="fa-brands fa-whatsapp" style="font-size:1.2rem"></i>
           <span>Tanya Dulu Boleh</span>
        </a>
        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        </style>
    `;
    document.body.appendChild(btn);
}
injectAskWA();

// Cleanup for external scripts/elements
function cleanEnvironment() {
    const oldElements = [
        '.sticky-menu', '.sticky-wa', '.floating-cart',
        '.nav-notification', '.mobile-menu-btn', '.notification-bell'
        // Teropong/OneSignal selectors removed so they don't disappear
    ];
    oldElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
        });
    });
}
cleanEnvironment();
setInterval(cleanEnvironment, 2000); // Increased interval

/* --- PWA INSTALL PROMPT --- */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show the install UI after a delay
    setTimeout(showInstallPopup, 5000);
});

function showInstallPopup() {
    if (localStorage.getItem('pwa_dismissed')) return;

    const popup = document.createElement('div');
    popup.id = 'pwa-install-popup';
    popup.innerHTML = `
        <div class="pwa-content">
            <img src="apple-touch-icon.png" alt="Logo" class="pwa-icon">
            <div class="pwa-text">
                <strong>Pasang Aplikasi Lamisha</strong>
                <p>Akses lebih cepat & hemat kuota langsung dari layar utama Anda.</p>
            </div>
            <div class="pwa-actions">
                <button onclick="dismissPWA()" class="pwa-btn-later">Nanti</button>
                <button onclick="installPWA()" class="pwa-btn-install">Pasang</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('active'));
}

window.installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    }
    deferredPrompt = null;
    dismissPWA();
};

window.dismissPWA = () => {
    const popup = document.getElementById('pwa-install-popup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 500);
    }
    localStorage.setItem('pwa_dismissed', 'true');
};
