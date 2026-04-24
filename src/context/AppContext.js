"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

const AppContext = createContext();

export function AppProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [distance, setDistance] = useState(0);
    const [location, setLocation] = useState(null);

    const [peekedProduct, setPeekedProduct] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const openPeek = (product) => {
        setPeekedProduct(product);
        setIsCartOpen(true);
    };

    const closePeek = () => {
        setPeekedProduct(null);
    };

    const ADMIN_EMAILS = ["ferinapratiwi72@gmail.com", "rendy.sena09@gmail.com"];

    const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

    // Initial Load
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart_v17')) || [];
        setCart(savedCart);
        const savedPoints = parseInt(localStorage.getItem('loyalty_v1')) || 0;
        setLoyaltyPoints(savedPoints);
    }, []);

    // Auth Listener
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    photo: user.photoURL
                };
                setCurrentUser(userData);
                await syncPoints(user);
            } else {
                setCurrentUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const syncPoints = async (user) => {
        if (!user || !db) return;
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const points = userSnap.data().points || 0;
                setLoyaltyPoints(points);
                localStorage.setItem('loyalty_v1', points);
            } else {
                // User baru, buat record di Firestore
                const newUserData = {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    points: 0,
                    createdAt: serverTimestamp()
                };
                await setDoc(userRef, newUserData);
                setLoyaltyPoints(0);
                localStorage.setItem('loyalty_v1', 0);
            }
        } catch (err) {
            console.error("Sync Error:", err);
        }
    };

    const addToCart = (product, variant) => {
        const newCart = [...cart, { n: product.n, l: variant.l, p: variant.p, i: product.i }];
        setCart(newCart);
        localStorage.setItem('cart_v17', JSON.stringify(newCart));
    };

    const removeFromCart = (idx) => {
        const newCart = [...cart];
        newCart.splice(idx, 1);
        setCart(newCart);
        localStorage.setItem('cart_v17', JSON.stringify(newCart));
    };

    const logout = async () => {
        if (!auth) return;
        await signOut(auth);
        setCurrentUser(null);
    };

    const openWhatsApp = (customMsg = "") => {
        const defaultMsg = "Halo La Misha! Saya mau tanya-tanya seputar kuenya dong... 😊";
        const msg = customMsg || defaultMsg;
        const waUrl = `https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`;
        window.location.href = waUrl;
    };

    return (
        <AppContext.Provider value={{
            cart, setCart, addToCart, removeFromCart,
            loyaltyPoints, setLoyaltyPoints,
            currentUser, logout,
            isRedeemingPoints, setIsRedeemingPoints,
            customerName, setCustomerName,
            distance, setDistance,
            location, setLocation,
            isAdmin, ADMIN_EMAILS,
            peekedProduct, openPeek, closePeek,
            isCartOpen, setIsCartOpen,
            openWhatsApp
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
