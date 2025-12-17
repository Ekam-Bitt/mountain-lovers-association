import createMiddleware from 'next-intl/middleware';

import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'bn'],

    // Used when no locale matches
    defaultLocale: 'en'
});

export default function middleware(request: NextRequest) {
    const response = intlMiddleware(request);

    // Set Content Security Policy
    // 'unsafe-eval' is required for some next-intl functionality and development features
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self';"
    );

    return response;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(bn|en)/:path*']
};


