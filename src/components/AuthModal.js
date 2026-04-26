"use client";
import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

import { useApp } from "@/context/AppContext";

export default function AuthModal() {
  const { logout } = useApp();
  const [active, setActive] = useState(false);
  const [view, setView] = useState("login"); // login, terms, logout

  useEffect(() => {
    const openAuth = () => { setView("login"); setActive(true); };
    const openLogout = () => { setView("logout"); setActive(true); };
    const close = () => setActive(false);

    window.addEventListener('open-auth', openAuth);
    window.addEventListener('open-logout', openLogout);
    window.addEventListener('close-modals', close);

    return () => {
      window.removeEventListener('open-auth', openAuth);
      window.removeEventListener('open-logout', openLogout);
      window.removeEventListener('close-modals', close);
    };
  }, []);

  const handleLogin = async () => {
    if (!auth || !provider) return;
    try {
      await signInWithPopup(auth, provider);
      setActive(false);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error("Login Error:", err);
      alert("Gagal login. Silakan coba lagi atau pastikan pop-up diperbolehkan di browser Anda.");
    }
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div 
          className="auth-overlay active" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setActive(false)}
        >
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div 
                key="login"
                className="auth-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <button className="auth-close" onClick={() => setActive(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
                
                <div className="auth-header">
                  <div style={{
                    width: "100px", height: "100px", margin: "0 auto 20px",
                    background: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
                    borderRadius: "24px", display: "flex", alignItems: "center",
                    justifyContent: "center", boxShadow: "0 10px 20px rgba(176,39,98,0.1)"
                  }}>
                    <img src="/apple-touch-icon.png" alt="Logo" style={{ width: "70%", height: "auto" }} />
                  </div>
                  <h2 className="auth-title">Halo, Pecinta Kukis!</h2>
                  <p className="auth-desc">
                    Masuk untuk simpan poin belanja dan nikmati diskon khusus member La Misha.
                  </p>
                </div>
                
                <button 
                  className="google-btn" 
                  onClick={handleLogin} 
                  disabled={!auth}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "20px" }} />
                  {auth ? "Lanjutkan dengan Google" : "Mempersiapkan..."}
                </button>

                <div className="auth-footer" style={{ marginTop: "30px", fontSize: "0.85rem", color: "#999" }}>
                  Dengan masuk, Anda menyetujui <br />
                  <a href="#" onClick={(e) => { e.preventDefault(); setView("terms"); }} style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>Syarat & Ketentuan</a> kami.
                </div>
              </motion.div>
            )}

            {view === "logout" && (
              <motion.div 
                key="logout"
                className="auth-modal" 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{ textAlign: "center", padding: "40px 30px" }}
              >
                <div style={{
                  width: "80px", height: "80px", margin: "0 auto 24px",
                  background: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
                  borderRadius: "20px", display: "flex", alignItems: "center",
                  justifyContent: "center", boxShadow: "0 10px 20px rgba(176,39,98,0.1)"
                }}>
                  <img src="/apple-touch-icon.png" alt="Logo" style={{ width: "60%", height: "auto" }} />
                </div>
                
                <h2 className="auth-title" style={{ color: "#2d1b22" }}>Mau Keluar?</h2>
                <p className="auth-desc" style={{ marginBottom: "32px" }}>
                  Jangan khawatir, poin Pilihan Anda tetap aman tersimpan di akun Google Anda.
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button 
                    className="opt-btn"
                    onClick={() => setActive(false)} 
                    style={{
                      padding: "14px", borderRadius: "16px", border: "1.5px solid #eee",
                      background: "white", color: "#666", fontWeight: "700", cursor: "pointer",
                      transition: "0.3s", textAlign: "center", justifyContent: "center"
                    }}
                  >BATAL</button>
                  <button 
                    onClick={() => { logout(); setActive(false); }} 
                    style={{
                      padding: "14px", borderRadius: "16px", border: "none",
                      background: "var(--primary)", color: "white", fontWeight: "700", cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(176,39,98,0.2)", transition: "0.3s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >KELUAR</button>
                </div>
              </motion.div>
            )}

            {view === "terms" && (
              <motion.div 
                key="terms"
                className="auth-modal terms-modal"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <button className="auth-close" onClick={() => setView("login")}>
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h2 className="auth-title">Syarat & Ketentuan</h2>
                <div className="terms-content">
                  <p>Selamat datang di La Misha Bakehouse. Dengan menggunakan layanan kami, Anda menyetujui ketentuan berikut:</p>
                  <h3>1. Akun & Poin</h3>
                  <p>Poin pilihan diberikan untuk setiap transaksi kelipatan Rp 10.000. Poin tidak dapat diuangkan dan hanya berlaku untuk penukaran diskon di platform La Misha.</p>
                  <h3>2. Pemesanan</h3>
                  <p>Pesanan yang telah dikirim ke WhatsApp akan diproses setelah konfirmasi pembayaran diterima oleh admin kami.</p>
                  <h3>3. Pengiriman</h3>
                  <p>Radius pengiriman maksimal adalah 10km dari lokasi workshop kami di Kota Metro.</p>
                  <h3>4. Perlindungan Data & Akun</h3>
                  <p>Kami menggunakan layanan Google Authentication untuk keamanan akun Anda. Data yang kami akses hanyalah profil dasar (nama, email) guna manajemen poin member, dan kami menjamin kerahasiaan data tersebut tanpa membagikannya ke pihak ketiga.</p>
                </div>
                <button className="cta-btn" onClick={() => setView("login")} style={{ width: "100%", marginTop: "20px", border: "none" }}>SAYA MENGERTI</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
