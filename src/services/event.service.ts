
import prisma from '@/lib/db';
import { ensureSlug } from '@/lib/validation';
import { checkSlugUniqueness } from '@/lib/slug';
import { AuditService } from '@/services/audit.service';
import { Prisma } from '@prisma/client';

export class EventService {
    /**
     * Create a new event
     */
    static async createEvent(userId: string, data: {
        title: string;
        description: string;
        location: string;
        startDate: Date | string;
        endDate: Date | string;
        capacity?: number | null;
        slug?: string;
        status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CANCELLED';
    }) {
        // Generate slug if not provided
        const slug = ensureSlug({ title: data.title, slug: data.slug });

        // Check slug uniqueness
        await checkSlugUniqueness('event', slug);

        // Create event
        const event = await prisma.event.create({
            data: {
                title: data.title,
                slug,
                description: data.description,
                location: data.location,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                capacity: data.capacity,
                status: data.status || 'DRAFT',
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
                organizerId: userId,
            },
        });

        // Create audit log
        await AuditService.log({
            entityType: 'Event',
            entityId: event.id,
            action: 'CREATE',
            userId: userId,
            changes: { status: event.status },
        });

        return event;
    }

    /**
     * Get events with pagination and filtering
     */
    static async getEvents(params: {
        skip?: number;
        take?: number;
        where?: Prisma.EventWhereInput;
        orderBy?: Prisma.EventOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                    _count: {
                        select: {
                            registrations: {
                                where: {
                                    status: 'CONFIRMED',
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                },
                orderBy: orderBy || { startDate: 'desc' },
                skip,
                take,
            }),
            prisma.event.count({ where }),
        ]);

        return { events, total };
    }

    /**
     * Get a single event
     */
    static async getEventById(id: string) {
        return prisma.event.findUnique({
            where: { id, deletedAt: null },
            include: {
                organizer: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Get a registration by ID
     */
    static async getRegistration(id: string) {
        return prisma.eventRegistration.findUnique({
            where: { id, deletedAt: null },
        });
    }

    /**
     * Get existing registration for user and event
     */
    static async getRegistrationForUser(eventId: string, userId: string) {
        return prisma.eventRegistration.findFirst({
            where: {
                eventId,
                userId,
                deletedAt: null,
            },
        });
    }

    /**
     * Count confirmed registrations
     */
    static async countConfirmedRegistrations(eventId: string) {
        return prisma.eventRegistration.count({
            where: {
                eventId,
                status: 'CONFIRMED',
                deletedAt: null,
            },
        });
    }

    /**
     * Register a user for an event
     */
    static async registerForEvent(eventId: string, userId: string) {
        const registration = await prisma.eventRegistration.create({
            data: {
                eventId,
                userId,
                status: 'PENDING',
            },
        });

        await AuditService.log({
            entityType: 'EventRegistration',
            entityId: registration.id,
            action: 'CREATE',
            userId,
            changes: { eventId, status: 'PENDING' },
        });

        return registration;
    }

    /**
     * Update an event registration
     */
    static async updateRegistration(regId: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING', userId: string) {
        const updated = await prisma.eventRegistration.update({
            where: { id: regId },
            data: {
                status,
                cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
            },
        });

        let action = 'UPDATE';
        if (status === 'CONFIRMED') action = 'CONFIRM';
        else if (status === 'CANCELLED') action = 'CANCEL';

        await AuditService.log({
            entityType: 'EventRegistration',
            entityId: regId,
            action,
            userId,
            changes: { status },
        });

        return updated;
    }
}
