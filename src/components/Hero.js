"use client";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

export default function Hero() {
  const { openWhatsApp, setTheme } = useApp();
  
  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <section className="hero">
      <div className="container hero-content">
        <motion.h1 {...fadeUp}>
          Kue rumahan<br /><span className="accent-text"> Rasa Premium</span>
        </motion.h1>
        
        <motion.p 
          {...fadeUp} 
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          Pilihan kue rumahan terbaik di Kota Metro. Dibuat dengan cinta setiap hari untuk Anda.
        </motion.p>
        
        <motion.div 
          className="hero-btns"
          style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "35px", width: "100%", maxWidth: "320px", margin: "35px auto 0", alignItems: "center" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.a 
            href="#menu" 
            className="cta-btn main-cta"
            whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(216, 27, 96, 0.35)" }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: "linear-gradient(135deg, var(--primary) 0%, #ff4081 100%)",
              border: "none", padding: "18px 32px", fontSize: "0.95rem", width: "100%", textAlign: "center",
              boxShadow: "0 10px 25px rgba(216, 27, 96, 0.25)", borderRadius: "999px",
              justifyContent: "center"
            }}
          >
            LIHAT MENU 
            <motion.i 
              className="fa-solid fa-arrow-down" 
              style={{ marginLeft: "8px" }}
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.a>

          <motion.button 
            onClick={() => openWhatsApp("Halo La Misha, saya mau tanya-tanya dulu dong seputar kue-nya...")}
            animate={{ 
              y: [0, -4, 0],
              boxShadow: [
                "0 4px 10px rgba(0,0,0,0.05)",
                "0 10px 25px rgba(37, 211, 102, 0.35)",
                "0 4px 10px rgba(0,0,0,0.05)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: "#ffffff", color: "#20bd5a", 
              border: "1px solid #e0e0e0", borderRadius: "999px",
              padding: "12px 24px", fontSize: "0.85rem", fontWeight: "800", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.2rem" }}></i>
            Tanya Admin via WhatsApp
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
