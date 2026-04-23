import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminContent = document.getElementById('admin-content');
const authCheck = document.getElementById('auth-check');
const memberList = document.getElementById('member-list');

const ADMIN_EMAIL = "ferinapratiwi@gmail.com";

// Listener untuk mengecek apakah user login
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email !== ADMIN_EMAIL) {
            authCheck.innerHTML = `
                <h2 class="admin-title">Akses Ditolak</h2>
                <p>Maaf, email <b>${user.email}</b> bukan akun Admin La Misha.</p>
                <button class="cta-btn" style="border:none; margin-top:20px" onclick="window.location.href='index.html'">Kembali ke Utama</button>
            `;
            return;
        }
        
        // Tampilkan dashboard
        authCheck.style.display = 'none';
        adminContent.style.display = 'block';
        
        // Mulai memantau data member secara real-time
        fetchMembers();
    } else {
        // Minta login (Kembali ke index)
        authCheck.innerHTML = `
            <h2 class="admin-title">Akses Dibatasi</h2>
            <p>Anda harus login di halaman utama untuk mengakses dashboard ini.</p>
            <button class="cta-btn" style="border:none; margin-top:20px" onclick="window.location.href='index.html'">Login Sekarang</button>
        `;
    }
});

function fetchMembers() {
    const q = query(collection(db, "users"), orderBy("points", "desc"));
    
    // onSnapshot akan mengupdate data secara otomatis jika ada perubahan di Firestore
    onSnapshot(q, (snapshot) => {
        let membersHTML = '';
        let totalMembers = 0;
        let totalPoints = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            totalMembers++;
            totalPoints += (data.points || 0);

            membersHTML += `
                <div class="member-card">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=b02762&color=fff" style="width:50px; height:50px; border-radius:50%">
                    <div class="member-info">
                        <div class="member-name">${data.name}</div>
                        <div class="member-email">${data.email}</div>
                    </div>
                    <div class="member-points">${data.points || 0} Poin</div>
                </div>
            `;
        });

        memberList.innerHTML = membersHTML || '<p style="text-align:center; color:#999">Belum ada member yang terdaftar.</p>';
        document.getElementById('total-members').innerText = totalMembers;
        document.getElementById('total-points').innerText = totalPoints;
    });
}
