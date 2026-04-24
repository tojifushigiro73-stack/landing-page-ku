"use client";
import { useApp } from "@/context/AppContext";

export default function LoyaltyCard() {
  const { loyaltyPoints, currentUser } = useApp();

  if (!loyaltyPoints && !currentUser) return null;

  const progress = (loyaltyPoints % 10) * 10;

  return (
    <section className="loyalty-section" style={{ padding: "20px 0" }}>
      <div className="container">
        <div className="loyalty-card" style={{
          background: "linear-gradient(135deg, #b02762 0%, #8a1d4d 100%)",
          borderRadius: "28px", padding: "30px", color: "white", position: "relative",
          overflow: "hidden", boxShadow: "0 20px 40px rgba(138, 29, 77, 0.25)"
        }}>
          {/* Decorative Pattern */}
          <div style={{
            position: "absolute", top: "-20px", right: "-20px", fontSize: "8rem",
            opacity: "0.1", transform: "rotate(-15deg)", pointerEvents: "none"
          }}>
            <i className="fa-solid fa-crown"></i>
          </div>

          <div className="loyalty-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "0.85rem", opacity: "0.9", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>
                {currentUser ? 'Poin Pilihan Member' : 'Poin Sementara (Guest)'}
              </div>
              <div className="loyalty-balance" style={{ fontFamily: "var(--font-playfair)", fontSize: "2.8rem", fontWeight: "700", marginTop: "5px" }}>
                {loyaltyPoints} <span style={{ fontSize: "1.2rem", fontWeight: "400" }}>Poin</span>
              </div>
              {!currentUser && loyaltyPoints > 0 && (
                <div style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "50px", display: "inline-block", marginTop: "5px", fontWeight: "700" }}>
                  ⚠️ Belum tersimpan permanen
                </div>
              )}
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-crown" style={{ color: currentUser ? "#ffd700" : "#ffffff" }}></i>
            </div>
          </div>

          <div className="loyalty-progress-container" style={{ background: "rgba(0,0,0,0.15)", height: "10px", borderRadius: "10px", marginBottom: "15px", overflow: "hidden" }}>
            <div className="loyalty-progress-bar" style={{ width: `${progress}%`, background: "white", height: "100%", borderRadius: "10px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
          </div>

          <div className="loyalty-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: "600", lineHeight: "1.2" }}>
              {currentUser ? (
                loyaltyPoints >= 10 ? '🎁 Siap ditukar diskon!' : `✨ Kurang ${10 - (loyaltyPoints % 10)} poin lagi untuk diskon.`
              ) : (
                'Yuk masuk ke akunmu biar poin yang kamu kumpulin nggak hilang & bisa ditukar diskon nanti! ✨'
              )}
            </div>
            {!currentUser ? (
              <button 
                className="loyalty-btn-mini" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
                style={{
                  background: "white", color: "var(--primary)", border: "none",
                  padding: "10px 20px", borderRadius: "50px", fontWeight: "800",
                  fontSize: "0.75rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                  whiteSpace: "nowrap", transition: "all 0.3s ease"
                }}
              >AMANKAN POIN</button>
            ) : (
              <div style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "50px", fontWeight: "700", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>PRO MEMBER</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
