"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { products } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

export default function Catalog() {
  const [activeCat, setActiveCat] = useState("all");

  const groups = { 
    cookies: "Kukis Terpopuler", 
    cakes: "Cake & Special" 
  };

  return (
    <>
      <div className="tabs-sticky">
        <div className="container">
          <div className="tabs-scroll">
            {["all", "cookies", "cakes"].map((cat) => (
              <motion.button 
                key={cat}
                className={`tab ${activeCat === cat ? "active" : ""}`} 
                onClick={() => setActiveCat(cat)}
                whileTap={{ scale: 0.92 }}
              >
                {cat === "all" ? "Semua" : cat === "cookies" ? "Kukis" : "Cakes"}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <main className="container catalog" id="menu" style={{ paddingBottom: "80px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2 }}
          >
            {Object.keys(groups).map((key) => {
              if (activeCat !== "all" && activeCat !== key) return null;
              
              const items = products.filter((p) => p.c === key);
              
              return (
                <div key={key} className="cat-group" id={`sec-${key}`}>
                  <h2 className="cat-title">
                    {groups[key]}
                  </h2>
                  <div className="grid">
                    {items.length > 0 ? items.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    )) : (
                      <p style={{ color: "#ccc", fontStyle: "italic" }}>Stok sedang disiapkan...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function ProductCard({ p }) {
  const { openPeek } = useApp();
  return (
    <motion.div 
      className="card gpu" 
      onClick={() => openPeek(p)}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="img-wrap">
        {p.b && <div className="card-badge">{p.b}</div>}
        <motion.img 
          src={p.i} 
          className="card-img" 
          alt={p.n}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          onError={(e) => e.target.src = `https://placehold.co/400?text=${p.n}`} 
        />
      </div>
      <div className="card-body">
        <div className="card-name">{p.n}</div>
        <div className="card-price">Mulai Rp {p.opts[0].p.toLocaleString('id-ID')}</div>
      </div>
    </motion.div>
  );
}
