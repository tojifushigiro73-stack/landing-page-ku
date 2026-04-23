/* --- FIREBASE CONFIG --- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Analytics is optional, wrap to prevent blocking
try {
    const analytics = getAnalytics(app);
} catch (e) {
    console.warn("Analytics blocked or failed to load");
}

/* --- PRODUCT DATA --- */
const products = [
    {
        id: 1, n: 'Nastar', c: 'cookies', i: 'nastar.webp', b: 'Best Seller',
        d: 'Selai nanas homemade premium serta lumer di mulut.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 210000 }]
    },
    {
        id: 2, n: 'Havana Nestum', c: 'cookies', i: 'Havana Nestum (1).webp', b: 'Hot',
        d: 'Kukis sereal nestum renyah dengan rasa susu yang creamy dan nikmat.',
        opts: [{ l: '500 gr', p: 135000 }, { l: '1 kg', p: 250000 }, { l: 'Toples 800ml', p: 85000 }]
    },
    {
        id: 3, n: 'Butter Cookies', c: 'cookies', i: 'butter cookies (1).webp', b: 'New',
        d: 'Tekstur yang lembut di mulut dan rasa mentega yang sangat kaya.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 200000 }, { l: 'Toples 800ml', p: 80000 }]
    },
    {
        id: 4, n: 'Seasalt callebaut', c: 'cookies', i: 'Choco chips (1).webp', b: 'Top',
        d: 'Coklat chip premium berlimpah di luar dan dalam kukis.',
        opts: [{ l: '500 gr', p: 130000 }, { l: '1 kg', p: 240000 }, { l: 'Toples 800ml', p: 80000 }]
    },
    {
        id: 5, n: 'Cornflakes', c: 'cookies', i: 'Cornflakes (1).webp', b: 'Crunchy',
        d: 'Kukis sereal cornflakes yang ekstra renyah dan gurih dengan sentuhan manis yang pas.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 210000 }, { l: 'Toples 800ml', p: 80000 }]
    },
    {
        id: 6, n: 'Palm Cheese', c: 'cookies', i: 'palm_chesee.webp', b: 'Signature',
        d: 'Kukis keju premium yang dibalut dengan gula palem yang legit dan wangi.',
        opts: [{ l: '500 gr', p: 110000 }, { l: '1 kg', p: 200000 }]
    },
    {
        id: 7, n: 'Tekwan', c: 'cakes', i: 'tekwan (1).webp', b: 'Fresh',
        d: 'Bakso ikan asli khas Palembang dengan kuah udang yang gurih segar.',
        opts: [{ l: 'Porsi 500gr', p: 55000 }, { l: 'Porsi 1kg', p: 100000 }]
    }
];

/* --- STATE --- */
let cart = JSON.parse(localStorage.getItem('cart_v17')) || [];
let loyaltyPoints = parseInt(localStorage.getItem('loyalty_v1')) || 0;
let isRedeemingPoints = false;
let map, marker, distance = 0, customerName = "";
let currentUser = null; // State Auth Real
const shopLoc = [-5.154633, 105.300084];

/* --- NAVIGATION & SCROLL --- */
function go(cat) {
    const target = cat === 'all' ? document.getElementById('menu') : document.getElementById('sec-' + cat);
    if (!target) return;

    // Smooth scroll with offset for sticky header
    const offset = window.innerWidth <= 768 ? 100 : 110;
    window.scrollTo({ 
        top: target.offsetTop - offset, 
        behavior: 'smooth' 
    });

    // Instant visual feedback for tab
    updateActiveTab(cat);
}

function updateActiveTab(cat) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
        const isActive = t.dataset.cat === cat;
        t.classList.toggle('active', isActive);
        
        // Accessibility
        t.setAttribute('aria-selected', isActive);
    });
}

// ScrollSpy Logic - Optimized with RequestAnimationFrame
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            const nav = document.getElementById('nav');
            if (nav) {
                window.scrollY > 30 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
            }

            // Detect active section
            const sections = ['cookies', 'cakes'];
            let current = 'all';

            for (const s of sections) {
                const el = document.getElementById('sec-' + s);
                if (el && window.scrollY >= el.offsetTop - 180) {
                    current = s;
                }
            }
            updateActiveTab(current);
            isScrolling = false;
        });
        isScrolling = true;
    }
});

/* --- RENDER --- */
function render() {
    const groups = { cookies: 'grid-cookies', cakes: 'grid-cakes' };
    Object.keys(groups).forEach(key => {
        const el = document.getElementById(groups[key]);
        if (!el) return;
        const items = products.filter(x => x.c === key);
        el.innerHTML = items.map(p => `
            <div class="card" data-action="peek" data-id="${p.id}">
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
    // 1. Cart Count
    const cCount = document.getElementById('c-count');
    if (cCount) cCount.innerText = cart.length;

    // 2. Auth State UI
    const loginSec = document.getElementById('login-section');
    const userProf = document.getElementById('user-profile');
    const userNameEl = document.getElementById('user-name');
    const userPhotoEl = document.getElementById('user-photo');

    if (currentUser) {
        if (loginSec) loginSec.style.display = 'none';
        if (userProf) {
            userProf.style.display = 'block';
            if (userNameEl) userNameEl.innerText = currentUser.name.split(' ')[0];
            if (userPhotoEl) userPhotoEl.src = currentUser.photo;
        }
    } else {
        if (loginSec) loginSec.style.display = 'block';
        if (userProf) userProf.style.display = 'none';
    }

    // 3. Checkout Bar & Calculations
    const bar = document.getElementById('checkout-bar');
    if (!bar) return;

    renderLoyaltyCard(); // Bridge to Community 2
    
    if (cart.length > 0) {
        bar.style.display = 'flex';
        const subtotal = cart.reduce((s, i) => s + i.p, 0);
        const ongkir = (distance > 10) ? 0 : calcOngkir(distance);
        
        const { discount } = calculateRedeem();
        const grandTotal = subtotal + ongkir - discount;
        const totalValEl = document.getElementById('total-val');
        if (totalValEl) totalValEl.innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;

        // Potential Points Message
        const potentialPoints = Math.floor(subtotal / 10000);
        const loyaltyMsg = document.getElementById('loyalty-msg');
        if (loyaltyMsg) {
            let msg = potentialPoints > 0 ? `+${potentialPoints} Poin Pilihan` : '';
            if (discount > 0) msg += ` | Diskon Poin: -Rp ${discount.toLocaleString('id-ID')}`;
            loyaltyMsg.innerText = msg;
        }
    } else {
        bar.style.display = 'none';
        isRedeemingPoints = false;
    }

    // 4. Offline Banner Bridge
    renderOfflineBanner();
}

function renderOfflineBanner() {
    const isOffline = !navigator.onLine;
    let banner = document.getElementById('offline-banner');
    
    if (isOffline) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'offline-banner';
            banner.className = 'offline-banner';
            banner.innerHTML = `
                <div class="offline-content">
                    <i class="fa-solid fa-cloud-slash"></i>
                    <span>Anda sedang offline, tapi katalog Kukis LaMisha tetap bisa diakses!</span>
                </div>
            `;
            document.body.appendChild(banner);
        }
        requestAnimationFrame(() => banner.classList.add('active'));
    } else if (banner) {
        banner.classList.remove('active');
        setTimeout(() => banner.remove(), 500);
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
    const { discount, pointsUsed } = calculateRedeem();

    document.getElementById('sheet-body').innerHTML = `
        <h2 style="margin-bottom:20px">Cek Pesanan</h2>
        
        <!-- LOYALTY BOX -->
        <div style="background: #fff9f0; border: 1px dashed #e67e22; border-radius: 16px; padding: 15px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2rem;">🎁</div>
            <div style="flex: 1;">
                <div style="font-weight: 700; color: #d35400; font-size: 0.9rem;">Poin Pilihan Anda</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${loyaltyPoints} Poin</div>
            </div>
            ${loyaltyPoints >= 10 ? 
                `<button data-action="toggle-redeem" style="background: ${isRedeemingPoints ? '#e74c3c' : 'var(--primary)'}; color: white; border: none; padding: 8px 15px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
                    ${isRedeemingPoints ? 'BATAL' : 'TUKAR'}
                </button>` : 
                `<div style="font-size: 0.75rem; color: #888; font-style: italic; width: 80px; text-align: right;">Min. 10 Poin</div>`
            }
        </div>

        <div style="margin-bottom:24px">
            ${cart.map((item, idx) => `
                <div class="summary-item">
                    <div>
                        <div style="font-weight:700">${item.n}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted)">${item.l}</div>
                    </div>
                    <span>Rp ${item.p.toLocaleString('id-ID')} <i class="fa-solid fa-trash" style="color:#ff7675; cursor:pointer; margin-left:10px" data-action="remove" data-idx="${idx}"></i></span>
                </div>
            `).join('')}
        </div>
        
        <div class="bank-box">
            <p style="font-weight:700; color:var(--primary); margin-bottom:10px">💳 Pembayaran Transfer</p>
            <div class="bank-item">
                <span>BRI: 009801076603506<br><small>a/n Rendy Sena Giwandita</small></span>
                <span class="copy-btn" data-action="copy" data-text="009801076603506">SALIN</span>
            </div>
            <div class="bank-item" style="margin-top:8px">
                <span>GOPAY/DANA/OVO,ShopeePay: 082348315200<br><small>a/n Ferina Pratiwi</small></span>
                <span class="copy-btn" data-action="copy" data-text="082348315200">SALIN</span>
            </div>
        </div>

        <div class="map-section">
            <p style="font-weight:700">📍 Lokasi Pengiriman</p>
            <input type="text" id="s-name" placeholder="Nama Penerima" class="loc-input" value="${customerName}">
            <input type="text" id="s-addr" placeholder="Cari Alamat..." class="loc-input">
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <button class="loc-btn" data-action="search-loc"><i class="fa-solid fa-search"></i> Cari</button>
                <button class="loc-btn" data-action="use-current-loc" style="background:var(--primary); color:white"><i class="fa-solid fa-map-marker-alt"></i> Lokasi Saya</button>
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
            ${discount > 0 ? `<div class="summary-item" style="color: #e74c3c; font-weight: 700;"><span>Diskon Poin</span><span>-Rp ${discount.toLocaleString('id-ID')}</span></div>` : ''}
            <div class="summary-item" style="font-size:1.2rem; font-weight:800; color:var(--primary)">
                <span>Total</span><span id="label-total">Rp ${(sub + (isTooFar ? 0 : ong) - discount).toLocaleString('id-ID')}</span>
            </div>
            <button id="wa-btn" class="cta-btn" data-action="wa" style="width:100%; border:none; margin-top:15px; background:${isTooFar ? '#e67e22' : '#27ae60'}">
                ${isTooFar ? 'Tanya Ongkir via WhatsApp' : 'Kirim ke WhatsApp'} <i class="fa-brands fa-whatsapp"></i>
            </button>
        </div>
    `;
    show();
    setTimeout(initMap, 100);
    
    // Auto-update customer name on change
    const nameInput = document.getElementById('s-name');
    if (nameInput) nameInput.onchange = (e) => customerName = e.target.value;
    
    // Auto-search on Enter
    const addrInput = document.getElementById('s-addr');
    if (addrInput) addrInput.onkeydown = (e) => { if(e.key==='Enter') searchLoc(); };
}

function show() {
    document.getElementById('overlay').classList.add('active');
    document.getElementById('sheet').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Hide floating icons when sheet (cart) is open
    const csIcon = document.getElementById('cs-icon');
    if (csIcon) csIcon.classList.add('cs-hide');
    const bellIcon = document.getElementById('custom-one-signal-bell');
    if (bellIcon) bellIcon.classList.add('cs-hide');

    // Hide Tawk.to if it exists
    if (typeof Tawk_API !== 'undefined' && Tawk_API.hideWidget) {
        Tawk_API.hideWidget();
    }
}

function hide() {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('sheet').classList.remove('active');
    document.body.style.overflow = '';

    // Show floating icons when sheet is closed
    const csIcon = document.getElementById('cs-icon');
    if (csIcon) csIcon.classList.remove('cs-hide');
    
    const bellIcon = document.getElementById('custom-one-signal-bell');
    if (bellIcon) bellIcon.classList.remove('cs-hide');

    // Tawk.to should stay hidden (launcher/default bubble), custom icon handles it.
    if (typeof Tawk_API !== 'undefined') {
        Tawk_API.hideWidget();
    }
}

function toggleRedeem() {
    isRedeemingPoints = !isRedeemingPoints;
    openCart(); 
    updateUI(); 
}

/* --- LOYALTY STRATEGY --- */
function calculateRedeem() {
    let discount = 0;
    let pointsUsed = 0;
    if (isRedeemingPoints && loyaltyPoints >= 10) {
        pointsUsed = Math.floor(loyaltyPoints / 10) * 10;
        discount = (pointsUsed / 10) * 5000;
    }
    return { discount, pointsUsed };
}

function copy(t) {
    navigator.clipboard.writeText(t);
    alert('Berhasil disalin ke clipboard! 😊');
}

/* --- AUTH ACTIONS --- */
function openAuth() {
    document.getElementById('auth-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAuth() {
    document.getElementById('auth-overlay').classList.remove('active');
    if (!document.getElementById('sheet').classList.contains('active') && 
        !document.getElementById('terms-overlay').classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

function openTerms() {
    document.getElementById('terms-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTerms() {
    document.getElementById('terms-overlay').classList.remove('active');
    if (!document.getElementById('auth-overlay').classList.contains('active') && 
        !document.getElementById('sheet').classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

function startLogin() {
    signInWithRedirect(auth, provider);
}

// Handler Result Redirect
getRedirectResult(auth).then((result) => {
    if (result) {
        console.log("Login Berhasil:", result.user.displayName);
    }
}).catch((error) => {
    console.error("Login Error:", error);
});

// Listener Auth State
onAuthStateChanged(auth, async (user) => {
    console.log("Firebase Auth State Changed. User:", user ? user.displayName : "None");
    if (user) {
        currentUser = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL
        };
        
        updateUI(); // Update UI immediately so user sees profile
        
        try {
            await mergePoints(user);
            await syncPoints(user);
            updateUI(); // Update again after points are synced
        } catch (dbError) {
            console.error("Database sync failed:", dbError);
        }
        
        closeAuth();
    } else {
        currentUser = null;
        updateUI();
    }
});

async function mergePoints(user) {
    const localPoin = parseInt(localStorage.getItem('loyalty_v1')) || 0;
    if (localPoin > 0) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            await updateDoc(userRef, {
                points: increment(localPoin),
                lastUpdated: serverTimestamp()
            });
        } else {
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                points: localPoin,
                createdAt: serverTimestamp()
            });
        }
        localStorage.removeItem('loyalty_v1');
        loyaltyPoints = 0; // Akan diupdate via syncPoints
    }
}

async function syncPoints(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        loyaltyPoints = userSnap.data().points || 0;
        // Opsional: Tetap simpan di local untuk performa offline
        localStorage.setItem('loyalty_v1', loyaltyPoints);
    }
}

function renderLoyaltyCard() {
    const container = document.getElementById('loyalty-card-container');
    if (!container) return;

    const progress = (loyaltyPoints % 10) * 10;
    
    container.innerHTML = `
        <div class="loyalty-card">
            <div class="loyalty-header">
                <div class="loyalty-title">Poin Pilihan Member</div>
                <i class="fa-solid fa-crown"></i>
            </div>
            <div class="loyalty-balance">${loyaltyPoints} Poin</div>
            <div class="loyalty-progress-container">
                <div class="loyalty-progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="loyalty-footer">
                <div class="loyalty-msg-box">
                    ${loyaltyPoints >= 10 ? '🎁 Siap ditukar diskon!' : `Kurang ${10 - (loyaltyPoints % 10)} poin lagi untuk diskon.`}
                </div>
                ${!currentUser ? 
                    `<button class="loyalty-btn-mini" data-action="open-auth">Simpan Poin</button>` : 
                    `<div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); font-weight: 700;">PRO LEVEL MEMBER</div>`
                }
            </div>
        </div>
    `;
}



// Export functions to window to keep them accessible from HTML
window.go = go;
window.openCart = openCart;
window.add = add;
window.remove = remove;
window.toggleRedeem = toggleRedeem;
window.peek = peek;
window.copy = copy;
window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.startLogin = () => {
    console.log("Starting Google Login...");
    signInWithRedirect(auth, provider);
};
function logout() {
    document.getElementById('logout-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function confirmLogout() {
    try {
        await signOut(auth);
        currentUser = null;
        closeLogout();
        updateUI();
        console.log("User logged out successfully");
    } catch (e) {
        console.error("Error signing out:", e);
    }
}

function closeLogout() {
    document.getElementById('logout-overlay').classList.remove('active');
    if (!document.getElementById('sheet').classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

window.openTerms = openTerms;
window.closeTerms = closeTerms;
window.wa = wa;
window.searchLoc = searchLoc;
window.useCurrentLoc = useCurrentLoc;

/* --- WHATSAPP --- */
function wa() {
    if (!cart.length || distance == 0) return alert('Silakan lengkapi pesanan dan pilih lokasi pengiriman!');
    const sub = cart.reduce((s, i) => s + i.p, 0), ong = calcOngkir(distance);
    const isTooFar = distance > 10;
    
    const { discount, pointsUsed } = calculateRedeem();

    // Finalize Loyalty Points (Use points first, then earn new ones)
    const earnedPoints = Math.floor((sub - discount) / 10000);
    
    loyaltyPoints = loyaltyPoints - pointsUsed + earnedPoints;
    localStorage.setItem('loyalty_v1', loyaltyPoints);

    if (pointsUsed > 0 || earnedPoints > 0) {
        let alertMsg = earnedPoints > 0 ? `Selamat! Anda mendapatkan ${earnedPoints} Poin Pilihan. ` : '';
        if (pointsUsed > 0) alertMsg += `Serta menggunakan ${pointsUsed} poin untuk diskon. `;
        alert(alertMsg + "😊");
    }

    let msg = `Halo La Misha! Saya *${customerName || 'Pelanggan'}* ingin pesan:\n\n`;
    cart.forEach(i => msg += `• ${i.n} (${i.l}) - Rp ${i.p.toLocaleString('id-ID')}\n`);
    msg += `\nSubtotal: Rp ${sub.toLocaleString('id-ID')}\n`;
    msg += `Ongkir: ${isTooFar ? '*Tanya via WA*' : (ong === 0 ? 'GRATIS' : 'Rp ' + ong.toLocaleString('id-ID'))}\n`;
    if (discount > 0) msg += `Diskon Poin: -Rp ${discount.toLocaleString('id-ID')}\n`;
    msg += `*Grand Total: Rp ${(sub + (isTooFar ? 0 : ong) - discount).toLocaleString('id-ID')}*\n\n`;
    msg += `📍 Lokasi: https://www.google.com/maps?q=${marker.getLatLng().lat},${marker.getLatLng().lng}\n`;
    msg += `Alamat: ${document.getElementById('s-addr').value || 'Sesuai titik peta'}\n\n`;
    msg += isTooFar ? `Mohon info ongkirnya ya kak karena lokasi saya cukup jauh. 😊` : `Saya akan segera upload bukti transfernya. 😊`;

    window.open(`https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`, '_blank');
    
    // Clear state after redirect
    isRedeemingPoints = false;
    updateUI();
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

// Inject 'Tanya Dulu' floating button (WhatsApp) - REMOVED AS PER USER REQUEST
function injectAskWA() {
    // Floating WA button is now replaced by a static button in the Hero section
}
injectAskWA();

// Inject Custom CS Icon (Tawk.to)
function injectCSIcon() {
    const cs = document.createElement('div');
    cs.id = 'cs-icon';
    cs.className = 'cs-floating-icon';
    cs.setAttribute('data-action', 'open-chat'); // Use delegation
    cs.innerHTML = `
        <i class="fa-solid fa-user"></i>
        <div class="cs-badge">1</div>
    `;
    document.body.appendChild(cs);

    // Tawk.to events to keep it hidden unless maximized
    if (typeof Tawk_API !== 'undefined') {
        Tawk_API.onChatMinimized = function () {
            Tawk_API.hideWidget();
        };
        Tawk_API.onChatHidden = function () {
            Tawk_API.hideWidget();
        };
    }
}
injectCSIcon();

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
                <button id="pwa-btn-later" class="pwa-btn-later">Nanti</button>
                <button id="pwa-btn-install" class="pwa-btn-install">Pasang</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    
    // Attach listeners to dynamic elements
    document.getElementById('pwa-btn-later').addEventListener('click', dismissPWA);
    document.getElementById('pwa-btn-install').addEventListener('click', installPWA);
    
    requestAnimationFrame(() => popup.classList.add('active'));
}

async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    }
    deferredPrompt = null;
    dismissPWA();
}

function dismissPWA() {
    const popup = document.getElementById('pwa-install-popup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 500);
    }
    localStorage.setItem('pwa_dismissed', 'true');
}

// --- GLOBAL EVENT DELEGATION (CSP FRIENDLY) ---
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;

    const action = el.dataset.action;
    const id = parseInt(el.dataset.id);
    const idx = parseInt(el.dataset.idx);

    console.log("Menjalankan aksi:", action, id || '', idx || '');

    if (action === 'open-auth') openAuth();
    if (action === 'close-auth') closeAuth();
    if (action === 'logout') logout();
    if (action === 'open-cart') openCart();
    if (action === 'close-cart') hide();
    if (action === 'open-chat') {
        if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
            Tawk_API.showWidget();
            Tawk_API.maximize();
        } else {
            alert("Layanan chat sedang memuat atau terblokir. Silakan hubungi kami via WhatsApp di Hero section. 😊");
        }
    }
    if (action === 'start-login') {
        console.log("Mencoba Login dengan Google (Popup Mode)...");
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Login Berhasil via Popup:", result.user.displayName);
            })
            .catch((error) => {
                console.error("Login Error:", error.code, error.message);
                if (error.code !== 'auth/popup-closed-by-user') {
                    alert("Gagal Login: " + error.message);
                }
            });
    }
    if (action === 'open-terms') openTerms();
    if (action === 'close-terms') closeTerms();
    if (action === 'close-logout') closeLogout();
    if (action === 'confirm-logout') confirmLogout();
    if (action === 'peek') peek(id);
    if (action === 'add') add(id, idx, e);
    if (action === 'remove') remove(idx);
    if (action === 'go') go(el.dataset.cat);
    if (action === 'wa') wa();
    if (action === 'toggle-redeem') toggleRedeem();
    if (action === 'install-pwa') installPWA();
    if (action === 'dismiss-pwa') dismissPWA();
    if (action === 'copy') copy(el.dataset.text);
    if (action === 'search-loc') searchLoc();
    if (action === 'use-current-loc') useCurrentLoc();
});

// Remove old listeners to avoid double execution
document.addEventListener('DOMContentLoaded', () => {
    // We use delegation now, so we don't need individual listeners for most things
});

// Global Export
window.installPWA = installPWA;
window.dismissPWA = dismissPWA;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing La Misha PWA...");
    render();
    updateUI();
    injectCSIcon();
    cleanEnvironment();
    initServiceWorker();
    initOfflineHandling();
    initOneSignalBridges();
});

/* --- SERVICE WORKER & OFFLINE --- */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.error('SW Registration Failed:', err));
    }
}

function initOfflineHandling() {
    window.addEventListener('online', updateUI);
    window.addEventListener('offline', updateUI);
    if (!navigator.onLine) updateUI();
}

/* --- ONESIGNAL BRIDGES --- */
function initOneSignalBridges() {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
        // Example: Handle promo notifications to refresh UI
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
            console.log("Notification received in foreground:", event.notification);
            // We could trigger updateUI or show a specific promo modal here
            updateUI();
        });
    });
}

// Periodic cleanup for external scripts
setInterval(cleanEnvironment, 2000);
