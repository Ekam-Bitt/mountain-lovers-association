import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import prisma from './db';
import { User } from '@prisma/client';
import { Role } from '@/types/auth';
import { UnauthorizedError, ForbiddenError } from './errors';

const AUTH_COOKIE = 'auth_token';

export type AuthSession = {
    userId: string;
    role: Role;
    email: string;
};

export async function getSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) return null;

    return AuthService.verifyJWT<AuthSession>(token);
}

export async function requireAuth(): Promise<AuthSession> {
    const session = await getSession();
    if (!session) {
        throw new UnauthorizedError('Authentication required. Please log in.');
    }
    return session;
}

export async function requireRole(allowedRoles: Role[]): Promise<AuthSession> {
    const session = await requireAuth();
    if (!allowedRoles.includes(session.role)) {
        throw new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }
    return session;
}

export async function requireAdmin(): Promise<AuthSession> {
    return requireRole(['ADMIN']);
}

export async function requireVerifiedMember(): Promise<AuthSession> {
    const session = await requireAuth();
    if (session.role === 'MEMBER_UNVERIFIED') {
        throw new ForbiddenError('Account verification required. Please verify your email.');
    }
    if (['MEMBER_VERIFIED', 'ADMIN'].includes(session.role)) {
        return session;
    }
    throw new ForbiddenError('Access denied.');
}

export async function getUserFromDb(userId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
}

// Ownership validation helper
export async function requireOwnership(
    resourceOwnerId: string,
    session: AuthSession,
    resourceType: string = 'resource'
): Promise<void> {
    if (session.userId !== resourceOwnerId && session.role !== 'ADMIN') {
        throw new ForbiddenError(`You can only modify your own ${resourceType}.`);
    }
}
