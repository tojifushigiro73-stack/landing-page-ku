# Knowledge Graph Nodes

Dokumen ini mendefinisikan hubungan strategis antara implementasi teknis dan tujuan bisnis untuk dipetakan ke dalam Graph View (Obsidian/Graphify).

## Core Connections
- [[Firestore Save]] <---> [[Business Strategies]]
    - *Rasional:* Data order yang tersimpan di Firestore adalah sumber data utama untuk analisis perilaku pelanggan, produk terlaris, dan riset pasar (Market Research).
- [[Firestore Save]] <---> [[Cek Mutasi Otomatis]]
    - *Rasional:* Order ID yang dihasilkan pada saat [[Firestore Save]] akan digunakan sebagai referensi unik untuk sistem validasi pembayaran otomatis di masa mendatang.

## Technical Mapping
- [[CartSheet.js]] --menggunakan--> [[Firestore Save]]
- [[Firestore Save]] --menghasilkan--> [[Order ID]]
