import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

// 1. Setup Internationalization Middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "bn"],

  // Used when no locale matches
  defaultLocale: "en",
});

export default function proxy(request: NextRequest) {
  // 2. Run next-intl middleware first to handle redirects/rewrites
  const response = intlMiddleware(request);

  // 3. Add Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // HSTS (only if using HTTPS)
  if (request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  // Content Security Policy
  // 'unsafe-eval' is required for some next-intl functionality in dev
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self';",
  );

  return response;
}

export const config = {
  // Match only internationalized pathnames
  // And exclude internal Next.js paths and static files
  matcher: ["/((?!api|_next|.*\\..*).*)", "/", "/(bn|en)/:path*"],
};
