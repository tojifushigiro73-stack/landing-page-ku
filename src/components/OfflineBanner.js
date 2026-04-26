"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          className="offline-banner active"
          initial={{ top: -100, x: "-50%" }}
          animate={{ top: 20, x: "-50%" }}
          exit={{ top: -100, x: "-50%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="offline-content">
            <i className="fa-solid fa-cloud-slash"></i>
            <span>Anda sedang offline, tapi katalog tetap bisa diakses!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
