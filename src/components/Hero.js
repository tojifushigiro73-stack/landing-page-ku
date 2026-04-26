"use client";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

export default function Hero() {
  const { openWhatsApp } = useApp();
  
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <section className="hero">
      <div className="container hero-content">
        <motion.h1 
          {...fadeInUp}
        >
          Kue rumahan<br /><span className="accent-text"> Rasa Premium</span>
        </motion.h1>
        
        <motion.p 
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          Pilihan kue rumahan terbaik di Kota Metro. Dibuat dengan cinta setiap hari untuk Anda.
        </motion.p>
        
        <motion.div 
          className="hero-btns"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
        >
          <a href="#menu" className="cta-btn">Pesan Sekarang</a>
          <button 
            onClick={() => openWhatsApp("Halo La Misha, saya mau tanya-tanya dulu dong seputar kue-nya...")}
            className="cta-btn wa-hero-btn"
          >
            <i className="fa-brands fa-whatsapp"></i> Tanya via WhatsApp
          </button>
        </motion.div>
      </div>
    </section>
  );
}
