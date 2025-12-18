import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ----------------------------------------------------------------------
  // Users
  // ----------------------------------------------------------------------
  const adminPassword = await argon2.hash("Admin123!@#");
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { phoneNumber: "9999999999" },
    create: {
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      phoneNumber: "9999999999",
    },
  });
  console.log("✅ Admin user:", admin.email);

  const memberPassword = await argon2.hash("Member123!@#");
  const member1 = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { phoneNumber: "8888888888" },
    create: {
      email: "member@example.com",
      passwordHash: memberPassword,
      role: "MEMBER_VERIFIED",
      phoneNumber: "8888888888",
    },
  });
  console.log("✅ Member 1:", member1.email);

  const member2 = await prisma.user.upsert({
    where: { email: "member2@example.com" },
    update: { phoneNumber: "7777777777" },
    create: {
      email: "member2@example.com",
      passwordHash: memberPassword,
      role: "MEMBER_VERIFIED",
      phoneNumber: "7777777777",
    },
  });
  console.log("✅ Member 2:", member2.email);

  // ----------------------------------------------------------------------
  // News (5 Items for Carousel Validation)
  // ----------------------------------------------------------------------
  const newsData = [
    {
      title: "Welcome to Mountain Lovers Association",
      slug: "welcome-to-mla",
      excerpt:
        "We are thrilled to launch our new community platform. Join us in connecting with fellow climbers and nature enthusiasts.", // Short
      content: `We are excited to launch our new platform for mountain climbing enthusiasts! This has been a labor of love for our entire team.

Our goal is to build a vibrant community where members can share their experiences, find climbing partners, and stay updated on the latest safety guidelines and events. We have integrated features for event registration, blog sharing, and real-time news updates.

Membership benefits include access to exclusive workshops, discounts on gear rentals, and priority booking for our annual expeditions. We look forward to seeing you at our next meetup!`,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 10000000),
    },
    {
      title: "Annual Summit Challenge Announced",
      slug: "annual-summit-challenge",
      excerpt:
        "Registration is now open for our biggest event of the year. Challenge yourself against the toughest peaks in the region.",
      content: `The Annual Summit Challenge is back! This year we are targeting three major peaks in the region, offering different difficulty levels for climbers of all experiences.

The challenge will kick off next month with a base camp gathering. Participants will have the option to choose between the "Scenic Route" (Beginner/Intermediate) and the "Iron Crag" (Advanced).

Safety protocols have been enhanced this year, with more hydration stations and medical support teams on standby. Registration is open now and spots are filling up fast!`,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 8000000),
    },
    {
      title: "New Safety Guidelines for Winter Climbing",
      slug: "new-safety-guidelines",
      excerpt:
        "Important updates regarding avalanche safety and gear requirements for the upcoming winter season. Please read carefully.",
      content: `Safety is our top priority. With the changing climate patterns, we have updated our guidelines for winter climbing to ensure the well-being of all our members.

Effective immediately, all winter expeditions must carry certified avalanche beacons and probes. We have also partnered with local authorities to provide real-time weather alerts directly to your mobile devices.

Additionally, solo winter climbs are strictly discouraged in "Red Zones". Please consult the updated map in the Members Area before planning your trip. Stay safe out there!`,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 6000000),
    },
    {
      title: "Winter Expedition Slots Open",
      slug: "winter-expedition-open",
      excerpt:
        "Limited spots available for the guided winter expedition. Experience the serenity of snow-capped mountains with expert guides.",
      content: `Our winter expedition series offers a unique perspective of the landscape. The snow transforms familiar trails into magical winter wonderlands, but it also demands respect and preparation.

This guided tour is led by seasoned alpinists who will teach you essential winter survival skills, including snow shelter building and ice axe self-arrest.

The package includes all camping gear, food, and permits. Don't miss this opportunity to push your limits in a controlled environment.`,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 4000000),
    },
    {
      title: "Member Spotlight: Sarah Johnson",
      slug: "member-spotlight-sarah",
      excerpt:
        'Meet Sarah, who recently completed the "Seven Summits" challenge. Read about her inspiring journey and training routine.',
      content: `Sarah Johnson has been a member since 2020 and has achieved remarkable feats in a very short time. Her recent completion of the "Seven Summits" challenge is a testament to her dedication and resilience.

"It wasn't just about the physical climb," Sarah says. "It was about the mental fortitude required to keep going when every step felt like a mile."

In this exclusive interview, Sarah shares her training routine, her diet plan, and her advice for aspiring climbers. She emphasizes the importance of consistency and finding a supportive community like ours.`,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 2000000),
    },
  ];

  for (const news of newsData) {
    await prisma.news.upsert({
      where: { slug: news.slug },
      update: { ...news },
      create: { ...news, status: "PUBLISHED" },
    });
  }
  console.log(`✅ Seeded ${newsData.length} News items`);

  // ----------------------------------------------------------------------
  // Events (3 Items for Carousel/Card Validation)
  // ----------------------------------------------------------------------
  const eventsData = [
    {
      title: "Beginners Climb Workshop",
      slug: "beginners-climb-workshop",
      description: `Learn the basics of rock climbing, including knot tying, belaying, and safety checks. Perfect for absolute beginners looking to start their journey.

This 4-hour workshop covers:
- Introduction to climbing gear (harness, shoes, carabiners).
- Essential knots (Figure-8, Clove Hitch).
- Communication commands and belay techniques.
- Basic movement and hold types.

All gear is provided! Just bring comfortable clothes and water.`,
      location: "Local Climbing Gym",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
      ),
      organizerId: admin.id,
    },
    {
      title: "Advanced Alpinism Course",
      slug: "advanced-alpinism",
      description: `A 3-day intensive course covering ice climbing, glacier travel, and crevasse rescue. Prerequisites: Intermediate climbing experience and good fitness level.

Topics include:
- Crampon and ice axe techniques.
- Rope team travel on glaciers.
- Building snow anchors and hauling systems.
- Navigation in whiteout conditions.

Accommodation at the base camp lodge is included.`,
      location: "Base Camp Alpha",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      organizerId: admin.id,
    },
    {
      title: "Weekly Social Meetup",
      slug: "weekly-social-meetup",
      description:
        "Join us for a casual evening of drinks and climbing stories. A great way to find climbing partners and plan your next weekend adventure.",
      location: "The Crag Pub",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ),
      organizerId: admin.id,
    },
  ];

  for (const event of eventsData) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: { ...event },
      create: {
        ...event,
        status: "PUBLISHED",
        publishedAt: new Date(),
        capacity: 20,
      },
    });
  }
  console.log(`✅ Seeded ${eventsData.length} Events`);

  // ----------------------------------------------------------------------
  // Blogs (3 Items for Zig-Zag Layout Validation)
  // ----------------------------------------------------------------------
  const blogsData = [
    {
      title: "My First Climb",
      slug: "my-first-climb",
      excerpt:
        "Reflecting on my first climbing experience. The fear, the adrenaline, and the ultimate satisfaction of reaching the top changed my life forever.",
      content: `I just completed my first climb at the local gym. It was exhilarating! I've always been afraid of heights, so simply walking into the gym was a big step for me.

My instructor, Mike, was incredibly patient. He taught me how to trust the rope and my own body. The first few meters were terrifying—my hands were sweating, and my legs were shaking. But as I focused on the next hold, the world around me faded away.

Reaching the top anchor was a moment of pure joy. I looked down and realized how far I'd come, both literally and metaphorically. I'm already planning my next session!`,
      authorId: member1.id,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Climbing Gear Essentials",
      slug: "gear-essentials",
      excerpt:
        "Don't know what to buy? Here is a comprehensive list of essential gear for beginners, from shoes and harnesses to chalk bags and belay devices.",
      content: `Here is a list of essential gear for beginners that won't break the bank but will keep you safe and comfortable.

1. **Climbing Shoes**: The most important piece of gear. Look for a comfortable, flat-soled shoe for your first pair. Don't size them too aggressively tight.
2. **Harness**: Comfort is key. Try hanging in it at the shop to ensure it doesn't pinch your waist or legs.
3. **Chalk Bag**: Essential for keeping your hands dry and maintaining grip.
4. **Belay Device**: An ATC or a Grigri. Learn how to use it properly!

Remember, you can always rent gear at the gym before committing to a purchase.`,
      authorId: member1.id,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Mountain Photography Tips",
      slug: "mountain-photography",
      excerpt:
        "Capturing the beauty of the peaks requires patience, the right lighting, and a few technical tricks. Learn how to take stunning photos on your climbs.",
      content: `Capturing the beauty of the peaks requires patience and a good eye. But it also presents unique challenges, like harsh lighting and cold batteries.

**Lighting**: The "Golden Hour" (sunrise and sunset) offers the most dramatic light. Avoid shooting at noon when the sun is overhead and flat.
**Composition**: Use the "Rule of Thirds". Place your subject off-center to create a more dynamic image. Include a climber or a tent to give a sense of scale to the massive landscape.
**Gear Protection**: Keep your batteries warm (inside your jacket) as cold drains them quickly. Use a UV filter to protect your lens.`,
      authorId: member2.id,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const blog of blogsData) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: { ...blog },
      create: { ...blog, status: "PUBLISHED" },
    });
  }
  console.log(`✅ Seeded ${blogsData.length} Blogs`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
