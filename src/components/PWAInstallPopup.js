"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show popup after 5 seconds if not dismissed before
      if (!localStorage.getItem("pwa_dismissed")) {
        setTimeout(() => setIsVisible(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="pwa-install-popup active"
          initial={{ opacity: 0, y: 100, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%", bottom: "calc(20px + env(safe-area-inset-bottom))" }}
          exit={{ opacity: 0, y: 100, x: "-50%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="pwa-content">
            <img src="/apple-touch-icon.png" alt="Logo" className="pwa-icon" />
            <div className="pwa-text">
              <strong>Pasang Aplikasi Lamisha</strong>
              <p>Akses lebih cepat & hemat kuota langsung dari layar utama Anda.</p>
            </div>
            <div className="pwa-actions">
              <button onClick={handleDismiss} className="pwa-btn-later">Nanti</button>
              <button onClick={handleInstall} className="pwa-btn-install">Pasang</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
