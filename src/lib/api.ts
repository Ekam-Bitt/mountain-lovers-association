import { config } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data: any,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

async function fetchWrapper<T>(
  endpoint: string,
  method: HttpMethod,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${config.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const configOptions: RequestInit = {
    method,
    headers,
    ...options,
  };

  if (data) {
    configOptions.body = JSON.stringify(data);
  }

  // Auth handling
  if (typeof window === "undefined") {
    // Server-side: Dynamically import next/headers to avoid bundling issues in client components
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get(config.jwt.cookieName)?.value;
      if (token) {
        configOptions.headers = {
          ...configOptions.headers,
          Cookie: `${config.jwt.cookieName}=${token}`,
        };
      }
    } catch (error) {
      console.warn("Failed to fetch cookies on server-side:", error);
    }
  }

  try {
    const response = await fetch(url, configOptions);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Normalize network errors or other unexpected errors
    throw new ApiError(500, "Internal Server Error", {
      message: (error as Error).message,
    });
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    fetchWrapper<T>(endpoint, "GET", undefined, options),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T>(endpoint: string, data: any, options?: ApiRequestOptions) =>
    fetchWrapper<T>(endpoint, "POST", data, options),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T>(endpoint: string, data: any, options?: ApiRequestOptions) =>
    fetchWrapper<T>(endpoint, "PUT", data, options),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T>(endpoint: string, data: any, options?: ApiRequestOptions) =>
    fetchWrapper<T>(endpoint, "PATCH", data, options),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    fetchWrapper<T>(endpoint, "DELETE", undefined, options),
};

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      console.error("[API Error]:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation Error", details: error.issues },
          { status: 400 },
        );
      }

      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, data: error.data },
          { status: error.status },
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any).message || "Internal Server Error";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (error as any).status || 500;

      return NextResponse.json({ error: message }, { status });
    }
  };
}
