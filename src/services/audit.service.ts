import prisma from '@/lib/db';

export interface AuditLogData {
    entityType: string;
    entityId: string;
    action: string;
    userId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string | null;
    userAgent?: string | null;
}

export class AuditService {
    static async log(data: AuditLogData) {
        return prisma.auditLog.create({
            data: {
                entityType: data.entityType,
                entityId: data.entityId,
                action: data.action,
                userId: data.userId,
                changes: data.changes ? JSON.stringify(data.changes) : null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
}
