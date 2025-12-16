import { Hero } from "@/components/home/Hero";
import { NewsSection } from "@/components/home/NewsSection";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { MembershipSection } from "@/components/home/MembershipSection";
import { BlogsSection } from "@/components/home/BlogsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { Newsletter } from "@/components/home/Newsletter";
import { ContactSection } from "@/components/home/ContactSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <NewsSection />
      <UpcomingEvents />
      <MembershipSection />
      <BlogsSection />
      <AboutSection />
      <Newsletter />
      <ContactSection />
    </main>
  );
}
