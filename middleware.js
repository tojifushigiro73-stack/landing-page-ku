import { NextResponse } from "next/server";

export function middleware(request) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get("host") || "";

    // 1. Deteksi jika user mengakses melalui adminku.lamishabake.shop
    if (hostname === "adminku.lamishabake.shop" || hostname === "adminku.localhost:3000") {
        // Jika mereka di root (/) subdomain admin, arahkan ke folder /admin
        if (url.pathname === "/") {
            return NextResponse.rewrite(new URL("/admin", request.url));
        }
    }

    // 2. Cegah user biasa mengakses /admin lewat domain utama lamishabake.shop
    if (hostname === "www.lamishabake.shop" || hostname === "lamishabake.shop" || hostname === "localhost:3000") {
        if (url.pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Jalankan middleware ini di semua rute, kecuali file statis dan API bawaan Next.js
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
