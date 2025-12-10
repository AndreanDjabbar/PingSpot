import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const proxy = (request: NextRequest) => {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    const isAuthenticated = !!(accessToken || refreshToken);

    if (request.nextUrl.pathname.startsWith('/main')) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    if (request.nextUrl.pathname.startsWith('/auth')) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/main/home', request.url));
        }
    }
}