import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Scripts from "@/components/Scripts";
import OfflineBanner from "@/components/OfflineBanner";
import PWAInstallPopup from "@/components/PWAInstallPopup";
import Toast from "@/components/Toast";
import AuthModal from "@/components/AuthModal";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "La Misha Bakehouse | Kukis & Cake Terbaik di Kota Metro",
  description: "Kukis dan kue premium yang dipanggang segar setiap hari di Kota Metro. Rasakan kelezatan dalam setiap gigitan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LaMisha",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/apple-touch-icon.png",
    apple: "/apple-touch-icon.png",
  }
};

export const viewport = {
  themeColor: "#b02762",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${playfair.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.pwaDeferredPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.pwaDeferredPrompt = e;
              });
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Scripts />
            <OfflineBanner />
            <PWAInstallPopup />
            <Toast />
            <AuthModal />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
