"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CartSheet() {
  const { cart, removeFromCart, loyaltyPoints, isRedeemingPoints, setIsRedeemingPoints, customerName, setCustomerName, distance, setDistance, isCartOpen, setIsCartOpen, peekedProduct, closePeek } = useApp();

  useEffect(() => {
    const openCart = () => { closePeek(); setIsCartOpen(true); };
    const close = () => { setIsCartOpen(false); closePeek(); };

    window.addEventListener('open-cart', openCart);
    window.addEventListener('close-modals', close);

    return () => {
      window.removeEventListener('open-cart', openCart);
      window.removeEventListener('close-modals', close);
    };
  }, []);

  if (!isCartOpen) return null;

  return (
    <>
      <div className={`overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`sheet ${isCartOpen ? 'active' : ''}`}>
        <div className="handle"></div>

        {peekedProduct && (
          <button
            onClick={() => { closePeek(); setIsCartOpen(false); }}
            style={{
              position: "absolute", top: "20px", left: "20px", background: "#f5f5f5",
              border: "none", width: "40px", height: "40px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#333", zIndex: 10
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        )}

        <div id="sheet-body">
          {peekedProduct ? (
            <ProductPeek p={peekedProduct} close={() => { closePeek(); setIsCartOpen(false); }} />
          ) : (
            <CartView />
          )}
        </div>
      </div>
    </>
  );
}

function ProductPeek({ p, close }) {
  const { addToCart } = useApp();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
      <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <img src={p.i} style={{ width: "100%", height: "auto", display: "block" }} alt={p.n} />
        <div style={{ position: "absolute", top: "15px", left: "15px", background: "var(--accent)", color: "white", padding: "5px 12px", borderRadius: "50px", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase" }}>{p.b}</div>
      </div>
      <div>
        <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", color: "var(--primary)", marginBottom: "8px" }}>{p.n}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "1rem", lineHeight: "1.5" }}>{p.d}</p>

        <p style={{ fontWeight: "800", marginBottom: "15px", color: "#2d1b22", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pilih Varian / Berat:</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {p.opts.map((o, idx) => (
            <button
              key={idx}
              className="opt-btn"
              onClick={(e) => { addToCart(p, o, e); close(); }}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", background: "white", border: "1.5px solid #eee",
                borderRadius: "16px", cursor: "pointer", transition: "all 0.3s ease",
                textAlign: "left"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "#fff9fb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.background = "white"; }}
            >
              <span style={{ fontWeight: "600", color: "#444" }}>{o.l}</span>
              <span style={{ fontWeight: "800", color: "var(--primary)", fontSize: "1.05rem" }}>Rp {o.p.toLocaleString('id-ID')}</span>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={close}
        style={{ width: "100%", background: "#f5f5f5", color: "#666", border: "none", padding: "14px", borderRadius: "16px", fontWeight: "700", cursor: "pointer", marginTop: "10px" }}
      >KEMBALI KE MENU</button>
    </div>
  );
}

import dynamic from 'next/dynamic';
const Map = dynamic(() => import('./Map'), { ssr: false });

function CartView() {
  const { cart, setCart, removeFromCart, loyaltyPoints, isRedeemingPoints, setIsRedeemingPoints, customerName, setCustomerName, distance, setDistance, setLocation, currentUser, location } = useApp();
  const [addressQuery, setAddressQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.p, 0);
  const discount = (isRedeemingPoints && loyaltyPoints >= 10) ? Math.floor(loyaltyPoints / 10) * 5000 : 0;
  const potentialPoints = Math.floor(subtotal / 10000);
  const isTooFar = distance > 10;

  // Logic: < 5km (Free), 5-7km (5rb), > 7km (ceil * 2rb), 3+ items within 7km (Free)
  let ongkir = 0;
  if (distance > 0 && distance <= 10) {
    if (cart.length >= 3 && distance <= 7) {
      ongkir = 0;
    } else if (distance <= 5) {
      ongkir = 0;
    } else if (distance <= 7) {
      ongkir = 5000;
    } else {
      ongkir = Math.ceil(distance) * 2000;
    }
  }

  const total = subtotal + ongkir - discount;

  const handleWA = async () => {
    if (!cart.length) return alert('Keranjang belanja masih kosong!');
    if (!location) return alert('Silakan pilih lokasi pengiriman pada peta terlebih dahulu!');
    
    setLoading(true);
    try {
      // 1. Siapkan Reference & ID secara instan (Client-side)
      // Hubungan Graph: [[Firestore Save]] <---> [[Business Strategies]] & [[Cek Mutasi Otomatis]]
      const orderRef = doc(collection(db, "orders"));
      const orderId = orderRef.id;

      const orderData = {
        orderId: orderId, // Simpan ID di dalam dokumen juga untuk referensi
        userId: currentUser ? currentUser.uid : "GUEST",
        userName: customerName || (currentUser ? currentUser.name : "Pelanggan"),
        userEmail: currentUser ? currentUser.email : "Guest",
        items: cart,
        subtotal,
        ongkir,
        discount,
        total,
        distance,
        location: location ? { lat: Number(location.lat), lng: Number(location.lng) } : null,
        status: "MENUNGGU PEMBAYARAN",
        createdAt: serverTimestamp(),
        pointsGained: potentialPoints,
        pointsUsed: (isRedeemingPoints && loyaltyPoints >= 10) ? Math.floor(loyaltyPoints / 10) * 10 : 0
      };

      // 2. Siapkan Pesan WA (Bisa langsung dilakukan karena ID sudah ada)
      let msg = `Halo La Misha! Saya *${customerName || 'Pelanggan'}* ingin pesan (ID: ${orderId.slice(-5)}):\n\n`;
      cart.forEach(i => msg += `• ${i.n} (${i.l}) - Rp ${i.p.toLocaleString('id-ID')}\n`);
      msg += `\nSubtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;
      msg += `Ongkir: ${isTooFar ? '*Tanya via WA*' : (ongkir === 0 ? 'GRATIS' : 'Rp ' + ongkir.toLocaleString('id-ID'))}\n`;
      if (discount > 0) msg += `Diskon Poin: -Rp ${discount.toLocaleString('id-ID')} (Gunakan ${Math.floor(loyaltyPoints / 10) * 10} Poin)\n`;
      msg += `Estimasi Poin Masuk: +${potentialPoints} Poin\n`;
      msg += `*Grand Total: Rp ${total.toLocaleString('id-ID')}*\n\n`;
      msg += `ID Pelanggan: ${currentUser ? currentUser.email : 'Guest/Bukan Member'}\n\n`;
      msg += isTooFar ? `Mohon info ongkirnya ya kak karena lokasi saya cukup jauh. 😊` : `Saya akan segera upload bukti transfernya. 😊`;
      
      const waUrl = `https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`;

      // 3. Simpan ke Firestore (Kita await agar data pasti masuk sebelum user pindah halaman)
      // Namun proses ini sekarang lebih cepat karena ID tidak perlu di-generate oleh server lagi.
      await setDoc(orderRef, orderData);
      console.log("Order saved with ID: ", orderId);

      // 4. Buka WA & Reset
      window.location.href = waUrl;
      
      setCart([]);
      localStorage.removeItem('cart_v17');
      window.dispatchEvent(new CustomEvent('close-modals'));
    } catch (err) {
      console.error("Order Save Error:", err);
      alert("Gagal menyimpan pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const searchAddress = async () => {
    if (!addressQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery + ' Metro Lampung')}&limit=1`);
      const d = await res.json();
      if (d[0]) {
        const ll = { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
        setLocation(ll);
        window.dispatchEvent(new CustomEvent('map-move', { detail: ll }));
      }
    } catch (err) { console.error(err); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation tidak didukung browser Anda.");
    navigator.geolocation.getCurrentPosition((pos) => {
      const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(ll);
      window.dispatchEvent(new CustomEvent('map-move', { detail: ll }));
    }, (err) => {
      alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
    });
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('close-modals'))}
          onMouseEnter={(e) => e.currentTarget.style.background = "#fae1eb"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#fdf2f6"}
          style={{
            background: "#fdf2f6", border: "none", width: "38px", height: "38px",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--primary)", transition: "all 0.3s ease"
          }}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "1.6rem", color: "var(--primary)" }}>Cek Pesanan</h2>
      </div>


      {/* LOYALTY BOX */}
      {!currentUser ? (
        <div style={{ 
          background: "linear-gradient(135deg, #fff9f0 0%, #fff4e6 100%)", 
          border: "1.5px dashed #e67e22", 
          borderRadius: "20px", padding: "18px", marginBottom: "24px", 
          position: "relative", overflow: "hidden"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "1.8rem" }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#d35400", fontSize: "0.95rem" }}>Simpan Poinmu Yuk?</div>
              <p style={{ fontSize: "0.75rem", color: "#666", lineHeight: "1.4" }}>Masuk ke akunmu biar poin belanjamu tetap aman dan bisa ditukar diskon nanti. Sayang kan kalau hilang! 😊</p>
            </div>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
            style={{ 
              width: "100%", background: "#e67e22", color: "white", border: "none", 
              padding: "10px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", 
              fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <i className="fa-solid fa-right-to-bracket"></i> MASUK / DAFTAR MEMBER
          </button>
        </div>
      ) : (
        <div style={{ 
          background: "#fff9f0", border: "1px dashed #e67e22", borderRadius: "16px", 
          padding: "15px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" 
        }}>
          <div style={{ fontSize: "2rem" }}>🎁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#d35400", fontSize: "0.9rem" }}>Poin Pilihan Anda</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>{loyaltyPoints} Poin</div>
          </div>
          {loyaltyPoints >= 10 ? (
            <button onClick={() => setIsRedeemingPoints(!isRedeemingPoints)} style={{ background: isRedeemingPoints ? "#e74c3c" : "var(--primary)", color: "white", border: "none", padding: "8px 15px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
              {isRedeemingPoints ? 'BATAL' : 'TUKAR'}
            </button>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "#888", fontStyle: "italic", width: "80px", textAlign: "right" }}>Min. 10 Poin</div>
          )}
        </div>
      )}

      {/* ITEMS LIST */}
      <div style={{ marginBottom: "24px" }}>
        {cart.map((item, idx) => (
          <div key={idx} className="summary-item" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{item.n}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.l}</div>
            </div>
            <span style={{ fontWeight: "600" }}>
              Rp {item.p.toLocaleString('id-ID')}
              <i className="fa-solid fa-trash" style={{ color: "#ff7675", cursor: "pointer", marginLeft: "10px" }} onClick={() => removeFromCart(idx)}></i>
            </span>
          </div>
        ))}
      </div>

      {/* BANK BOX */}
      <div className="bank-box" style={{ background: "#fdf2f6", padding: "16px", borderRadius: "16px", marginBottom: "24px", border: "1px dashed var(--primary-light)" }}>
        <p style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "10px" }}>💳 Pembayaran Transfer</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
          <span>BRI: 009801076603506<br /><small style={{ color: "var(--text-muted)" }}>a/n Rendy Sena Giwandita</small></span>
          <span className="copy-btn" style={{ color: "var(--primary)", fontWeight: "800", cursor: "pointer" }} onClick={() => { navigator.clipboard.writeText("009801076603506"); alert("Salin!"); }}>SALIN</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span>DANA/GOPAY: 082348315200<br /><small style={{ color: "var(--text-muted)" }}>a/n Ferina Pratiwi</small></span>
          <span className="copy-btn" style={{ color: "var(--primary)", fontWeight: "800", cursor: "pointer" }} onClick={() => { navigator.clipboard.writeText("082348315200"); alert("Salin!"); }}>SALIN</span>
        </div>
      </div>

      {/* LOCATION SECTION */}
      <div className="map-section" style={{ marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "24px" }}>
        <p style={{ fontWeight: 700, marginBottom: "15px" }}>📍 Lokasi Pengiriman</p>
        <input
          type="text" placeholder="Nama Penerima" className="loc-input"
          style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "10px" }}
          value={customerName} onChange={(e) => setCustomerName(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text" placeholder="Cari Alamat..." className="loc-input"
            style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #eee" }}
            value={addressQuery} onChange={(e) => setAddressQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
          />
          <button
            onClick={searchAddress}
            style={{ padding: "0 15px", background: "var(--primary)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer" }}
          >Cari</button>
        </div>

        <button
          onClick={useMyLocation}
          className="loc-btn"
          style={{ width: "100%", background: "#fff", border: "1.5px solid var(--primary)", color: "var(--primary)", padding: "12px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <i className="fa-solid fa-location-crosshairs"></i> Gunakan Lokasi Saya
        </button>

        <div style={{ fontSize: "0.85rem", color: isTooFar ? "#d35400" : "var(--primary)", fontWeight: 700, marginBottom: "10px" }}>
          {distance > 0 ? (isTooFar ? `📍 Lokasi cukup jauh (${distance} km)` : `Jarak: ${distance}km | Ongkir: ${ongkir === 0 ? 'GRATIS' : 'Rp ' + ongkir.toLocaleString('id-ID')}`) : "Seret titik atau klik lokasi di peta"}
        </div>
        <Map distance={distance} setDistance={setDistance} setLocation={setLocation} />
      </div>

      {/* TOTALS */}
      <div style={{ marginTop: "24px", borderTop: "2px solid #f0f0f0", paddingTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span>Subtotal</span><span style={{ fontWeight: "600" }}>Rp {subtotal.toLocaleString('id-ID')}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}><span>Ongkir</span><span style={{ fontWeight: "600" }}>{isTooFar ? 'Tanya di WA' : (ongkir === 0 ? 'GRATIS' : 'Rp ' + ongkir.toLocaleString('id-ID'))}</span></div>
        {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#e74c3c", fontWeight: 700 }}><span>Diskon Poin</span><span>-Rp {discount.toLocaleString('id-ID')}</span></div>}
        {potentialPoints > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600" }}>Estimasi Poin Baru</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontWeight: "700", color: "var(--primary)" }}>+{potentialPoints} Poin</span>
              {!currentUser && <div style={{ fontSize: "0.6rem", color: "#999" }}>*Khusus Member: Login untuk klaim</div>}
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)", marginTop: "10px" }}>
          <span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
        <button onClick={handleWA} disabled={loading} className="cta-btn" style={{ width: "100%", border: "none", marginTop: "20px", background: loading ? "#ccc" : (isTooFar ? "#e67e22" : "#27ae60"), cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? 'MEMPROSES...' : (isTooFar ? 'TANYA ONGKIR VIA WHATSAPP' : 'KIRIM KE WHATSAPP')} <i className="fa-brands fa-whatsapp" style={{ marginLeft: "8px" }}></i>
        </button>
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#999", marginTop: "15px", fontStyle: "italic", lineHeight: "1.5" }}>
          *Poin akan ditambahkan/dikurangi secara otomatis setelah pembayaran Anda dikonfirmasi oleh Admin.<br />
          {!currentUser && <span style={{ color: "var(--primary)", fontWeight: "600" }}>💡 Tips: Masuk ke akunmu yuk, biar poin dari pesanan ini otomatis tersimpan buatmu!</span>}
        </p>
      </div>
    </>
  );
}
