import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard error response shape
export interface ErrorResponse {
    error: string;
    code?: string;
    details?: unknown;
    timestamp: string;
}

// Custom error classes
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed', details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}

// Format error response
export function formatErrorResponse(error: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    // Handle custom AppError instances
    if (error instanceof AppError) {
        return {
            error: error.message,
            code: error.code,
            details: error.details,
            timestamp,
        };
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.flatten(),
            timestamp,
        };
    }

    // Handle generic errors
    if (error instanceof Error) {
        return {
            error: error.message,
            timestamp,
        };
    }

    // Unknown error type
    return {
        error: 'Internal server error',
        timestamp,
    };
}

// Error handler wrapper for Next.js route handlers
export function withErrorHandler<T extends any[]>(
    handler: (...args: T) => Promise<NextResponse>
) {
    return async (...args: T): Promise<NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            console.error('Route error:', error);

            const errorResponse = formatErrorResponse(error);
            const statusCode = error instanceof AppError ? error.statusCode : 500;

            return NextResponse.json(errorResponse, { status: statusCode });
        }
    };
}
