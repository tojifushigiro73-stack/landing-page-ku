"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [distance, setDistance] = useState(0);
    const [location, setLocation] = useState(null);

    const [peekedProduct, setPeekedProduct] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Initial Load for Cart
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart_v17')) || [];
        setCart(savedCart);
    }, []);

    const openPeek = (product) => {
        setPeekedProduct(product);
        setIsCartOpen(true);
    };

    const closePeek = () => {
        setPeekedProduct(null);
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

    const openWhatsApp = (customMsg = "") => {
        const defaultMsg = "Halo La Misha! Saya mau tanya-tanya seputar kuenya dong... 😊";
        const msg = customMsg || defaultMsg;
        const waUrl = `https://wa.me/6285836695103?text=${encodeURIComponent(msg)}`;
        window.location.href = waUrl;
    };

    return (
        <CartContext.Provider value={{
            cart, setCart, addToCart, removeFromCart,
            isRedeemingPoints, setIsRedeemingPoints,
            customerName, setCustomerName,
            distance, setDistance,
            location, setLocation,
            peekedProduct, openPeek, closePeek,
            isCartOpen, setIsCartOpen,
            openWhatsApp
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
