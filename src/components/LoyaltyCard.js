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
              <div style={{ fontSize: "0.85rem", opacity: "0.9", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>Poin Pilihan Member</div>
              <div className="loyalty-balance" style={{ fontFamily: "var(--font-playfair)", fontSize: "2.8rem", fontWeight: "700", marginTop: "5px" }}>
                {loyaltyPoints} <span style={{ fontSize: "1.2rem", fontWeight: "400" }}>Poin</span>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <i className="fa-solid fa-crown" style={{ color: "#ffd700" }}></i>
            </div>
          </div>

          <div className="loyalty-progress-container" style={{ background: "rgba(0,0,0,0.15)", height: "10px", borderRadius: "10px", marginBottom: "15px", overflow: "hidden" }}>
            <div className="loyalty-progress-bar" style={{ width: `${progress}%`, background: "white", height: "100%", borderRadius: "10px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
          </div>

          <div className="loyalty-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
              {loyaltyPoints >= 10 ? '🎁 Siap ditukar diskon!' : `✨ Kurang ${10 - (loyaltyPoints % 10)} poin lagi untuk diskon.`}
            </div>
            {!currentUser ? (
              <button 
                className="loyalty-btn-mini" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
                style={{
                  background: "white", color: "var(--primary)", border: "none",
                  padding: "8px 16px", borderRadius: "50px", fontWeight: "700",
                  fontSize: "0.8rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}
              >Simpan Poin</button>
            ) : (
              <div style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "50px", fontWeight: "700", letterSpacing: "0.5px" }}>PRO LEVEL MEMBER</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
