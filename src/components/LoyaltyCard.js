"use client";
import { useApp } from "@/context/AppContext";

export default function LoyaltyCard() {
  const { loyaltyPoints, currentUser } = useApp();

  if (!loyaltyPoints && !currentUser) return null;

  const progress = (loyaltyPoints % 10) * 10;

  return (
    <section className="loyalty-section">
      <div className="container">
        <div className="loyalty-card">
          <div className="loyalty-header">
            <div>
              <div className="loyalty-label" style={{ fontSize: "0.65rem", opacity: 0.8, fontWeight: "700", textTransform: "uppercase" }}>
                {currentUser ? 'Poin Pilihan Member' : 'Poin Sementara (Guest)'}
              </div>
              <div className="loyalty-balance">
                {loyaltyPoints} <span className="points-text" style={{ fontSize: "1rem", fontWeight: "400", opacity: 0.8 }}>Poin</span>
              </div>
              {!currentUser && loyaltyPoints > 0 && (
                <div style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "50px", display: "inline-block", marginTop: "8px" }}>
                  ⚠️ Belum tersimpan permanen
                </div>
              )}
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", width: "44px", height: "44px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-crown" style={{ color: currentUser ? "#ffd700" : "#ffffff" }}></i>
            </div>
          </div>

          <div className="loyalty-progress-container">
            <div className="loyalty-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="loyalty-footer">
            <div style={{ flex: 1, fontSize: "0.8rem", opacity: 0.85 }}>
              {currentUser ? (
                loyaltyPoints >= 10 ? '🎁 Siap ditukar diskon!' : `✨ Kurang ${10 - (loyaltyPoints % 10)} poin lagi untuk diskon.`
              ) : (
                'Yuk masuk ke akunmu biar poin yang kamu kumpulin nggak hilang! ✨'
              )}
            </div>
            {!currentUser ? (
              <button 
                style={{ background: "white", color: "var(--primary)", border: "none", padding: "8px 15px", borderRadius: "10px", fontWeight: "800", fontSize: "0.7rem", cursor: "pointer" }}
                onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
              >AMANKAN POIN</button>
            ) : (
              <div style={{ fontSize: "0.65rem", background: "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)", color: "#4a3b00", padding: "5px 12px", borderRadius: "50px", fontWeight: "800" }}>PRO MEMBER</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
