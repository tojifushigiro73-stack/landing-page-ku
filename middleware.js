import { NextResponse } from "next/server";

export function middleware(request) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get("host") || "";

    // 1. Deteksi subdomain Admin
    if (hostname.startsWith("adminku.lamishabake.shop") || hostname.startsWith("adminku.localhost")) {
        if (url.pathname === "/") {
            return NextResponse.rewrite(new URL("/admin", request.url));
        }
    }

    // 2. Deteksi subdomain Kurir/Driver
    if (hostname.startsWith("kurir.lamishabake.shop") || hostname.startsWith("kurir.localhost")) {
        if (url.pathname === "/") {
            return NextResponse.rewrite(new URL("/driver", request.url));
        }
    }

    // 3. Cegah akses langsung /admin dan /driver lewat domain utama (HANYA UNTUK PRODUCTION)
    if (hostname.startsWith("www.lamishabake.shop") || hostname === "lamishabake.shop") {
        if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/driver")) {
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
