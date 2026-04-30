"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, where, serverTimestamp, increment, writeBatch } from "firebase/firestore";
import Navbar from "@/components/Navbar";

// Daftar email kurir resmi
const DRIVER_EMAILS = ["kurir@lamishabake.shop", "ferinapratiwi@gmail.com", "rendysena1@gmail.com"];

export default function DriverPage() {
    const { currentUser, setAuthModalMode } = useApp();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const watchIdRef = useRef(null);

    // Untuk TAHAP PENGEMBANGAN LOKAL, kita izinkan semua user yang sudah login.
    // Nanti saat rilis ke production (Vercel), ubah baris ini kembali ke: 
    // const isDriver = currentUser && DRIVER_EMAILS.includes(currentUser.email);
    const isDriver = !!currentUser;

    useEffect(() => {
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isDriver) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Hanya ambil pesanan yang berstatus DIKIRIM (siap diantar)
        const q = query(collection(db, "orders"), where("status", "==", "DIKIRIM"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isDriver]);

    const toggleTracking = (orderId) => {
        if (trackingOrderId === orderId) {
            // Berhenti melacak
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setTrackingOrderId(null);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Pelacakan dihentikan sementara.", type: 'info' } }));
        } else {
            // Mulai melacak order ini
            if (trackingOrderId !== null) {
                alert("Harap selesaikan atau hentikan pengantaran sebelumnya terlebih dahulu.");
                return;
            }

            if (!navigator.geolocation) {
                alert("Browser HP Anda tidak mendukung geolokasi GPS.");
                return;
            }

            setTrackingOrderId(orderId);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "GPS Aktif! Posisi Anda disiarkan ke pelanggan.", type: 'success' } }));

            watchIdRef.current = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        const orderRef = doc(db, "orders", orderId);
                        await updateDoc(orderRef, {
                            courierLocation: {
                                lat: latitude,
                                lng: longitude,
                                lastUpdated: serverTimestamp()
                            }
                        });
                    } catch (err) {
                        console.error("Tracking Update Error:", err);
                    }
                },
                (err) => {
                    console.warn("Geolocation Warning:", err.message);
                    if (watchIdRef.current) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                        watchIdRef.current = null;
                    }
                    setTrackingOrderId(null);
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Akses lokasi ditolak atau sinyal hilang.", type: 'error' } }));
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    };

    const finishDelivery = async (order) => {
        if (!confirm("Tandai pesanan ini sebagai SELESAI?")) return;

        try {
            // Hentikan pelacakan
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setTrackingOrderId(null);

            const batch = writeBatch(db);
            const orderRef = doc(db, "orders", order.id);
            
            // Hapus lokasi kurir agar tidak nyangkut di database, ubah status
            batch.update(orderRef, { 
                status: "SELESAI",
                courierLocation: null 
            });

            // Tambah poin loyalty ke customer jika bukan GUEST
            if (order.userId !== "GUEST") {
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
            }

            await batch.commit();
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Pesanan selesai diantar!", type: 'success' } }));
        } catch (err) {
            console.error("Finish Delivery Error:", err);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Gagal menyelesaikan pesanan.", type: 'error' } }));
        }
    };

    if (!currentUser) {
        return (
            <>
                <Navbar />
                <main className="container" style={{ paddingTop: "140px", paddingBottom: "100px", textAlign: "center", minHeight: "70vh" }}>
                    <div style={{ display: "inline-block", background: "#f5f5f5", padding: "30px", borderRadius: "24px" }}>
                        <i className="fa-solid fa-motorcycle" style={{ fontSize: "3rem", color: "var(--primary)", marginBottom: "20px" }}></i>
                        <h2 style={{ fontFamily: "var(--font-playfair)", color: "var(--text-dark)", marginBottom: "15px" }}>Aplikasi Kurir</h2>
                        <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "0.95rem" }}>Silakan login untuk melihat daftar pengantaran.</p>
                        <button 
                            onClick={() => setAuthModalMode('login')}
                            className="cta-btn" 
                            style={{ background: "var(--primary)", border: "none", color: "white", width: "100%" }}
                        >
                            LOGIN SEBAGAI KURIR
                        </button>
                    </div>
                </main>
            </>
        );
    }

    if (!isDriver) {
        return (
            <>
                <Navbar />
                <main className="container" style={{ paddingTop: "140px", paddingBottom: "100px", textAlign: "center", minHeight: "70vh" }}>
                    <div style={{ display: "inline-block", background: "#fdf2f6", padding: "20px 30px", borderRadius: "20px", border: "1.5px dashed var(--primary-light)" }}>
                        <i className="fa-solid fa-ban" style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "15px" }}></i>
                        <h2 style={{ fontFamily: "var(--font-playfair)", color: "var(--text-dark)", marginBottom: "10px" }}>Akses Ditolak</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Akun Anda belum terdaftar sebagai Kurir Resmi La Misha.</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: "120px", paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
                    <div style={{ background: "var(--primary)", width: "50px", height: "50px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.5rem" }}>
                        <i className="fa-solid fa-motorcycle"></i>
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-playfair)", margin: 0, color: "var(--text-dark)", fontSize: "1.5rem" }}>Tugas Pengantaran</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Halo, {currentUser.name}</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", marginBottom: "15px" }}></i>
                        <p>Mencari paket untuk diantar...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "24px", border: "1px dashed #ddd" }}>
                        <i className="fa-regular fa-face-smile-wink" style={{ fontSize: "3rem", color: "#ccc", marginBottom: "15px" }}></i>
                        <h3 style={{ color: "var(--text-dark)" }}>Santai Dulu!</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Belum ada pesanan yang siap diantar saat ini.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "20px" }}>
                        {orders.map(order => {
                            const isTrackingThis = trackingOrderId === order.id;

                            return (
                                <div key={order.id} style={{ 
                                    background: isTrackingThis ? "#fdf2f6" : "white", 
                                    padding: "20px", 
                                    borderRadius: "20px", 
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                                    border: isTrackingThis ? "2px solid var(--primary-light)" : "2px solid transparent",
                                    transition: "all 0.3s ease"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", marginBottom: "5px" }}>
                                                ORDER #{order.id.slice(-5).toUpperCase()}
                                            </div>
                                            <div style={{ fontWeight: "800", fontSize: "1.2rem", color: "var(--text-dark)" }}>{order.userName}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                                <i className="fa-solid fa-location-dot" style={{ color: "var(--primary)", marginRight: "5px" }}></i>
                                                {order.distance} km dari toko
                                            </div>
                                        </div>
                                        <a 
                                            href={`https://wa.me/${order.phone?.replace(/^0/, '62')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ background: "#25D366", color: "white", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", boxShadow: "0 4px 10px rgba(37, 211, 102, 0.3)" }}
                                        >
                                            <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.3rem" }}></i>
                                        </a>
                                    </div>

                                    <div style={{ background: "rgba(0,0,0,0.03)", padding: "12px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.85rem", color: "var(--text-dark)", lineHeight: 1.5 }}>
                                        <strong>Detail Pesanan:</strong><br/>
                                        {order.items.map(it => `${it.qty}x ${it.n}`).join(', ')}
                                    </div>

                                    {isTrackingThis ? (
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button 
                                                onClick={() => toggleTracking(order.id)}
                                                style={{ flex: 1, background: "white", border: "1.5px solid var(--primary)", color: "var(--primary)", padding: "14px", borderRadius: "14px", fontWeight: "800", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                                            >
                                                <i className="fa-solid fa-pause"></i> JEDA
                                            </button>
                                            <button 
                                                onClick={() => finishDelivery(order)}
                                                style={{ flex: 2, background: "var(--primary)", border: "none", color: "white", padding: "14px", borderRadius: "14px", fontWeight: "800", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(176, 39, 98, 0.3)" }}
                                            >
                                                <i className="fa-solid fa-check-double"></i> SELESAI ANTAR
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => toggleTracking(order.id)}
                                            disabled={trackingOrderId !== null}
                                            style={{ width: "100%", background: trackingOrderId !== null ? "#eee" : "var(--text-dark)", border: "none", color: trackingOrderId !== null ? "#aaa" : "white", padding: "16px", borderRadius: "14px", fontWeight: "800", cursor: trackingOrderId !== null ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontSize: "1rem" }}
                                        >
                                            <i className="fa-solid fa-location-arrow"></i> 
                                            {trackingOrderId !== null ? "MENUNGGU KURIR LAIN" : "MULAI ANTAR"}
                                        </button>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}
