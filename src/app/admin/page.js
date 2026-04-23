"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "ferinapratiwi@gmail.com";

export default function AdminPage() {
  const { currentUser } = useApp();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ totalMembers: 0, totalPoints: 0 });

  useEffect(() => {
    if (currentUser && currentUser.email === ADMIN_EMAIL && db) {
      const q = query(collection(db, "users"), orderBy("points", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const membersData = [];
        let pointsSum = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          membersData.push(data);
          pointsSum += (data.points || 0);
        });
        setMembers(membersData);
        setStats({ totalMembers: snapshot.size, totalPoints: pointsSum });
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: "100px", textAlign: "center" }}>
        <h2 className="cat-title">Akses Dibatasi</h2>
        <p>Anda harus login di halaman utama untuk mengakses dashboard ini.</p>
        <button className="cta-btn" onClick={() => router.push("/")}>Login Sekarang</button>
      </div>
    );
  }

  if (currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="container" style={{ paddingTop: "100px", textAlign: "center" }}>
        <h2 className="cat-title">Akses Ditolak</h2>
        <p>Maaf, email <b>{currentUser.email}</b> bukan akun Admin La Misha.</p>
        <button className="cta-btn" onClick={() => router.push("/")}>Kembali ke Utama</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "100px" }}>
      <h1 className="cat-title">Admin Dashboard</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "20px", textAlign: "center", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Member</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>{stats.totalMembers}</div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "20px", textAlign: "center", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Poin Beredar</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--accent)" }}>{stats.totalPoints}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {members.map((m, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "15px", borderRadius: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=b02762&color=fff`} 
              style={{ width: "50px", height: "50px", borderRadius: "50%" }} 
              alt=""
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700" }}>{m.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{m.email}</div>
            </div>
            <div style={{ fontWeight: "700", color: "var(--primary)" }}>{m.points || 0} Poin</div>
          </div>
        ))}
      </div>
    </div>
  );
}
