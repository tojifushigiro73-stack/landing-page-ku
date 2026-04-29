/**
 * Bisnis Logika untuk Pengiriman dan Poin
 */

/**
 * Menghitung ongkos kirim berdasarkan jarak dan jumlah item
 * @param {number} distance - Jarak dalam KM
 * @param {number} cartCount - Jumlah item dalam keranjang
 * @returns {number} Ongkos kirim dalam Rupiah
 */
export const calcOngkir = (distance, cartCount) => {
    if (distance <= 0) return 0;
    if (distance > 10) return -1; // -1 menandakan terlalu jauh / tanya WA
    
    // Gratis ongkir jika 3+ item dan jarak <= 7km
    if (cartCount >= 3 && distance <= 7) return 0;
    
    // Gratis ongkir jika jarak <= 5km
    if (distance <= 5) return 0;
    
    // Flat 5rb jika jarak 5-7km
    if (distance <= 7) return 5000;
    
    // Berdasarkan KM jika > 7km
    return Math.ceil(distance) * 2000;
};

/**
 * Menghitung diskon dari penukaran poin
 * @param {boolean} isRedeeming - Status apakah user ingin menukar poin
 * @param {number} points - Total poin user
 * @returns {object} Objek berisi diskon dan poin yang digunakan
 */
export const calculateRedeem = (isRedeeming, points) => {
    if (!isRedeeming || points < 10) {
        return { discount: 0, pointsUsed: 0 };
    }
    
    const pointsUsed = Math.floor(points / 10) * 10;
    const discount = (pointsUsed / 10) * 5000;
    
    return { discount, pointsUsed };
};

/**
 * Menghitung estimasi poin baru yang didapat dari subtotal
 * @param {number} subtotal 
 * @returns {number}
 */
export const calcPotentialPoints = (subtotal) => {
    return Math.floor(subtotal / 10000);
};
