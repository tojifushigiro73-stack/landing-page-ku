"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoyaltyCard from "@/components/LoyaltyCard";
import Catalog from "@/components/Catalog";
import CartSheet from "@/components/CartSheet";
import AuthModal from "@/components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { cart, currentUser } = useApp();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mencegah layar putih saat pemuatan awal
  if (!isClient) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff2f6" }}>
      <img src="/apple-touch-icon.png" style={{ width: "80px", opacity: 0.5 }} alt="Loading..." />
    </div>
  );

  const subtotal = cart.reduce((s, i) => s + i.p, 0);
  const potentialPoints = Math.floor(subtotal / 10000);

  return (
    <>
      <Navbar />
      <Hero />
      <div className="container" style={{ marginTop: "30px" }}>
        <LoyaltyCard />
      </div>
      <Catalog />

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            className="floating-checkout"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div style={{ flex: 1 }}>
              {potentialPoints > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div className="points-badge" style={{ width: "fit-content" }}>
                    <i className="fa-solid fa-gift" style={{ marginRight: "5px" }}></i>
                    +{potentialPoints} Poin Pilihan
                  </div>
                  {!currentUser && (
                    <div style={{ fontSize: "0.6rem", color: "#ffd1e3", opacity: "0.9", fontWeight: "600" }}>
                      *Khusus Member: Login untuk klaim poin ini.
                    </div>
                  )}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", opacity: "0.8", fontWeight: "600", color: "#ffd1e3" }}>Estimasi Total</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "800", letterSpacing: "0.5px" }}>
                Rp {subtotal.toLocaleString('id-ID')}
              </div>
            </div>
            <button className="checkout-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}>
              Checkout <i className="fa-solid fa-arrow-right"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "0.8rem", borderTop: "1px solid rgba(176,39,98,0.05)", marginTop: "50px", background: "white" }}>
        <p>&copy; 2024 La Misha Bakehouse Metro. Dibuat dengan penuh rasa.</p>
      </footer>

      <CartSheet />
      <AuthModal />
    </>
  );
}
