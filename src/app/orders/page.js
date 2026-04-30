"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function OrdersPage() {
    const { currentUser, setAuthModalMode } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleMap, setVisibleMap] = useState(null);

    useEffect(() => {
        if (!currentUser || !db) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Query orders where userId matches and sorted by creation date
        const q = query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (err) => {
            console.error("Orders Fetch Error:", err);
            // Fallback query if index is still building
            const qFallback = query(
                collection(db, "orders"),
                where("userId", "==", currentUser.uid)
            );
            onSnapshot(qFallback, (snap) => {
                const sorted = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setOrders(sorted);
                setLoading(false);
            });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getStatusColor = (status) => {
        switch (status) {
            case "SELESAI": return "#27ae60";
            case "BATAL": return "#e74c3c";
            case "MENUNGGU PEMBAYARAN": return "#f39c12";
            default: return "var(--primary)";
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case "SELESAI": return "#e6fff0";
            case "BATAL": return "#fff0f0";
            case "MENUNGGU PEMBAYARAN": return "#fff9e6";
            default: return "#fdf2f6";
        }
    };

    if (!currentUser) {
        return (
            <>
                <Navbar />
                <div className="container" style={{ paddingTop: "120px", textAlign: "center" }}>
                    <div style={{ background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                        <i className="fa-solid fa-user-lock" style={{ fontSize: "3rem", color: "var(--primary)", marginBottom: "20px" }}></i>
                        <h2 style={{ fontFamily: "var(--font-playfair)", marginBottom: "10px" }}>Akses Terbatas</h2>
                        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Silakan login terlebih dahulu untuk melihat riwayat pesanan Anda.</p>
                        <button 
                            className="cta-btn" 
                            onClick={() => setAuthModalMode('login')}
                        >LOGIN SEKARANG</button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: "120px", paddingBottom: "100px" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                        <a 
                            href="/" 
                            onMouseEnter={(e) => e.currentTarget.style.background = "#fae1eb"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#fdf2f6"}
                            style={{
                                background: "#fdf2f6", border: "none", width: "38px", height: "38px",
                                borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--primary)", transition: "all 0.3s ease", textDecoration: "none"
                            }}
                        >
                            <i className="fa-solid fa-house"></i>
                        </a>
                        <h1 style={{ fontFamily: "var(--font-playfair)", color: "var(--primary)", margin: 0 }}>Riwayat Pesanan</h1>
                    </div>
                    <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Pantau status pesanan dan kumpulkan poin pilihanmu.</p>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "50px" }}>
                            <div className="shimmer" style={{ width: "100%", height: "100px", borderRadius: "20px", marginBottom: "20px" }}></div>
                            <div className="shimmer" style={{ width: "100%", height: "100px", borderRadius: "20px" }}></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "24px" }}>
                            <img src="/broww.webp" style={{ width: "120px", opacity: 0.3, marginBottom: "20px" }} alt="Empty" />
                            <p style={{ color: "#999", fontStyle: "italic" }}>Belum ada pesanan nih. Yuk belanja sekarang!</p>
                            <a href="/" className="cta-btn" style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}>LIHAT MENU</a>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "20px" }}>
                            {orders.map((o) => (
                                <motion.div 
                                    key={o.id} 
                                    className="order-card"
                                    layout
                                    style={{ 
                                        background: "white", padding: "24px", borderRadius: "20px", 
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: "1px solid #f8f8f8",
                                        position: "relative", overflow: "hidden"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>
                                                Order ID: {o.id.slice(-8).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                                {o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                }) : "Memproses..."}
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: "6px 14px", borderRadius: "50px", fontSize: "0.7rem", fontWeight: "800",
                                            background: getStatusBg(o.status),
                                            color: getStatusColor(o.status),
                                            boxShadow: `0 4px 10px ${getStatusColor(o.status)}15`
                                        }}>
                                            {o.status}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "15px", background: "#fafafa", padding: "12px", borderRadius: "12px" }}>
                                        {o.items?.map((it, idx) => (
                                            <div key={idx} style={{ fontSize: "0.85rem", color: "#444", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                                                <span>• {it.n} ({it.l})</span>
                                                <span style={{ fontWeight: "600" }}>Rp {it.p.toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px dashed #eee", paddingTop: "15px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.7rem", color: "#999", fontWeight: "600" }}>TOTAL PEMBAYARAN</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                                                Rp {o.total?.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "0.7rem", color: "#999", fontWeight: "600" }}>POIN DIDAPAT</div>
                                            <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#e67e22" }}>
                                                +{o.pointsGained} Poin
                                            </div>
                                        </div>
                                    </div>

                                    {o.status === "MENUNGGU PEMBAYARAN" && (
                                        <button 
                                            onClick={() => {
                                                const msg = `Halo Admin La Misha! Saya ingin konfirmasi pembayaran untuk Pesanan ID: ${o.id.slice(-8).toUpperCase()}`;
                                                window.location.href = `https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`;
                                            }}
                                            style={{ 
                                                width: "100%", marginTop: "15px", background: "#27ae60", color: "white", 
                                                border: "none", padding: "12px", borderRadius: "12px", fontWeight: "700", 
                                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                            }}
                                        >
                                            <i className="fa-brands fa-whatsapp"></i> KONFIRMASI PEMBAYARAN
                                        </button>
                                    )}

                                    {o.status === "DIKIRIM" && o.location && (
                                        <div style={{ marginTop: "15px" }}>
                                            <button 
                                                onClick={() => setVisibleMap(visibleMap === o.id ? null : o.id)}
                                                style={{ 
                                                    width: "100%", background: visibleMap === o.id ? "#f5f5f5" : "#007bff", 
                                                    color: visibleMap === o.id ? "#666" : "white", 
                                                    border: "none", padding: "12px", borderRadius: "12px", fontWeight: "700", 
                                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                                    transition: "all 0.3s ease"
                                                }}
                                            >
                                                <i className="fa-solid fa-map-location-dot"></i> {visibleMap === o.id ? "SEMBUNYIKAN PETA" : "LACAK LOKASI KURIR"}
                                            </button>

                                            <AnimatePresence>
                                                {visibleMap === o.id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        style={{ overflow: "hidden", marginTop: "10px" }}
                                                    >
                                                        <Map 
                                                            readonly={true} 
                                                            initialLocation={o.location} 
                                                            courierLocation={o.courierLocation}
                                                            mapId={`map-user-${o.id}`}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
        </>
    );
}
