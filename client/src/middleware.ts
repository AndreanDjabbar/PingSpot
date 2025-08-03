import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
    const jwtToken = request.cookies.get('auth_token')?.value;

    if (request.nextUrl.pathname.startsWith('/main')) {
        if (!jwtToken) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    if (request.nextUrl.pathname.startsWith('/auth')) {
        if (jwtToken) {
            return NextResponse.redirect(new URL('/main', request.url));
        }
    }
}