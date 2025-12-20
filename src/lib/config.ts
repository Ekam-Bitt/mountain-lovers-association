/**
 * Get the correct API URL based on environment
 * - Client-side: Use relative path
 * - Server-side: Use absolute URL (Vercel or localhost)
 */
const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Server-side: need absolute URL
  if (typeof window === "undefined") {
    // Production on Vercel - use the production URL or fallback to known domain
    if (process.env.VERCEL_ENV === "production") {
      return "https://mountain-lovers-association.vercel.app/api";
    }
    // Preview/development on Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}/api`;
    }
    // Local development
    return "http://localhost:3000/api";
  }

  // Client-side: relative path works
  return "/api";
};

export const config = {
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  jwt: {
    // Removed secret from shared config to prevent leakage. Use env.server.ts on server.
    cookieName: "auth_token",
  },
  // Removed db config from shared file.
  apiUrl: getApiUrl(),
};
