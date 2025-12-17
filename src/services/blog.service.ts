
import prisma from '@/lib/db';
import { ensureSlug } from '@/lib/validation';
import { checkSlugUniqueness } from '@/lib/slug';
import { AuditService } from '@/services/audit.service';
import { Prisma } from '@prisma/client';

export class BlogService {
    /**
     * Create a new blog post
     */
    static async createBlog(userId: string, data: {
        title: string;
        content: string;
        slug?: string;
        excerpt?: string;
        status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    }) {
        // Generate slug if not provided
        const slug = ensureSlug({ title: data.title, slug: data.slug });

        // Check slug uniqueness
        await checkSlugUniqueness('blog', slug);

        // Create blog post
        const blog = await prisma.blog.create({
            data: {
                title: data.title,
                slug,
                content: data.content,
                excerpt: data.excerpt,
                status: data.status || 'DRAFT',
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
                authorId: userId,
            },
        });

        // Create audit log
        await AuditService.log({
            entityType: 'Blog',
            entityId: blog.id,
            action: 'CREATE',
            userId: userId,
            changes: { status: blog.status },
        });

        return blog;
    }

    /**
     * Get blogs with pagination and filtering
     */
    static async getBlogs(params: {
        skip?: number;
        take?: number;
        where?: Prisma.BlogWhereInput;
        orderBy?: Prisma.BlogOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: orderBy || { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.blog.count({ where }),
        ]);

        return { blogs, total };
    }

    /**
     * Get a single blog by ID
     */
    static async getBlogById(id: string) {
        return prisma.blog.findUnique({
            where: { id, deletedAt: null },
            include: {
                author: {
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
     * Update a blog post
     */
    static async updateBlog(id: string, updates: Prisma.BlogUpdateInput, userId: string) {
        const blog = await prisma.blog.update({
            where: { id },
            data: updates,
        });

        // Audit Log
        let action = 'UPDATE';
        if (updates.status === 'PUBLISHED') action = 'PUBLISH';
        else if (updates.status === 'ARCHIVED') action = 'ARCHIVE';

        await AuditService.log({
            entityType: 'Blog',
            entityId: blog.id,
            action,
            userId: userId,
            changes: updates as Record<string, unknown>,
        });

        return blog;
    }

    /**
     * Soft delete a blog post
     */
    static async deleteBlog(id: string, userId: string) {
        await prisma.blog.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        await AuditService.log({
            entityType: 'Blog',
            entityId: id,
            action: 'DELETE',
            userId: userId,
        });
    }
}
