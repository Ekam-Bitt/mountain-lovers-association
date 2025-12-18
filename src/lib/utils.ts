import { NextRequest } from "next/server";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class name utility (for UI components)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pagination helpers
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getPaginationParams(req: NextRequest): PaginationParams {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Extract IP and User Agent from request
export function getRequestMetadata(req: NextRequest) {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      null,
    userAgent: req.headers.get("user-agent") || null,
  };
}

// Date formatting
export function formatDate(dateStr: string, locale: string = "en"): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateStr;
  }
}

// Deterministic pattern helper for consistent UI rendering (e.g., fallback images)
export function getDeterministicPattern<T>(
  id: string | number,
  patterns: T[],
): T {
  if (!patterns || patterns.length === 0) return undefined as unknown as T;
  const strId = String(id);
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % patterns.length;
  return patterns[index];
}
