import { RateLimiterMemory } from 'rate-limiter-flexible';

// Centralized rate limit configurations
export const RATE_LIMITS = {
    AUTH: { points: 5, duration: 60 },        // 5 login/signup per minute
    REGISTRATION: { points: 10, duration: 3600 }, // 10 registrations per hour
    API_DEFAULT: { points: 100, duration: 60 },   // 100 requests per minute
};

// Rate limiters
const authLimiter = new RateLimiterMemory({
    points: RATE_LIMITS.AUTH.points,
    duration: RATE_LIMITS.AUTH.duration,
});

const registrationLimiter = new RateLimiterMemory({
    points: RATE_LIMITS.REGISTRATION.points,
    duration: RATE_LIMITS.REGISTRATION.duration,
});

// Brute-force protection: Track failed login attempts by email
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Progressive lockout durations (in seconds)
const LOCKOUT_DURATIONS = {
    5: 60,     // 5 failed attempts = 1 minute
    10: 600,   // 10 failed attempts = 10 minutes
    15: 3600,  // 15+ failed attempts = 1 hour
};

export async function checkRateLimit(identifier: string): Promise<void> {
    try {
        await authLimiter.consume(identifier);
    } catch {
        throw new Error('Too many requests. Please try again later.');
    }
}

export async function checkRegistrationRateLimit(identifier: string): Promise<void> {
    try {
        await registrationLimiter.consume(identifier);
    } catch {
        throw new Error('Too many registration attempts. Please try again later.');
    }
}

// Brute-force protection
export function recordFailedLogin(email: string): void {
    const now = new Date();
    const record = failedLoginAttempts.get(email);

    if (record) {
        failedLoginAttempts.set(email, {
            count: record.count + 1,
            lastAttempt: now,
        });
    } else {
        failedLoginAttempts.set(email, {
            count: 1,
            lastAttempt: now,
        });
    }
}

export function clearFailedLogins(email: string): void {
    failedLoginAttempts.delete(email);
}

export function checkBruteForce(email: string): void {
    const record = failedLoginAttempts.get(email);
    if (!record) return;

    const { count, lastAttempt } = record;
    const now = new Date();
    const timeSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / 1000;

    // Determine lockout duration based on attempt count
    let lockoutDuration = 0;
    if (count >= 15) lockoutDuration = LOCKOUT_DURATIONS[15];
    else if (count >= 10) lockoutDuration = LOCKOUT_DURATIONS[10];
    else if (count >= 5) lockoutDuration = LOCKOUT_DURATIONS[5];

    if (lockoutDuration > 0 && timeSinceLastAttempt < lockoutDuration) {
        const remainingTime = Math.ceil(lockoutDuration - timeSinceLastAttempt);
        throw new Error(
            `Account temporarily locked due to too many failed login attempts. Please try again in ${remainingTime} seconds.`
        );
    }

    // Clean up old records (> 1 hour)
    if (timeSinceLastAttempt > 3600) {
        failedLoginAttempts.delete(email);
    }
}
