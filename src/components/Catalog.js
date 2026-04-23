"use client";
import { useState } from "react";
import { products } from "@/data/products";

export default function Catalog() {
  const [activeCat, setActiveCat] = useState("all");

  const filteredProducts = activeCat === "all" ? products : products.filter(p => p.c === activeCat);

  const cookies = filteredProducts.filter(p => p.c === "cookies");
  const cakes = filteredProducts.filter(p => p.c === "cakes");

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

      <main className="container catalog" id="menu">
        {(activeCat === "all" || activeCat === "cookies") && (
          <div className="cat-group" id="sec-cookies">
            <h2 className="cat-title">Kukis Terpopuler</h2>
            <div className="grid">
              {cookies.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
        {(activeCat === "all" || activeCat === "cakes") && (
          <div className="cat-group" id="sec-cakes">
            <h2 className="cat-title">Cake & Special</h2>
            <div className="grid">
              {cakes.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
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
        <button className="btn-plus"><i className="fa-solid fa-eye"></i></button>
      </div>
      <div className="card-body">
        <div className="card-name">{p.n}</div>
        <div className="card-price">Mulai Rp {p.opts[0].p.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}
