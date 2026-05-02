"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, where, orderBy, increment, writeBatch, serverTimestamp } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function AdminPage() {
    const { currentUser, isAdmin, ADMIN_EMAILS, setAuthModalMode } = useApp();
    const [activeTab, setActiveTab] = useState("users"); // "users", "orders", or "products"
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [productsDb, setProductsDb] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");
    const [orderFilter, setOrderFilter] = useState("ALL");
    const [updating, setUpdating] = useState(null);
    const [visibleMap, setVisibleMap] = useState(null);



    useEffect(() => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        let unsubscribe;

        if (activeTab === "users") {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            unsubscribe = onSnapshot(q, (snap) => {
                setUsers(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setLoading(false);
            }, (err) => {
                const q2 = query(collection(db, "users"));
                onSnapshot(q2, (snap) => {
                    setUsers(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                    setLoading(false);
                });
            });
        } else if (activeTab === "orders") {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            unsubscribe = onSnapshot(q, (snap) => {
                setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setLoading(false);
            });
        } else if (activeTab === "products") {
            const q = query(collection(db, "products"), orderBy("n", "asc"));
            unsubscribe = onSnapshot(q, (snap) => {
                setProductsDb(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setLoading(false);
            });
        }

        return () => unsubscribe && unsubscribe();
    }, [isAdmin, activeTab]);

    const updatePoints = async (userId, newPoints) => {
        setUpdating(userId);
        try {
            const userRef = doc(db, "users", String(userId));
            await updateDoc(userRef, { points: parseInt(newPoints) });
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Poin berhasil diperbarui!", type: 'success' } }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal memperbarui poin.", type: 'error' } }));
        }
        setUpdating(null);
    };

    const updateStock = async (productId, newStock) => {
        setUpdating(productId);
        try {
            const productRef = doc(db, "products", String(productId));
            await updateDoc(productRef, { stock: parseInt(newStock) });
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Stok berhasil diperbarui!", type: 'success' } }));
        } catch (err) {
            console.error("Update Stock Error:", err);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal memperbarui stok.", type: 'error' } }));
        }
        setUpdating(null);
    };

    const syncFromLocal = async () => {
        if (!confirm("Impor produk dari file lokal ke database? Ini akan mereset data di database.")) return;
        setLoading(true);
        try {
            const { products } = await import("@/data/products");
            const batch = writeBatch(db);
            products.forEach(p => {
                const productRef = doc(db, "products", p.id.toString());
                batch.set(productRef, p);
            });
            await batch.commit();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Berhasil sinkronisasi dari lokal!", type: 'success' } }));
        } catch (err) {
            console.error("Sync Error:", err);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal sinkronisasi.", type: 'error' } }));
        }
        setLoading(false);
    };

    const updateOrderStatus = async (order, newStatus) => {
        setUpdating(order.id);
        try {
            const batch = writeBatch(db);
            const orderRef = doc(db, "orders", order.id);
            if (newStatus === "DIKIRIM") {
                const shopLoc = { lat: -5.154633, lng: 105.300084 };
                batch.update(orderRef, { 
                    status: newStatus,
                    courierLocation: shopLoc 
                });
            } else {
                batch.update(orderRef, { status: newStatus });
            }
            
            // 0. Kurangi Stok JIKA pesanan baru saja dikonfirmasi (dari MENUNGGU PEMBAYARAN)
            if (order.status === "MENUNGGU PEMBAYARAN" && (newStatus === "DIKIRIM" || newStatus === "SELESAI")) {
                order.items.forEach(item => {
                    if (item.id) {
                        const productRef = doc(db, "products", String(item.id));
                        batch.update(productRef, {
                            stock: increment(-1)
                        });
                    }
                });
            }

            if (newStatus === "SELESAI" && order.userId !== "GUEST") {
                const userRef = doc(db, "users", order.userId);
                const pointsToGain = order.pointsGained || 0;
                
                batch.update(userRef, { 
                    points: increment(pointsToGain) 
                });

                const txRef = doc(collection(db, "point_transactions"));
                batch.set(txRef, {
                    userId: order.userId,
                    orderId: order.id,
                    type: "EARN",
                    amount: pointsToGain,
                    description: `Poin dari pesanan #${order.id.slice(-5).toUpperCase()}`,
                    createdAt: serverTimestamp()
                });

                await batch.commit();
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Pesanan selesai! ${pointsToGain} poin telah ditambahkan.`, type: 'success' } }));
            } else if (newStatus === "BATAL") {
                // 1. Kembalikan Stok
                order.items.forEach(item => {
                    if (item.id) {
                        const productRef = doc(db, "products", String(item.id));
                        batch.update(productRef, {
                            stock: increment(1)
                        });
                    }
                });

                // 2. Kembalikan Poin Jika Ada
                if (order.userId !== "GUEST" && order.pointsUsed > 0) {
                    const userRef = doc(db, "users", order.userId);
                    batch.update(userRef, {
                        points: increment(order.pointsUsed)
                    });

                    const txRef = doc(collection(db, "point_transactions"));
                    batch.set(txRef, {
                        userId: order.userId,
                        orderId: order.id,
                        type: "RETURN",
                        amount: order.pointsUsed,
                        description: `Pengembalian poin dari pesanan batal #${order.id.slice(-5).toUpperCase()}`,
                        createdAt: serverTimestamp()
                    });
                }

                await batch.commit();
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Pesanan dibatalkan. Stok & Poin telah dikembalikan.`, type: 'warning' } }));
            } else {
                await batch.commit();
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Status diperbarui ke: ${newStatus}`, type: 'info' } }));
            }
        } catch (err) {
            console.error("Update Status Error:", err);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal memperbarui status.", type: 'error' } }));
        }
        setUpdating(null);
    };

    const updateCourierLocation = async (orderId, loc) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { 
                courierLocation: { lat: loc.lat, lng: loc.lng } 
            });
            // Optional: toast if needed, but it might be too spammy for live updates
        } catch (err) {
            console.error("Update Courier Location Error:", err);
        }
    };

    if (!currentUser) {
        return (
            <>
                <Navbar />
                <main className="container" style={{ paddingTop: "140px", paddingBottom: "100px", textAlign: "center", minHeight: "70vh" }}>
                    <h2 style={{ fontFamily: "var(--font-playfair)", color: "var(--primary)", marginBottom: "15px" }}>Akses Terbatas</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Silakan login terlebih dahulu untuk mengakses Dashboard Admin.</p>
                    <button 
                        onClick={() => setAuthModalMode('login')}
                        className="cta-btn" 
                        style={{ background: "var(--primary)", border: "none", color: "white" }}
                    >
                        LOGIN SEKARANG
                    </button>
                </main>
            </>
        );
    }

    if (!isAdmin) {
        return (
            <>
                <Navbar />
                <main className="container" style={{ paddingTop: "140px", paddingBottom: "100px", textAlign: "center", minHeight: "70vh" }}>
                    <div style={{ display: "inline-block", background: "#fdf2f6", padding: "20px 30px", borderRadius: "20px", border: "1.5px dashed var(--primary-light)" }}>
                        <i className="fa-solid fa-lock" style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "15px" }}></i>
                        <h2 style={{ fontFamily: "var(--font-playfair)", color: "var(--text-dark)", marginBottom: "10px" }}>Akses Ditolak</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Halaman ini dikhususkan untuk Administrator La Misha.</p>
                    </div>
                </main>
            </>
        );
    }

    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: "120px", paddingBottom: "100px" }}>
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
                    <h1 style={{ fontFamily: "var(--font-playfair)", margin: 0, color: "var(--primary)" }}>Admin Dashboard</h1>
                </div>
                <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Selamat datang, {currentUser.name}</p>

                <div style={{ display: "flex", gap: "10px", marginBottom: "30px", background: "#f5f5f5", padding: "5px", borderRadius: "14px", overflowX: "auto" }}>
                    <button 
                        onClick={() => setActiveTab("users")}
                        style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: activeTab === "users" ? "white" : "transparent", color: activeTab === "users" ? "var(--primary)" : "#666", fontWeight: "700", cursor: "pointer", boxShadow: activeTab === "users" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", whiteSpace: "nowrap" }}
                    >Data Member</button>
                    <button 
                        onClick={() => setActiveTab("orders")}
                        style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: activeTab === "orders" ? "white" : "transparent", color: activeTab === "orders" ? "var(--primary)" : "#666", fontWeight: "700", cursor: "pointer", boxShadow: activeTab === "orders" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", whiteSpace: "nowrap" }}
                    >Pesanan Masuk</button>
                    <button 
                        onClick={() => setActiveTab("products")}
                        style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: activeTab === "products" ? "white" : "transparent", color: activeTab === "products" ? "var(--primary)" : "#666", fontWeight: "700", cursor: "pointer", boxShadow: activeTab === "products" ? "0 4px 10px rgba(0,0,0,0.05)" : "none", whiteSpace: "nowrap" }}
                    >Data Produk</button>
                </div>

                {activeTab === "users" ? (
                    <>
                        <div style={{ marginBottom: "20px" }}>
                            <input
                                type="text"
                                placeholder="Cari User (Email/Nama)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: "100%", padding: "12px 20px", borderRadius: "12px", border: "1.5px solid #eee", fontSize: "1rem" }}
                            />
                        </div>

                        {loading ? (
                            <p>Memuat data user...</p>
                        ) : (
                            <div style={{ display: "grid", gap: "15px" }}>
                                {filteredUsers.map(u => (
                                    <div key={u.id} style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                                        <div>
                                            <div style={{ fontWeight: "800", color: "var(--text-dark)" }}>{u.name || "No Name"}</div>
                                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.email}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase" }}>Saldo Poin</div>
                                                <input
                                                    type="number"
                                                    defaultValue={u.points || 0}
                                                    id={`points-${u.id}`}
                                                    style={{ width: "80px", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", fontWeight: "700", textAlign: "center" }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => updatePoints(u.id, document.getElementById(`points-${u.id}`).value)}
                                                disabled={updating === u.id}
                                                style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", opacity: updating === u.id ? 0.5 : 1 }}
                                            >
                                                {updating === u.id ? "..." : "Simpan"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : activeTab === "orders" ? (
                    <>
                        <div style={{ marginBottom: "25px" }}>
                            <input
                                type="text"
                                placeholder="Cari Pesanan (ID/Nama/Email)..."
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                style={{ width: "100%", padding: "12px 20px", borderRadius: "12px", border: "1.5px solid #eee", fontSize: "1rem", marginBottom: "15px" }}
                            />
                            <div className="tabs-scroll" style={{ padding: "0 2px" }}>
                                {["ALL", "MENUNGGU PEMBAYARAN", "DIKIRIM", "SELESAI", "BATAL"].map((f) => (
                                    <button 
                                        key={f}
                                        onClick={() => setOrderFilter(f)}
                                        className={`tab ${orderFilter === f ? "active" : ""}`}
                                        style={{ fontSize: "0.7rem", padding: "8px 15px" }}
                                    >
                                        {f === "ALL" ? "SEMUA" : f.replace("PEMBAYARAN", "").trim()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: "20px" }}>
                            {loading ? <p>Memuat pesanan...</p> : orders
                                .filter(o => {
                                    const matchStatus = orderFilter === "ALL" || o.status === orderFilter;
                                    const term = orderSearch.toLowerCase();
                                    const matchSearch = o.userName?.toLowerCase().includes(term) || 
                                                       o.userEmail?.toLowerCase().includes(term) || 
                                                       o.id?.toLowerCase().includes(term);
                                    return matchStatus && matchSearch;
                                })
                                .map(o => (
                                    <div key={o.id} style={{ background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                                            <div>
                                                <div style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", fontWeight: "700" }}>Order ID: {o.id.slice(-8)}</div>
                                                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-dark)" }}>{o.userName}</div>
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{o.userEmail}</div>
                                                {o.createdAt && (
                                                    <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "5px" }}>
                                                        <i className="fa-regular fa-clock"></i> {new Date(o.createdAt.seconds * 1000).toLocaleString('id-ID')}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ 
                                                padding: "6px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "800",
                                                background: o.status === "SELESAI" ? "#e6fff0" : (o.status === "BATAL" ? "#fff0f0" : (o.status === "DIKIRIM" ? "#f0f7ff" : "#fff9e6")),
                                                color: o.status === "SELESAI" ? "#27ae60" : (o.status === "BATAL" ? "#e74c3c" : (o.status === "DIKIRIM" ? "#007bff" : "#f39c12"))
                                            }}>
                                                {o.status}
                                            </div>
                                        </div>
                                        
                                        <div style={{ marginBottom: "15px" }}>
                                            {o.items.map((it, idx) => (
                                                <div key={idx} style={{ fontSize: "0.9rem", color: "#444", marginBottom: "5px" }}>
                                                    • {it.n} ({it.l}) - Rp {it.p.toLocaleString()}
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                                            <div style={{ background: "#fdf2f6", padding: "12px", borderRadius: "12px" }}>
                                                <div style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase", marginBottom: "5px" }}>Keuangan</div>
                                                <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                                                    <span>Total:</span>
                                                    <span style={{ fontWeight: "700" }}>Rp {o.total.toLocaleString()}</span>
                                                </div>
                                                <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", color: "var(--primary)" }}>
                                                    <span>Poin:</span>
                                                    <span style={{ fontWeight: "700" }}>+{o.pointsGained}</span>
                                                </div>
                                            </div>
                                            <div style={{ background: "#f0f7ff", padding: "12px", borderRadius: "12px" }}>
                                                <div style={{ fontSize: "0.7rem", color: "#007bff", fontWeight: "700", textTransform: "uppercase", marginBottom: "5px" }}>Logistik</div>
                                                <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                                                    <span>Jarak:</span>
                                                    <span style={{ fontWeight: "700" }}>{o.distance}km</span>
                                                </div>
                                                {o.location && (
                                                    <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
                                                        <a 
                                                            href={`https://www.google.com/maps?q=${o.location.lat},${o.location.lng}`} 
                                                            target="_blank" 
                                                            style={{ fontSize: "0.75rem", color: "#007bff", textDecoration: "none", fontWeight: "700", display: "block" }}
                                                        >
                                                            <i className="fa-solid fa-external-link"></i> GOOGLE MAPS
                                                        </a>
                                                        <button 
                                                            onClick={() => setVisibleMap(visibleMap === o.id ? null : o.id)}
                                                            style={{ 
                                                                background: "none", border: "none", color: "var(--primary)", 
                                                                fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", 
                                                                padding: 0, textTransform: "uppercase" 
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-map-location-dot"></i> {visibleMap === o.id ? "TUTUP PETA" : "LIHAT DISINI"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {visibleMap === o.id && o.location && (
                                            <div style={{ marginBottom: "20px", animation: "fadeIn 0.3s ease" }}>
                                                <div style={{ fontSize: "0.75rem", background: "var(--primary)", color: "white", padding: "8px 12px", borderRadius: "10px 10px 0 0", fontWeight: "700" }}>
                                                    <i className="fa-solid fa-circle-info"></i> {o.status === "DIKIRIM" ? "Klik pada peta untuk memperbarui posisi KURIR saat ini." : "Lokasi tujuan pengiriman pelanggan."}
                                                </div>
                                                <Map 
                                                    readonly={o.status !== "DIKIRIM"} 
                                                    initialLocation={o.location} 
                                                    courierLocation={o.courierLocation}
                                                    setCourierLocation={o.status === "DIKIRIM" ? (loc) => updateCourierLocation(o.id, loc) : null}
                                                    mapId={`map-${o.id}`}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            {o.status === "MENUNGGU PEMBAYARAN" && (
                                                <>
                                                    <button 
                                                        onClick={() => updateOrderStatus(o, "DIKIRIM")}
                                                        style={{ flex: 1, background: "#007bff", color: "white", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                                    >KIRIM PESANAN</button>
                                                    <button 
                                                        onClick={() => updateOrderStatus(o, "SELESAI")}
                                                        style={{ background: "#27ae60", color: "white", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                                        title="Selesai Tanpa Kirim"
                                                    ><i className="fa-solid fa-check"></i></button>
                                                    <button 
                                                        onClick={() => updateOrderStatus(o, "BATAL")}
                                                        style={{ background: "#fff", border: "1px solid #e74c3c", color: "#e74c3c", padding: "12px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                                    >BATAL</button>
                                                </>
                                            )}
                                            {o.status === "DIKIRIM" && (
                                                <>
                                                    <div style={{ flex: 1, background: "#f0f7ff", border: "1px dashed #007bff", color: "#007bff", padding: "12px", borderRadius: "12px", fontWeight: "700", textAlign: "center", fontSize: "0.85rem" }}>
                                                        <i className="fa-solid fa-motorcycle"></i> Sedang Dalam Perjalanan
                                                    </div>
                                                    <button 
                                                        onClick={() => updateOrderStatus(o, "SELESAI")}
                                                        style={{ background: "#27ae60", color: "white", border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                                    >
                                                        PESANAN SELESAI <i className="fa-solid fa-check-double" style={{ marginLeft: "5px" }}></i>
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    let msg = `*RINGKASAN PESANAN LA MISHA*\n--------------------------\nPelanggan: ${o.userName}\nJarak: ${o.distance}km\nTotal: Rp ${o.total.toLocaleString()}\n--------------------------\n`;
                                                    o.items.forEach(it => msg += `• ${it.n} (${it.l})\n`);
                                                    navigator.clipboard.writeText(msg);
                                                    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Ringkasan pesanan disalin!", type: 'success' } }));
                                                }}
                                                style={{ background: "#f5f5f5", border: "none", padding: "12px", borderRadius: "12px", color: "#666", cursor: "pointer" }}
                                                title="Salin Ringkasan"
                                            >
                                                <i className="fa-solid fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            {!loading && orders.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>Belum ada pesanan masuk.</p>}
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "1.2rem", color: "var(--text-dark)" }}>Manajemen Stok Produk</h2>
                            <button 
                                onClick={syncFromLocal}
                                style={{ background: "#f0f2f5", border: "none", padding: "8px 15px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", color: "#666" }}
                            >
                                <i className="fa-solid fa-rotate"></i> SYNC DARI LOKAL
                            </button>
                        </div>

                        {loading ? (
                            <p>Memuat data produk...</p>
                        ) : (
                            <div style={{ display: "grid", gap: "15px" }}>
                                {productsDb.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "20px" }}>
                                        <p style={{ color: "#999", marginBottom: "15px" }}>Database produk masih kosong.</p>
                                        <button onClick={syncFromLocal} style={{ background: "var(--primary)", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "700" }}>KLIK UNTUK SYNC DATA</button>
                                    </div>
                                )}
                                {productsDb.map(p => (
                                    <div key={p.id} style={{ background: "white", padding: "18px", borderRadius: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", gap: "15px", alignItems: "center" }}>
                                        <img src={p.i} alt={p.n} style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "800", color: "var(--text-dark)", fontSize: "0.95rem" }}>{p.n}</div>
                                            <div style={{ fontSize: "0.75rem", color: p.brand === "Wellness" ? "var(--wellness)" : "var(--primary)", fontWeight: "700" }}>{p.brand}</div>
                                        </div>
                                        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div>
                                                <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#999", textTransform: "uppercase" }}>Sisa Stok</div>
                                                <input
                                                    type="number"
                                                    defaultValue={p.stock || 0}
                                                    id={`stock-${p.id}`}
                                                    style={{ width: "65px", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", fontWeight: "800", textAlign: "center", color: (p.stock || 0) <= 5 ? "red" : "inherit" }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => updateStock(p.id, document.getElementById(`stock-${p.id}`).value)}
                                                disabled={updating === p.id}
                                                style={{ background: "var(--text-dark)", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                {updating === p.id ? "..." : <i className="fa-solid fa-check"></i>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </>
    );
}
