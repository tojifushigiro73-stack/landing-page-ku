"use client";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

export default function Hero() {
  const { openWhatsApp } = useApp();
  
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
          style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.a 
            href="#menu" 
            className="cta-btn"
            whileTap={{ scale: 0.96 }}
          >Pesan Sekarang</motion.a>
          <motion.button 
            onClick={() => openWhatsApp("Halo La Misha, saya mau tanya-tanya dulu dong seputar kue-nya...")}
            className="cta-btn wa-hero-btn"
            whileTap={{ scale: 0.96 }}
          >
            <i className="fa-brands fa-whatsapp"></i> Tanya via WhatsApp
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
