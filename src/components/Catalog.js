"use client";
import { useState } from "react";
import { products } from "@/data/products";

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
      </main>
    </>
  );
}

function ProductCard({ p }) {
  return (
    <div className="card" onClick={() => window.dispatchEvent(new CustomEvent('peek-product', { detail: p }))}>
      <div className="img-wrap">
        {p.b && <div className="card-badge">{p.b}</div>}
        <img 
          src={p.i} 
          className="card-img" 
          alt={p.n}
          onError={(e) => e.target.src = `https://placehold.co/400?text=${p.n}`} 
        />
      </div>
      <div className="card-body">
        <div className="card-name">{p.n}</div>
        <div className="card-price">Mulai Rp {p.opts[0].p.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}
