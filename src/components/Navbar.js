"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const { cart, currentUser, isAdmin } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav id="nav" className={scrolled ? "scrolled" : ""}>
      <div className="container nav-content">
        <a href="#" className="logo">La Misha Bakehouse</a>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {!currentUser ? (
            <div id="login-section">
              <button className="user-nav-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}>
                <i className="fa-solid fa-user-circle"></i> Login
              </button>
            </div>
          ) : (
            <div id="user-profile" style={{ animation: "slideInRight 0.5s ease-out" }}>
              <div className="user-nav-btn" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-logout'))}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", 
                  background: "white", padding: "4px 12px 4px 4px",
                  borderRadius: "50px", cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(176,39,98,0.12)",
                  transition: "all 0.3s ease",
                  border: "1.5px solid rgba(176,39,98,0.08)",
                  height: "42px"
                }}
              >
                <div style={{ position: "relative", width: "34px", height: "34px" }}>
                  <img 
                    id="user-photo" 
                    src={currentUser.photo} 
                    alt="" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${currentUser.name}&background=b02762&color=fff`} 
                  />
                  <div style={{
                    position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px",
                    background: "#2ecc71", borderRadius: "50%", border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}></div>
                </div>
                <span id="user-name" style={{ 
                  fontWeight: "800", fontSize: "0.8rem", color: "var(--primary)",
                  textTransform: "lowercase", letterSpacing: "0.3px", paddingRight: "4px"
                }}>
                  {(currentUser.name || currentUser.email.split('@')[0] || 'Member').split(' ')[0]}
                </span>
              </div>
              
              {isAdmin && (
                <a href="/admin" style={{ 
                  textDecoration: "none", background: "#34495e", color: "white", 
                  padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" 
                }}>Admin</a>
              )}
            </div>
          )}
          
          <div 
            className="cart-btn" 
            onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
            style={{
              position: "relative", width: "42px", height: "42px", 
              background: "var(--primary)", color: "white", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 4px 15px rgba(176,39,98,0.25)",
              transition: "all 0.3s ease"
            }}
          >
            <i className="fa-solid fa-shopping-bag" style={{ fontSize: "1.1rem" }}></i>
            <span className="cart-badge" style={{
              position: "absolute", top: "-5px", right: "-5px",
              background: "#e67e22", color: "white", fontSize: "0.65rem",
              fontWeight: "900", width: "20px", height: "20px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid white", boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
            }}>{cart.length}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
