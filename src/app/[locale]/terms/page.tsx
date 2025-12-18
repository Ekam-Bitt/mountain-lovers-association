import { useTranslations } from "next-intl";

export const metadata = {
  title: "Terms of Service - Mountain Lovers Club",
};

export default function TermsPage() {
  const t = useTranslations("TermsPage");

  return (
    <main className="min-h-screen bg-[#0356c2] pb-24 pt-32">
      <div className="max-w-4xl mx-auto px-6 bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#0356c2]">
          {t("title")}
        </h1>
        <div className="prose max-w-none space-y-6 text-black/80">
          <p>{t("intro")}</p>
          <h2 className="text-2xl font-bold text-[#0356c2]">
            {t("section1.title")}
          </h2>
          <p>{t("section1.text")}</p>
          <h2 className="text-2xl font-bold text-[#0356c2]">
            {t("section2.title")}
          </h2>
          <p>{t("section2.text")}</p>
          <h2 className="text-2xl font-bold text-[#0356c2]">
            {t("section3.title")}
          </h2>
          <p>{t("section3.text")}</p>
          {/* Placeholder for more content */}
        </div>
      </div>
    </main>
  );
}
