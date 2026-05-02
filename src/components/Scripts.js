"use client";
import { useEffect } from "react";

const Scripts = () => {
    useEffect(() => {
        // 1. PWA SERVICE WORKER (Handled by OneSignal below to avoid conflicts)


        // 2. ONE SIGNAL
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isOfficialDomain = window.location.hostname === 'www.lamishabake.shop' || window.location.hostname === 'lamishabake.shop';
        
        // OneSignal is picky about domains. Only init on official domain or localhost.
        if (isOfficialDomain || isLocal) {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            
            if (window.OneSignalDeferred.length === 0) {
                window.OneSignalDeferred.push(async function(OneSignal) {
                    try {
                        await OneSignal.init({
                            appId: "5915e37b-4344-4f12-b442-067ced458d88",
                            allowLocalhostAsSecureOrigin: true,
                            serviceWorkerPath: "sw.js?v=3.2",
                            serviceWorkerParam: { scope: "/" },
                            serviceWorkerUpdaterPath: "sw.js?v=3.2",                            notifyButton: { 
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
                    } catch (err) {
                        console.warn("OneSignal Init Suppressed:", err.message);
                    }
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

    }, []);


    return null;
};

export default Scripts;
