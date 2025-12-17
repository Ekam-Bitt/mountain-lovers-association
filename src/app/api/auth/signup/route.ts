import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { AuthService } from '@/services/auth.service';
import { checkRateLimit } from '@/lib/rate-limit';

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        await checkRateLimit(ip);

        const body = await req.json();
        const result = signupSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Security: Don't reveal account existence too explicitly, but for signup "Email already taken" is standard UX.
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        const hashedPassword = await AuthService.hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role: 'MEMBER_UNVERIFIED',
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Too Many Requests') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
