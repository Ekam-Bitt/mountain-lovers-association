import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await argon2.hash('Admin123!@#');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('   Password: Admin123!@#');

    // Create sample verified member
    const memberPassword = await argon2.hash('Member123!@#');

    const member = await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {},
        create: {
            email: 'member@example.com',
            passwordHash: memberPassword,
            role: 'MEMBER_VERIFIED',
        },
    });

    console.log('✅ Verified member created:', member.email);
    console.log('   Password: Member123!@#');

    // Create sample news article
    const news = await prisma.news.upsert({
        where: { slug: 'welcome-to-mla' },
        update: {},
        create: {
            title: 'Welcome to Mountain Lovers Association',
            slug: 'welcome-to-mla',
            content: 'We are excited to launch our new platform for mountain climbing enthusiasts!',
            excerpt: 'Launching our new platform',
            status: 'PUBLISHED',
            publishedAt: new Date(),
            authorId: admin.id,
        },
    });

    console.log('✅ Sample news created:', news.title);

    // Create sample event
    const event = await prisma.event.upsert({
        where: { slug: 'beginners-climb-workshop' },
        update: {},
        create: {
            title: 'Beginners Climb Workshop',
            slug: 'beginners-climb-workshop',
            description: 'Learn the basics of rock climbing in a safe, supportive environment.',
            location: 'Local Climbing Gym',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
            capacity: 20,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            organizerId: admin.id,
        },
    });

    console.log('✅ Sample event created:', event.title);

    console.log('\n🎉 Seeding complete!');
    console.log('\nDefault credentials:');
    console.log('  Admin: admin@example.com / Admin123!@#');
    console.log('  Member: member@example.com / Member123!@#');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
