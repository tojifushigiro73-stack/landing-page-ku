import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Scripts from "@/components/Scripts";

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
  icons: {
    icon: "/apple-touch-icon.png",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${playfair.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </head>
      <body>
        <AppProvider>
          <Scripts />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
