"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast() {
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'info' }

  useEffect(() => {
    const handleShowToast = (e) => {
      setToast({ message: e.detail.message, type: e.detail.type || 'success' });
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    window.addEventListener("show-toast", handleShowToast);
    return () => window.removeEventListener("show-toast", handleShowToast);
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
          style={{
            position: "fixed",
            top: "30px",
            left: "50%",
            zIndex: 10000,
            pointerEvents: "none"
          }}
        >
          <div style={{
            background: "rgba(45, 27, 34, 0.85)",
            backdropFilter: "blur(15px)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "50px",
            fontSize: "0.9rem",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            whiteSpace: "nowrap"
          }}>
            {toast.type === 'success' && <i className="fa-solid fa-circle-check" style={{ color: "#2ecc71" }}></i>}
            {toast.type === 'info' && <i className="fa-solid fa-circle-info" style={{ color: "#3498db" }}></i>}
            {toast.type === 'error' && <i className="fa-solid fa-circle-xmark" style={{ color: "#e74c3c" }}></i>}
            {toast.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
