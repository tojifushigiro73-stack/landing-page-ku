"use client";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

export default function LoyaltyCard() {
  const { loyaltyPoints, currentUser, setAuthModalMode, setIsRedeemingPoints, setIsCartOpen } = useApp();

  if (!loyaltyPoints && !currentUser) return null;

  const progress = (loyaltyPoints % 10) * 10;

  return (
    <section className="loyalty-section">
      <div className="container">
        <motion.div 
          className="loyalty-card gpu"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ 
            background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)", 
            color: "white", padding: "24px", borderRadius: "28px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column", gap: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            margin: "0 10px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ 
                background: "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)", 
                width: "48px", height: "48px", borderRadius: "16px", 
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(255,215,0,0.25)"
              }}>
                <i className="fa-solid fa-crown" style={{ color: "#fff", fontSize: "1.2rem" }}></i>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#a1a1aa", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>
                  {currentUser ? 'La Misha Member' : 'Guest Mode'}
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: "900", lineHeight: "1", color: "#fff" }}>
                  {loyaltyPoints} <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#d4d4d8" }}>Poin</span>
                </div>
              </div>
            </div>
            
            {!currentUser ? (
              <motion.button 
                onClick={() => setAuthModalMode('login')}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: "rgba(255,255,255,0.1)", color: "white", 
                  border: "1px solid rgba(255,255,255,0.15)", padding: "8px 16px", 
                  borderRadius: "999px", fontWeight: "800", fontSize: "0.7rem", 
                  cursor: "pointer", backdropFilter: "blur(10px)" 
                }}
              >
                SIMPAN
              </motion.button>
            ) : (
              <div style={{ fontSize: "0.65rem", background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", padding: "6px 12px", borderRadius: "999px", fontWeight: "800", letterSpacing: "0.5px" }}>
                PRO
              </div>
            )}
          </div>

          <div>
            <div style={{ background: "rgba(255,255,255,0.1)", height: "8px", borderRadius: "999px", overflow: "hidden" }}>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                style={{ background: "linear-gradient(90deg, #FFD700, #ff8c00)", height: "100%", borderRadius: "999px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.75rem", color: "#a1a1aa", fontWeight: "600" }}>
              <span>{loyaltyPoints % 10} / 10 Poin</span>
              {loyaltyPoints >= 10 ? (
                <motion.button 
                  onClick={() => {
                    setIsRedeemingPoints(true);
                    setIsCartOpen(true);
                    window.dispatchEvent(new CustomEvent('show-toast', { 
                      detail: { message: '🎁 Diskon poin otomatis diterapkan!', type: 'success' } 
                    }));
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    background: "linear-gradient(135deg, #FFD700 0%, #ff8c00 100%)", 
                    color: "white", border: "none", padding: "4px 12px", 
                    borderRadius: "999px", fontWeight: "800", fontSize: "0.65rem", 
                    cursor: "pointer", boxShadow: "0 4px 12px rgba(255,215,0,0.3)"
                  }}
                >
                  KLAIM DISKON
                </motion.button>
              ) : (
                <span style={{ color: "#a1a1aa" }}>Menuju Diskon</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
