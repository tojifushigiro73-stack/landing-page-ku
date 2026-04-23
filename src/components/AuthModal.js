"use client";
import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

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
        // User closed the popup, no need to alert or log as error
        return;
      }
      console.error("Login Error:", err);
      alert("Gagal login. Silakan coba lagi atau pastikan pop-up diperbolehkan di browser Anda.");
    }
  };

  if (!active) return null;

  return (
    <div className={`auth-overlay ${active ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && setActive(false)}>
      {view === "login" && (
        <div className="auth-modal">
          <button className="auth-close" onClick={() => setActive(false)} style={{
            position: "absolute", top: "15px", right: "15px", background: "#f5f5f5",
            border: "none", width: "36px", height: "36px", borderRadius: "50%",
            fontSize: "1.2rem", color: "#666", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", lineHeight: 1
          }}>&times;</button>
          
          <div className="auth-header">
            <div style={{
              width: "100px", height: "100px", margin: "0 auto 20px",
              background: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
              borderRadius: "24px", display: "flex", alignItems: "center",
              justifyContent: "center", boxShadow: "0 10px 20px rgba(176,39,98,0.1)"
            }}>
              <img src="/apple-touch-icon.png" alt="Logo" style={{ width: "70%", height: "auto" }} />
            </div>
            <h2 className="auth-title" style={{ fontFamily: "var(--font-playfair)", fontSize: "1.8rem", marginBottom: "12px" }}>Halo, Pecinta Kukis!</h2>
            <p className="auth-desc" style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "30px", lineHeight: "1.4" }}>
              Masuk untuk simpan poin belanja dan nikmati diskon khusus member La Misha.
            </p>
          </div>
          
          <button 
            className="google-btn" 
            onClick={handleLogin} 
            disabled={!auth}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "12px", background: "white", border: "1.5px solid #eee", padding: "14px",
              borderRadius: "16px", fontWeight: "700", color: "#3c4043", cursor: auth ? "pointer" : "wait",
              transition: "0.3s", fontSize: "0.95rem", opacity: auth ? 1 : 0.6
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "20px" }} />
            {auth ? "Lanjutkan dengan Google" : "Mempersiapkan..."}
          </button>

          <div className="auth-footer" style={{ marginTop: "30px", fontSize: "0.85rem", color: "#999" }}>
            Dengan masuk, Anda menyetujui <br />
            <a href="#" onClick={(e) => { e.preventDefault(); setView("terms"); }} style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>Syarat & Ketentuan</a> kami.
          </div>
        </div>
      )}

      {view === "logout" && (
        <div className="auth-modal" style={{ textAlign: "center", padding: "40px 30px" }}>
          <div style={{
            width: "80px", height: "80px", margin: "0 auto 24px",
            background: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
            borderRadius: "20px", display: "flex", alignItems: "center",
            justifyContent: "center", boxShadow: "0 10px 20px rgba(176,39,98,0.1)"
          }}>
            <img src="/apple-touch-icon.png" alt="Logo" style={{ width: "60%", height: "auto" }} />
          </div>
          
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "1.8rem", marginBottom: "12px", color: "#2d1b22" }}>Mau Keluar?</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "32px", lineHeight: "1.5" }}>
            Jangan khawatir, poin Pilihan Anda tetap aman tersimpan di akun Google Anda.
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button 
              onClick={() => setActive(false)} 
              style={{
                padding: "14px", borderRadius: "16px", border: "1.5px solid #eee",
                background: "white", color: "#666", fontWeight: "700", cursor: "pointer",
                transition: "0.3s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
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
        </div>
      )}

      {view === "terms" && (
        <div className="auth-modal terms-modal">
          <button className="auth-close" onClick={() => setView("login")}>&times;</button>
          <h2 className="auth-title">Syarat & Ketentuan</h2>
          <div className="terms-content">
            <p>Selamat datang di La Misha Bakehouse. Dengan menggunakan layanan kami, Anda menyetujui ketentuan berikut:</p>
            <h3>1. Akun & Poin</h3>
            <p>Poin pilihan diberikan untuk setiap transaksi kelipatan Rp 10.000. Poin tidak dapat diuangkan dan hanya berlaku untuk penukaran diskon di platform La Misha.</p>
            <h3>2. Pemesanan</h3>
            <p>Pesanan yang telah dikirim ke WhatsApp akan diproses setelah konfirmasi pembayaran diterima oleh admin kami.</p>
            <h3>3. Pengiriman</h3>
            <p>Radius pengiriman maksimal adalah 10km dari lokasi workshop kami di Kota Metro.</p>
            <button className="cta-btn" onClick={() => setView("login")} style={{ width: "100%", marginTop: "20px", border: "none" }}>SAYA MENGERTI</button>
          </div>
        </div>
      )}
    </div>
  );
}
