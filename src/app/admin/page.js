"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, where, orderBy, increment } from "firebase/firestore";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
    const { currentUser, isAdmin, ADMIN_EMAILS } = useApp();
    const [activeTab, setActiveTab] = useState("users"); // "users" or "orders"
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");
    const [orderFilter, setOrderFilter] = useState("ALL");
    const [updating, setUpdating] = useState(null);

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
                setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            }, (err) => {
                // Fallback jika index belum dibuat
                const q2 = query(collection(db, "users"));
                onSnapshot(q2, (snap) => {
                    setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setLoading(false);
                });
            });
        } else {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            unsubscribe = onSnapshot(q, (snap) => {
                setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            });
        }

        return () => unsubscribe && unsubscribe();
    }, [isAdmin, activeTab]);

    const updatePoints = async (userId, newPoints) => {
        setUpdating(userId);
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { points: parseInt(newPoints) });
            setUsers(users.map(u => u.id === userId ? { ...u, points: parseInt(newPoints) } : u));
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Poin berhasil diperbarui!", type: 'success' } }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal memperbarui poin.", type: 'error' } }));
        }
        setUpdating(null);
    };

    const updateOrderStatus = async (order, newStatus) => {
        setUpdating(order.id);
        try {
            const orderRef = doc(db, "orders", order.id);
            await updateDoc(orderRef, { status: newStatus });
            
            // Jika status jadi SELESAI, tambahkan poin ke user
            if (newStatus === "SELESAI" && order.userId !== "GUEST") {
                const userRef = doc(db, "users", order.userId);
                await updateDoc(userRef, { 
                    points: increment(order.pointsGained || 0) 
                });
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Pesanan selesai! ${order.pointsGained} poin telah ditambahkan.`, type: 'success' } }));
            } else {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Status diperbarui ke: ${newStatus}`, type: 'info' } }));
            }
        } catch (err) {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal memperbarui status.", type: 'error' } }));
        }
        setUpdating(null);
    };

    if (!currentUser) return <div style={{ padding: "100px 20px", textAlign: "center" }}>Silakan login terlebih dahulu.</div>;

    if (!isAdmin) {
        return <div style={{ padding: "100px 20px", textAlign: "center", color: "red" }}>Akses Ditolak. Halaman ini hanya untuk Admin.</div>;
    }

    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: "120px", paddingBottom: "100px" }}>
                <h1 style={{ fontFamily: "var(--font-playfair)", marginBottom: "10px", color: "var(--primary)" }}>Admin Dashboard</h1>
                <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Selamat datang, {currentUser.name}</p>

                {/* Tab Switcher */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "30px", background: "#f5f5f5", padding: "5px", borderRadius: "14px" }}>
                    <button 
                        onClick={() => setActiveTab("users")}
                        style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: activeTab === "users" ? "white" : "transparent", color: activeTab === "users" ? "var(--primary)" : "#666", fontWeight: "700", cursor: "pointer", boxShadow: activeTab === "users" ? "0 4px 10px rgba(0,0,0,0.05)" : "none" }}
                    >Data Member</button>
                    <button 
                        onClick={() => setActiveTab("orders")}
                        style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: activeTab === "orders" ? "white" : "transparent", color: activeTab === "orders" ? "var(--primary)" : "#666", fontWeight: "700", cursor: "pointer", boxShadow: activeTab === "orders" ? "0 4px 10px rgba(0,0,0,0.05)" : "none" }}
                    >Pesanan Masuk</button>
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
                ) : (
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
                                {["ALL", "MENUNGGU PEMBAYARAN", "SELESAI", "BATAL"].map((f) => (
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
                                                background: o.status === "SELESAI" ? "#e6fff0" : (o.status === "BATAL" ? "#fff0f0" : "#fff9e6"),
                                                color: o.status === "SELESAI" ? "#27ae60" : (o.status === "BATAL" ? "#e74c3c" : "#f39c12")
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
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${o.location.lat},${o.location.lng}`} 
                                                        target="_blank" 
                                                        style={{ fontSize: "0.75rem", color: "#007bff", textDecoration: "none", fontWeight: "700", display: "block", marginTop: "2px" }}
                                                    >
                                                        <i className="fa-solid fa-location-dot"></i> LIHAT PETA
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            {o.status === "MENUNGGU PEMBAYARAN" && (
                                                <>
                                                    <button 
                                                        onClick={() => updateOrderStatus(o, "SELESAI")}
                                                        style={{ flex: 1, background: "#27ae60", color: "white", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                                    >PESANAN SELESAI (KLAIM POIN)</button>
                                                    <button 
                                                        onClick={() => updateOrderStatus(o, "BATAL")}
                                                        style={{ background: "#fff", border: "1px solid #e74c3c", color: "#e74c3c", padding: "12px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                                    >BATAL</button>
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
                )}
            </main>
        </>
    );
}
