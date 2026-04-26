"use client";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

export default function LoyaltyCard() {
  const { loyaltyPoints, currentUser } = useApp();

  if (!loyaltyPoints && !currentUser) return null;

  const progress = (loyaltyPoints % 10) * 10;

  return (
    <section className="loyalty-section">
      <div className="container">
        <motion.div 
          className="loyalty-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="loyalty-pattern">
            <i className="fa-solid fa-crown"></i>
          </div>

          <div className="loyalty-header">
            <div>
              <div className="loyalty-label">
                {currentUser ? 'Poin Pilihan Member' : 'Poin Sementara (Guest)'}
              </div>
              <div className="loyalty-balance">
                {loyaltyPoints} <span className="points-text">Poin</span>
              </div>
              {!currentUser && loyaltyPoints > 0 && (
                <div className="loyalty-warning">
                  ⚠️ Belum tersimpan permanen
                </div>
              )}
            </div>
            <div className="loyalty-icon-wrap">
              <i className="fa-solid fa-crown" style={{ color: currentUser ? "#ffd700" : "#ffffff" }}></i>
            </div>
          </div>

          <div className="loyalty-progress-container">
            <div className="loyalty-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="loyalty-footer">
            <div className="loyalty-status-text">
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
              >AMANKAN POIN</button>
            ) : (
              <div className="pro-member-badge">PRO MEMBER</div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
