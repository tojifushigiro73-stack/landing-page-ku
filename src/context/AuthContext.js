"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [authModalMode, setAuthModalMode] = useState(null); // null, 'login', 'logout'

    const ADMIN_EMAILS = ["ferinapratiwi72@gmail.com", "rendy.sena09@gmail.com"];
    const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

    // Initial Load for points from local storage (fallback)
    useEffect(() => {
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
                setLoyaltyPoints(0);
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
            console.error("Auth Sync Error:", err);
        }
    };

    const logout = async () => {
        if (!auth) return;
        await signOut(auth);
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            loyaltyPoints,
            setLoyaltyPoints,
            authModalMode,
            setAuthModalMode,
            isAdmin,
            ADMIN_EMAILS,
            logout,
            syncPoints
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
