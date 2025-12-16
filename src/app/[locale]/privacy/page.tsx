import { useTranslations } from 'next-intl';

export const metadata = {
    title: 'Privacy Policy - Mountain Lovers Club',
};

export default function PrivacyPage() {
    const t = useTranslations('PrivacyPage');

    return (
        <main className="min-h-screen bg-[#0356c2] text-white">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">{t('title')}</h1>
                <div className="prose max-w-none space-y-6 text-white">
                    <p>
                        {t('intro')}
                    </p>
                    <h2 className="text-2xl font-bold text-white">{t('section1.title')}</h2>
                    <p>
                        {t('section1.text')}
                    </p>
                    <ul className="list-disc pl-6">
                        <li>{t('section1.list.item1')}</li>
                        <li>{t('section1.list.item2')}</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white">{t('section2.title')}</h2>
                    <p>
                        {t('section2.text')}
                    </p>
                    {/* Placeholder for more content */}
                </div>
            </div>
        </main >
    );
}
