import prisma from '@/lib/db';
import { ConflictError } from '@/lib/errors';

export async function checkSlugUniqueness(
    model: 'news' | 'event' | 'blog',
    slug: string,
    excludeId?: string
): Promise<void> {
    const modelMap: any = {
        news: prisma.news,
        event: prisma.event,
        blog: prisma.blog,
    };

    const existing = await modelMap[model].findFirst({
        where: {
            slug,
            id: excludeId ? { not: excludeId } : undefined,
            deletedAt: null,
        },
    });

    if (existing) {
        throw new ConflictError(`A ${model} with this slug already exists.`);
    }
}
