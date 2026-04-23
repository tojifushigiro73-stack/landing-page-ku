"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from "firebase/firestore";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
    const { currentUser, isAdmin, ADMIN_EMAILS } = useApp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(list);
        } catch (err) {
            console.error("Fetch Users Error:", err);
            // Fallback jika index belum dibuat
            const q = query(collection(db, "users"));
            const snap = await getDocs(q);
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(list);
        }
        setLoading(false);
    };

    const updatePoints = async (userId, newPoints) => {
        setUpdating(userId);
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { points: parseInt(newPoints) });
            setUsers(users.map(u => u.id === userId ? { ...u, points: parseInt(newPoints) } : u));
            alert("Poin berhasil diperbarui!");
        } catch (err) {
            alert("Gagal memperbarui poin.");
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
                <h1 style={{ fontFamily: "var(--font-playfair)", marginBottom: "30px", color: "var(--primary)" }}>Admin Dashboard - Manajemen Poin</h1>

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
                        {filteredUsers.length === 0 && <p style={{ textAlign: "center", color: "#999", padding: "40px" }}>User tidak ditemukan.</p>}
                    </div>
                )}
            </main>
        </>
    );
}
