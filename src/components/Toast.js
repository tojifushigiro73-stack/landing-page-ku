"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast() {
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'info' }
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleShowToast = (e) => {
      setToast({ message: e.detail.message, type: e.detail.type || 'success' });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const duration = e.detail.duration || 3000;
      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, duration);
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
            zIndex: 30000,
            pointerEvents: "none",
            width: "max-content",
            maxWidth: "calc(100vw - 40px)"
          }}
        >
          <div style={{
            background: "rgba(45, 27, 34, 0.95)",
            color: "white",
            padding: "14px 24px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            backdropFilter: "blur(10px)",
            lineHeight: "1.5",
            textAlign: "left"
          }}>
            <div style={{ marginTop: "2px" }}>
                {toast.type === 'success' && <i className="fa-solid fa-circle-check" style={{ color: "#2ecc71", fontSize: "1.1rem" }}></i>}
                {toast.type === 'info' && <i className="fa-solid fa-circle-info" style={{ color: "#3498db", fontSize: "1.1rem" }}></i>}
                {toast.type === 'error' && <i className="fa-solid fa-circle-xmark" style={{ color: "#e74c3c", fontSize: "1.1rem" }}></i>}
                {toast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f39c12", fontSize: "1.1rem" }}></i>}
            </div>
            <div style={{ flex: 1 }}>{toast.message}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
