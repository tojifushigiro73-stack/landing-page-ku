"use client";
import { useEffect } from "react";

const Scripts = () => {
    useEffect(() => {
        // 1. PWA SERVICE WORKER REGISTRATION
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const registerSW = () => {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA SW registered with scope: ', registration.scope);
                }).catch(function(err) {
                    console.log('PWA SW registration failed: ', err);
                });
            };

            if (document.readyState === 'complete') {
                registerSW();
            } else {
                window.addEventListener('load', registerSW);
            }
        }

        // 2. ONE SIGNAL
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isProd = window.location.hostname.includes('lamishabake') || window.location.hostname.includes('vercel.app') || isLocal;
        
        if (isProd) {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            
            // Push init task immediately (it will wait for the script to load)
            if (window.OneSignalDeferred.length === 0) {
                window.OneSignalDeferred.push(async function(OneSignal) {
                    await OneSignal.init({
                        appId: "5915e37b-4344-4f12-b442-067ced458d88",
                        allowLocalhostAsSecureOrigin: true,
                        notifyButton: { 
                            enable: true,
                            displayPredicate: () => {
                                return OneSignal.Notifications.permission !== 'granted';
                            }
                        },
                    });

                    // Hide bell immediately after permission is granted
                    const updateBellVisibility = (permission) => {
                        const isSubscribed = (permission || OneSignal.Notifications.permission) === 'granted';
                        if (isSubscribed) {
                            document.body.classList.add('os-subscribed');
                            const bell = document.querySelector('.onesignal-bell-container');
                            if (bell) bell.style.display = 'none';
                        } else {
                            document.body.classList.remove('os-subscribed');
                        }
                    };

                    OneSignal.Notifications.addEventListener('permissionChange', updateBellVisibility);
                    updateBellVisibility();
                });
            }

            if (!document.getElementById('onesignal-sdk')) {
                const script = document.createElement('script');
                script.id = 'onesignal-sdk';
                script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
                script.defer = true;
                document.head.appendChild(script);
            }
        }

        // 3. TAWK.TO (Munculkan Widget)
        if (!document.getElementById('tawk-script')) {
            const tawk = document.createElement('script');
            tawk.id = 'tawk-script';
            tawk.async = true;
            tawk.src = 'https://embed.tawk.to/69d3437ec81db11c3ab8d6ee/1jlgjv9qc';
            tawk.charset = 'UTF-8';
            tawk.setAttribute('crossorigin', '*');
            document.head.appendChild(tawk);
        }

    }, []);

    return null;
};

export default Scripts;
