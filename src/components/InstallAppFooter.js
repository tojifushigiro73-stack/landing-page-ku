"use client";
import { useState, useEffect } from "react";

export default function InstallAppFooter() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Listen for the prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA installed");
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      // For iOS Safari or browsers where prompt is not available
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { 
            message: "Untuk install di iPhone: Ketuk ikon 'Bagikan' (kotak dengan panah ke atas) di bawah, lalu pilih 'Tambah ke Layar Utama'.", 
            type: 'info',
            duration: 8000
          } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { 
            message: "Gunakan menu browser Anda (titik tiga di atas) dan pilih 'Install Aplikasi' atau 'Tambahkan ke Layar Utama'.", 
            type: 'info',
            duration: 5000
          } 
        }));
      }
    }
  };

  if (isStandalone) return null; // Sembunyikan jika sudah di-install

  return (
    <div style={{ padding: "20px", textAlign: "center", background: "#fff9f0", margin: "20px", borderRadius: "16px", border: "1.5px dashed var(--primary)" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>📱</div>
      <h3 style={{ color: "var(--primary)", marginBottom: "8px", fontSize: "1.1rem" }}>Akses Lebih Cepat & Praktis!</h3>
      <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "15px", lineHeight: "1.4" }}>
        Install aplikasi La Misha Bakehouse di HP Anda agar tidak perlu repot buka browser lagi.
      </p>
      <button 
        onClick={handleInstallClick}
        style={{
          background: "var(--primary)",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "12px",
          fontWeight: "700",
          cursor: "pointer",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 15px rgba(176,39,98,0.2)"
        }}
      >
        <i className="fa-solid fa-download"></i> INSTALL APLIKASI
      </button>
    </div>
  );
}
