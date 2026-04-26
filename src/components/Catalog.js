"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { products } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

export default function Catalog() {
  const { openPeek } = useApp();
  const [activeCat, setActiveCat] = useState("all");

  const groups = { 
    cookies: "Kukis Terpopuler", 
    cakes: "Cake & Special" 
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <div className="tabs-sticky">
        <div className="container">
          <div className="tabs-scroll">
            <button 
              className={`tab ${activeCat === "all" ? "active" : ""}`} 
              onClick={() => setActiveCat("all")}
            >Semua</button>
            <button 
              className={`tab ${activeCat === "cookies" ? "active" : ""}`} 
              onClick={() => setActiveCat("cookies")}
            >Kukis</button>
            <button 
              className={`tab ${activeCat === "cakes" ? "active" : ""}`} 
              onClick={() => setActiveCat("cakes")}
            >Cakes</button>
          </div>
        </div>
      </div>

      <main className="container catalog" id="menu" style={{ paddingBottom: "80px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {Object.keys(groups).map((key) => {
              if (activeCat !== "all" && activeCat !== key) return null;
              
              const items = products.filter((p) => p.c === key);
              
              return (
                <div key={key} className="cat-group" id={`sec-${key}`} style={{ marginBottom: "40px" }}>
                  <h2 className="cat-title" style={{ 
                    fontFamily: "var(--font-playfair)", fontSize: "1.8rem", color: "var(--primary)",
                    marginBottom: "25px", borderLeft: "5px solid var(--accent)", paddingLeft: "15px",
                    fontWeight: "700"
                  }}>
                    {groups[key]}
                  </h2>
                  <motion.div 
                    className="grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    {items.length > 0 ? items.map((p) => (
                      <ProductCard key={p.id} p={p} variants={itemVariants} />
                    )) : (
                      <p style={{ color: "#ccc", fontStyle: "italic" }}>Stok sedang disiapkan...</p>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function ProductCard({ p, variants }) {
  const { openPeek } = useApp();
  return (
    <motion.div 
      className="card" 
      onClick={() => openPeek(p)}
      variants={variants}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="img-wrap">
        {p.b && <div className="card-badge">{p.b}</div>}
        <motion.img 
          src={p.i} 
          className="card-img" 
          alt={p.n}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
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
