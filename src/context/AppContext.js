"use client";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

/**
 * AppContext Bridge (Deprecated)
 * Ini adalah bridge untuk memudahkan transisi setelah pemecahan context.
 * Disarankan untuk mulai menggunakan useAuth() atau useCart() secara langsung.
 */
export const useApp = () => {
    const auth = useAuth() || {};
    const cart = useCart() || {};
    
    return {
        // Defaults
        cart: [],
        currentUser: null,
        isAdmin: false,
        loyaltyPoints: 0,
        isRedeemingPoints: false,
        customerName: "",
        distance: 0,
        location: null,
        peekedProduct: null,
        isCartOpen: false,
        authModalMode: null,
        ADMIN_EMAILS: [],
        
        // Context Values
        ...auth,
        ...cart
    };
};

// Kosongkan AppProvider karena sudah diganti AuthProvider & CartProvider di layout.js
export function AppProvider({ children }) {
    return <>{children}</>;
}
