"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoyaltyCard from "@/components/LoyaltyCard";
import Catalog from "@/components/Catalog";
import CartSheet from "@/components/CartSheet";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const { cart } = useApp();
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

      {/* Floating Checkout Bar */}
      {cart.length > 0 && (
        <div className="floating-checkout" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.65rem", color: "#ff85c0", fontWeight: "700", marginBottom: "2px" }}>
              {potentialPoints > 0 ? `+${potentialPoints} Poin Pilihan` : ""}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: "0.8", fontWeight: "600" }}>Total + Ongkir</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>
              Rp {subtotal.toLocaleString('id-ID')}
            </div>
          </div>
          <button className="checkout-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}>
            Checkout <i className="fa-solid fa-arrow-right" style={{ marginLeft: "8px" }}></i>
          </button>
        </div>
      )}

      <footer style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "0.8rem", borderTop: "1px solid rgba(176,39,98,0.05)", marginTop: "50px", background: "white" }}>
        <p>&copy; 2024 La Misha Bakehouse Metro. Dibuat dengan penuh rasa.</p>
      </footer>

      <CartSheet />
      <AuthModal />
    </>
  );
}
