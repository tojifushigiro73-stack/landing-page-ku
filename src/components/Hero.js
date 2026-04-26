"use client";
import { useApp } from "@/context/AppContext";

export default function Hero() {
  const { openWhatsApp } = useApp();
  
  return (
    <section className="hero">
      <div className="container hero-content">
        <h1>
          Kue rumahan<br /><span className="accent-text"> Rasa Premium</span>
        </h1>
        
        <p>
          Pilihan kue rumahan terbaik di Kota Metro. Dibuat dengan cinta setiap hari untuk Anda.
        </p>
        
        <div 
          className="hero-btns"
          style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
        >
          <a href="#menu" className="cta-btn">Pesan Sekarang</a>
          <button 
            onClick={() => openWhatsApp("Halo La Misha, saya mau tanya-tanya dulu dong seputar kue-nya...")}
            className="cta-btn wa-hero-btn"
          >
            <i className="fa-brands fa-whatsapp"></i> Tanya via WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
