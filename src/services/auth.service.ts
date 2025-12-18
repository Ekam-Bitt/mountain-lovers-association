import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env.server";
const SECRET_KEY = env.JWT_SECRET;
const ENCODED_SECRET = new TextEncoder().encode(SECRET_KEY);

export class AuthService {
  /**
   * Hash a plain password using Argon2
   */
  static async hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch (err) {
      console.error("Password verification failed", err);
      return false;
    }
  }

  /**
   * Sign a JWT payload
   */
  static async signJWT(
    payload: Record<string, unknown>,
    expiresIn: string = "7d",
  ): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(ENCODED_SECRET);
  }

  /**
   * Verify and decode a JWT token
   */
  static async verifyJWT<T>(token: string): Promise<T | null> {
    try {
      const { payload } = await jwtVerify(token, ENCODED_SECRET);
      return payload as T;
    } catch {
      return null;
    }
  }
}
