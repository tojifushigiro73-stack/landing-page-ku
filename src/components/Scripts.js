"use client";
import { useEffect } from "react";

const Scripts = () => {
    useEffect(() => {
        // 1. PEMBERSIHAN SERVICE WORKER (ZOMBIE CODE CLEANER)
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        }

        // 2. ONE SIGNAL (ID Valid dari Website Lama)
        const isProd = window.location.hostname === 'www.lamishabake.shop' || window.location.hostname === 'lamishabake.shop';
        if (isProd) {
            window.OneSignal = window.OneSignal || [];
            if (!document.getElementById('onesignal-sdk')) {
                const script = document.createElement('script');
                script.id = 'onesignal-sdk';
                script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                script.onload = () => {
                    window.OneSignal.push(function() {
                        window.OneSignal.init({
                            appId: "5915e37b-4344-4f12-b442-067ced458d88", // ID asli yang sudah terdaftar
                            notifyButton: { enable: false },
                        });
                    });
                };
            }
        }

        // 3. TAWK.TO (ID Valid dari Website Lama)
        if (!document.getElementById('tawk-script')) {
            window.Tawk_API = window.Tawk_API || {};
            window.Tawk_API.onLoad = function () {
                window.Tawk_API.hideWidget();
            };
            
            const tawk = document.createElement('script');
            tawk.id = 'tawk-script';
            tawk.async = true;
            tawk.src = 'https://embed.tawk.to/69d3437ec81db11c3ab8d6ee/1jlgjv9qc'; // Link asli yang valid
            tawk.charset = 'UTF-8';
            tawk.setAttribute('crossorigin', '*');
            document.head.appendChild(tawk);
        }

    }, []);

    return null;
};

export default Scripts;
