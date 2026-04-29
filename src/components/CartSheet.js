"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, doc, serverTimestamp, writeBatch, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            className="overlay active" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div 
            className="sheet active"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="handle"></div>

            {peekedProduct && (
              <button
                onClick={() => { closePeek(); setIsCartOpen(false); }}
                className="peek-close-btn"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            )}

            <div id="sheet-body">
              <AnimatePresence mode="wait">
                {peekedProduct ? (
                  <motion.div
                    key="peek"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ProductPeek p={peekedProduct} close={() => { closePeek(); setIsCartOpen(false); }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CartView />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductPeek({ p, close }) {
  const { addToCart } = useApp();
  return (
    <div className="peek-grid gpu">
      <motion.div 
        className="peek-img-wrap"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.img 
          src={p.i} 
          className="peek-img" 
          alt={p.n} 
          loading="lazy"
          decoding="async"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />
        <div className="peek-badge">{p.b}</div>
      </motion.div>
      <div className="peek-info">
        <motion.h2 
          className="peek-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >{p.n}</motion.h2>
        <motion.p 
          className="peek-desc"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >{p.d}</motion.p>

        <motion.p 
          className="peek-variation-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >Pilih Varian / Berat:</motion.p>

        <motion.div 
          className="peek-options"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {p.opts.map((o, idx) => (
            <motion.button
              key={idx}
              className="opt-btn"
              onClick={(e) => { addToCart(p, o, e); close(); }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="opt-label">{o.l}</span>
              <span className="opt-price">Rp {o.p.toLocaleString('id-ID')}</span>
            </motion.button>
          ))}
        </motion.div>
        <motion.button 
          onClick={close} 
          className="peek-back-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >KEMBALI KE MENU</motion.button>
      </div>
    </div>
  );
}

import dynamic from 'next/dynamic';
const Map = dynamic(() => import('./Map'), { ssr: false });

import { calcOngkir, calculateRedeem, calcPotentialPoints } from "@/lib/orderUtils";

function CartView() {
  const { cart, setCart, removeFromCart, loyaltyPoints, isRedeemingPoints, setIsRedeemingPoints, customerName, setCustomerName, distance, setDistance, setLocation, currentUser, location, setAuthModalMode } = useApp();
  const [addressQuery, setAddressQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.p, 0);
  const { discount, pointsUsed } = calculateRedeem(isRedeemingPoints, loyaltyPoints);
  const potentialPoints = calcPotentialPoints(subtotal);
  const isTooFar = distance > 10;
  const ongkir = calcOngkir(distance, cart.length);

  const total = subtotal + (ongkir === -1 ? 0 : ongkir) - discount;

  const handleWA = async () => {
    if (!cart.length) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Keranjang belanja masih kosong!', type: 'error' } }));
      return;
    }
    if (!location) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Silakan pilih lokasi pengiriman pada peta terlebih dahulu!', type: 'info' } }));
      return;
    }
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const orderRef = doc(collection(db, "orders"));
      const orderId = orderRef.id;

      const orderData = {
        orderId: orderId,
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
        pointsUsed: pointsUsed
      };

      // 1. Simpan Order
      batch.set(orderRef, orderData);

      // 2. Jika Redeem, Kurangi Poin & Catat Transaksi
      if (pointsUsed > 0 && currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        batch.update(userRef, {
            points: increment(-pointsUsed)
        });

        const txRef = doc(collection(db, "point_transactions"));
        batch.set(txRef, {
            userId: currentUser.uid,
            orderId: orderId,
            type: "REDEEM",
            amount: pointsUsed,
            description: `Tukar poin untuk diskon pesanan #${orderId.slice(-5).toUpperCase()}`,
            createdAt: serverTimestamp()
        });
      }

      // 3. Commit Batch
      await batch.commit();
      console.log("Order & Points Sync success with ID: ", orderId);

      // 4. Siapkan Pesan WA
      let msg = `Halo La Misha! Saya *${customerName || 'Pelanggan'}* ingin pesan (ID: ${orderId.slice(-5)}):\n\n`;
      cart.forEach(i => msg += `• ${i.n} (${i.l}) - Rp ${i.p.toLocaleString('id-ID')}\n`);
      msg += `\nSubtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;
      msg += `Ongkir: ${isTooFar ? '*Tanya via WA*' : (ongkir === 0 ? 'GRATIS' : 'Rp ' + ongkir.toLocaleString('id-ID'))}\n`;
      if (discount > 0) msg += `Diskon Poin: -Rp ${discount.toLocaleString('id-ID')} (Gunakan ${pointsUsed} Poin)\n`;
      msg += `Estimasi Poin Masuk: +${potentialPoints} Poin\n`;
      msg += `*Grand Total: Rp ${total.toLocaleString('id-ID')}*\n\n`;
      msg += `ID Pelanggan: ${currentUser ? currentUser.email : 'Guest/Bukan Member'}\n\n`;
      msg += isTooFar ? `Mohon info ongkirnya ya kak karena lokasi saya cukup jauh. 😊` : `Saya akan segera upload bukti transfernya. 😊`;
      
      const waUrl = `https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`;

      // Buka WA & Reset
      window.location.href = waUrl;
      
      setCart([]);
      localStorage.removeItem('cart_v17');
      window.dispatchEvent(new CustomEvent('close-modals'));
    } catch (err) {
      console.error("Order Save Error:", err);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal menyimpan pesanan. Silakan coba lagi.", type: 'error' } }));
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
            onClick={() => setAuthModalMode('login')}
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
          <span className="copy-btn" style={{ color: "var(--primary)", fontWeight: "800", cursor: "pointer" }} onClick={() => { 
            navigator.clipboard.writeText("009801076603506"); 
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Nomor BRI disalin!", type: 'success' } }));
          }}>SALIN</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span>DANA/GOPAY: 082348315200<br /><small style={{ color: "var(--text-muted)" }}>a/n Ferina Pratiwi</small></span>
          <span className="copy-btn" style={{ color: "var(--primary)", fontWeight: "800", cursor: "pointer" }} onClick={() => { 
            navigator.clipboard.writeText("082348315200"); 
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Nomor DANA/GOPAY disalin!", type: 'success' } }));
          }}>SALIN</span>
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
