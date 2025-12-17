

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { getTranslations, getLocale } from 'next-intl/server';
import { BlogItem } from "@/types/domain";
import { formatDate } from "@/lib/utils";
import imgBlog1 from "@/assets/fb8368d3946e1c662b9b0d3a10662fb7bd1673a3.png";
import imgBlog2 from "@/assets/59338168212132e260612dde60e83f93504cd3ad.png";
import imgBlog3 from "@/assets/fc3c17cc72371f6d536e65dc52e1e813c6c44f13.png";

// Placeholder data for the blogs
const moreBlogs: BlogItem[] = [
    {
        id: 'item1',
        title: 'Blog 1',
        image: imgBlog1,
        author: 'Elena Fisher',
        date: '2024-01-10',
    },
    {
        id: 'item2',
        title: 'Blog 2',
        image: imgBlog2,
        author: 'Marc Dubois',
        date: '2024-01-15',
    },
    {
        id: 'item3',
        title: 'Blog 3',
        image: imgBlog3,
        author: 'Sarah Jenkins',
        date: '2024-02-02',
    },
    {
        id: 'item4',
        title: 'Blog 4',
        image: imgBlog1,
        author: 'David Chen',
        date: '2024-02-20',
    },
    {
        id: 'item5',
        title: 'Blog 5',
        image: imgBlog2,
        author: 'Emily Stone',
        date: '2024-03-05',
    }
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    await params;

    return {
        title: 'Our Blogs - Mountain Lovers Club',
        description: 'Read the latest stories and updates from the Mountain Lovers Club.',
    };
}

export default async function BlogsPage({ params }: { params: Promise<{ locale: string }> }) {
    // Await params to avoid unused warning if we needed it, but we can just get locale from getLocale()
    await params;
    return <BlogsPageContent />;
}

async function BlogsPageContent() {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: 'BlogsPage' });
    const tSection = await getTranslations({ locale, namespace: 'BlogsSection' });

    if (!moreBlogs || moreBlogs.length === 0) {
        return (
            <main className="min-h-screen bg-[#0356c2] py-20">
                <div className="max-w-[1280px] mx-auto px-6 text-center text-white">
                    <h1 className="text-[50px] md:text-[70px] mb-16 font-bold">{t('title')}</h1>
                    <p className="text-xl opacity-80">{tSection('noBlogs')}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0356c2] py-20">
            <div className="max-w-[1280px] mx-auto px-6">
                <h1 className="text-white text-[50px] md:text-[70px] text-center mb-16 font-bold">
                    {t('title')}
                </h1>

                {/* Vertical Scroll Container */}
                <div className="flex justify-center">
                    <div className="w-full max-w-5xl h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                        <div className="space-y-8">
                            {moreBlogs.map((blog) => (
                                <div key={blog.id} className="w-full">
                                    <Card className="bg-transparent border-none shadow-none text-left">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row items-center gap-8">
                                                {/* Image */}
                                                <div className="relative w-[180px] h-[180px] flex-shrink-0 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={blog.image}
                                                        alt={t(`items.${blog.id}.title`)}
                                                        fill
                                                        className="object-cover hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-white text-[30px] mb-2 font-bold">{t(`items.${blog.id}.title`)}</h3>
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <p className="text-[#ffe500] text-[14px] font-semibold">{blog.author}</p>
                                                        <p className="text-[#9cd4fc] text-[14px]">{formatDate(blog.date, locale)}</p>
                                                    </div>
                                                    <p className="text-[#ededed] text-[15px] leading-relaxed mb-4 line-clamp-3">
                                                        {t(`items.${blog.id}.excerpt`)}
                                                    </p>
                                                    <button className="text-[#ffe500] text-[15px] hover:underline font-medium">
                                                        {tSection('readMore')}
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>

                        {/* End of List Indicator */}
                        <div className="text-center py-2 mt-4 border-t border-white/10">
                            <p className="text-white/50 text-sm">{t('endOfList')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
