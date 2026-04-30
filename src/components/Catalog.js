"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Catalog() {
  const { theme, setTheme } = useApp();
  const [activeCat, setActiveCat] = useState("all");
  const [productsDb, setProductsDb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("n", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setProductsDb(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Firestore Fetch Error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const groups = { 
    cookies: theme === "wellness" ? "Guilt-Free Treats 🌿" : "The OG Cookies ✨", 
    cakes: theme === "wellness" ? "Healthy Munchies 🥯" : "Mood Boosters 🍰" 
  };

  const activeColor = theme === "wellness" ? "var(--wellness)" : "var(--primary)";
  const activeBg = theme === "wellness" ? "var(--wellness-light)" : "var(--primary-light)";

  return (
    <>
      <div className="tabs-sticky">
        <div className="container">
          <div className="catalog-header">
            <div className="tabs-scroll" style={{ flex: 1 }}>
              {["all", "cookies", "cakes"].map((cat) => (
                <motion.button 
                  key={cat}
                  className={`tab ${activeCat === cat ? "active" : ""}`} 
                  onClick={() => setActiveCat(cat)}
                  whileTap={{ scale: 0.92 }}
                  style={activeCat === cat ? { background: activeColor, color: "white", borderColor: activeColor, boxShadow: `0 4px 15px ${activeBg}` } : {}}
                >
                  {cat === "all" ? "Semua" : cat === "cookies" ? "Kukis" : "Cakes"}
                </motion.button>
              ))}
            </div>
            
            {/* Theme Toggle Button */}
            <motion.button
              onClick={() => setTheme(theme !== "wellness" ? "wellness" : "classic")}
              whileTap={{ scale: 0.9 }}
              className="theme-toggle-btn"
              style={{
                background: theme !== "wellness" ? "linear-gradient(135deg, #43a047 0%, #81c784 100%)" : "linear-gradient(135deg, #d81b60 0%, #f06292 100%)",
                boxShadow: theme !== "wellness" ? "0 4px 12px rgba(67,160,71,0.25)" : "0 4px 12px rgba(216,27,96,0.25)",
              }}
            >
              {theme !== "wellness" ? (
                <>
                  <i className="fa-solid fa-leaf" style={{ fontSize: "0.9em" }}></i>
                  <span>BERALIH KE KUKIS SEHAT</span>
                  <i className="fa-solid fa-arrow-right-long" style={{ fontSize: "0.85em", opacity: 0.8 }}></i>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-left-long" style={{ fontSize: "0.85em", opacity: 0.8 }}></i>
                  <span>KEMBALI KE OG COOKIES</span>
                  <i className="fa-solid fa-cookie-bite" style={{ fontSize: "0.9em" }}></i>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <main className="container catalog" id="menu" style={{ paddingBottom: "80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ fontSize: "2rem", color: activeColor }}
            >
              <i className="fa-solid fa-spinner"></i>
            </motion.div>
            <p style={{ marginTop: "15px", color: "#999", fontSize: "0.9rem" }}>Menyiapkan hidangan lezat...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCat}-${theme}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {Object.keys(groups).map((key) => {
                if (activeCat !== "all" && activeCat !== key) return null;
                
                const items = productsDb.filter((p) => {
                  const categoryMatch = p.c === key;
                  const themeMatch = theme === "wellness" ? p.brand === "Wellness" : p.brand === "Classic";
                  return categoryMatch && themeMatch;
                });
                
                if (items.length === 0 && activeCat !== "all") return null;

                return (
                  <div key={key} className="cat-group" id={`sec-${key}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      style={{ 
                        display: "flex", alignItems: "center", gap: "12px", 
                        marginBottom: "28px", paddingBottom: "12px",
                        borderBottom: `2px dashed ${activeBg}`
                      }}
                    >
                      <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: "32px" }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        viewport={{ once: true }}
                        style={{
                          width: "6px", borderRadius: "10px",
                          background: activeColor
                        }} 
                      />
                      <h2 className="cat-title" style={{ color: activeColor, margin: 0, fontSize: "1.6rem" }}>
                        {groups[key]}
                      </h2>
                    </motion.div>
                    <div className="grid">
                      {items.length > 0 ? items.map((p) => (
                        <ProductCard key={p.id} p={p} />
                      )) : (
                        <div style={{ padding: "40px 20px", textAlign: "center", background: "#fafafa", borderRadius: "24px" }}>
                          <i className={`fa-solid ${theme === "wellness" ? "fa-seedling" : "fa-cookie"} fa-2x`} style={{ color: "#ddd", marginBottom: "10px" }}></i>
                          <p style={{ color: "#999", fontStyle: "italic", fontSize: "0.9rem" }}>Produk sedang disiapkan...</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </>
  );
}

function ProductCard({ p }) {
  const { openPeek, theme } = useApp();
  
  const isWellness = p.brand === "Wellness";
  const activeColor = isWellness ? "var(--wellness)" : "var(--primary)";
  const badgeColor = isWellness ? "var(--wellness-accent)" : "#FFD700";

  return (
    <motion.div 
      className="card gpu" 
      onClick={() => openPeek(p)}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileTap={{ scale: 0.96 }}
      style={{ borderRadius: '24px', overflow: 'hidden', background: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
    >
      <div className="img-wrap" style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
        {/* Brand Label */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 2,
          background: badgeColor, color: isWellness ? 'white' : '#333', padding: '4px 10px',
          borderRadius: '12px', fontSize: '0.6rem', fontWeight: '900',
          textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {p.brand}
        </div>

        {/* Urgency Badge */}
        {p.stock <= 5 && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 2,
            background: 'rgba(255, 255, 255, 0.95)', color: '#d00', padding: '4px 10px',
            borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900',
            border: '1px solid #ffcccc', backdropFilter: 'blur(4px)'
          }}>
            <i className="fa-solid fa-fire-flame-curved"></i> SISA {p.stock}!
          </div>
        )}

        <motion.img 
          src={p.i} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          alt={p.n}
          loading="lazy"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6 }}
          onError={(e) => e.target.src = `https://placehold.co/400?text=${p.n}`} 
        />
      </div>
      
      <div className="card-body" style={{ padding: '16px' }}>
        <div className="card-name" style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', color: '#333' }}>{p.n}</div>
        
        {/* Nutrition Labels */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {p.nutrition?.map((tag, i) => (
            <span key={i} style={{ 
              fontSize: '0.55rem', background: isWellness ? 'var(--wellness-light)' : '#f5f5f5', 
              color: isWellness ? 'var(--wellness)' : '#666', 
              padding: '2px 6px', borderRadius: '6px', fontWeight: '700'
            }}>
              {tag}
            </span>
          ))}
        </div>

        <p style={{ 
          fontSize: '0.75rem', color: '#777', lineHeight: '1.5', 
          marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.25rem'
        }}>
          {p.d}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-price" style={{ color: activeColor, fontWeight: '900', fontSize: '1rem' }}>
            Rp {p.opts[0].p.toLocaleString('id-ID')}
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ 
              width: '36px', height: '36px', borderRadius: '50%', 
              background: activeColor, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              boxShadow: `0 4px 10px ${isWellness ? 'rgba(76,175,80,0.3)' : 'rgba(216,27,96,0.3)'}`,
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-plus"></i>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
