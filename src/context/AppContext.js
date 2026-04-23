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
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const points = userSnap.data().points || 0;
            setLoyaltyPoints(points);
            localStorage.setItem('loyalty_v1', points);
        }
    };

    const addToCart = (product, variant, e) => {
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
        await signOut(auth);
        setCurrentUser(null);
    };

    return (
        <AppContext.Provider value={{
            cart, addToCart, removeFromCart,
            loyaltyPoints, setLoyaltyPoints,
            currentUser, logout,
            isRedeemingPoints, setIsRedeemingPoints,
            customerName, setCustomerName,
            distance, setDistance,
            location, setLocation
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
