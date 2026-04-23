"use client";
import { useEffect } from "react";

const Scripts = () => {
    useEffect(() => {
        // 1. PEMBERSIHAN SERVICE WORKER (ZOMBIE CODE CLEANER)
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    console.log("Menghapus Service Worker Lama...");
                    registration.unregister();
                }
            });
        }

        // 2. ONE SIGNAL (Hanya di domain produksi)
        const isProd = window.location.hostname === 'www.lamishabake.shop' || window.location.hostname === 'lamishabake.shop';
        if (isProd) {
            window.OneSignal = window.OneSignal || [];
            if (!document.getElementById('onesignal-sdk')) {
                const script = document.createElement('script');
                script.id = 'onesignal-sdk';
                script.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
                script.async = true;
                document.head.appendChild(script);

                script.onload = () => {
                    window.OneSignal.push(function() {
                        window.OneSignal.init({
                            appId: "9316d29d-400a-4712-ae01-44331e847704",
                            safari_web_id: "web.onesignal.auto.10a9f6a6-4442-4217-a00d-565a0438a36d",
                            notifyButton: { enable: true },
                        });
                    });
                };
            }
        }

        // 3. TAWK.TO (Chat Widget)
        if (!document.getElementById('tawk-script')) {
            const tawk = document.createElement('script');
            tawk.id = 'tawk-script';
            tawk.async = true;
            tawk.src = 'https://embed.tawk.to/67035f5f3739577d91eac607/1i9j1883v';
            tawk.charset = 'UTF-8';
            tawk.setAttribute('crossorigin', '*');
            document.head.appendChild(tawk);
        }

    }, []);

    return null;
};

export default Scripts;
