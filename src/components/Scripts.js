"use client";
import Script from "next/script";

export default function Scripts() {
  return (
    <>
      {/* OneSignal */}
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          if (window.location.hostname === 'www.lamishabake.shop' || window.location.hostname === 'lamishabake.shop') {
            window.OneSignalDeferred.push(async function (OneSignal) {
              await OneSignal.init({
                appId: "5915e37b-4344-4f12-b442-067ced458d88",
                notifyButton: { enable: false },
              });
            });
          }
        }}
      />

      {/* Tawk.to */}
      <Script
        id="tawk-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/69d3437ec81db11c3ab8d6ee/1jlgjv9qc';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              Tawk_API.onLoad = function() {
                Tawk_API.hideWidget();
              };
            })();
          `,
        }}
      />

      {/* Custom Floating Icon for Tawk.to */}
      <div 
        className="cs-floating-icon" 
        onClick={() => window.Tawk_API && window.Tawk_API.maximize()}
      >
        <i className="fa-solid fa-comment-dots"></i>
        <div className="cs-badge" style={{
          position: "absolute", top: "-2px", right: "-2px", background: "#e74c3c",
          color: "white", fontSize: "0.75rem", fontWeight: "700", width: "24px",
          height: "24px", borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", border: "3px solid white"
        }}>1</div>
      </div>
    </>
  );
}
