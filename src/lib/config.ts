export const config = {
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  jwt: {
    // Removed secret from shared config to prevent leakage. Use env.server.ts on server.
    cookieName: "auth_token",
  },
  // Removed db config from shared file.
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
};
