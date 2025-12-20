"use client";

import Image from "next/image";
import imgAboutBg from "@/assets/de2be69e63e34878132f2e0895ece1dd6e2781ee.png";
import { useTranslations } from "next-intl";

export function AboutSection() {
  const t = useTranslations("AboutSection");

  return (
    <section id="about" className="relative py-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imgAboutBg}
          alt="Climbers on Mount Everest"
          fill
          className="object-cover"
          placeholder="blur"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(54,97,140,0.6)]" />

      {/* Content */}
      <div className="relative z-10 max-w-[1024px] mx-auto px-6 py-16">
        {/* Title */}
        <h2 className="text-[#ffe500] text-[40px] md:text-[60px] text-center mb-12">
          {t("title")}
        </h2>

        {/* Text Content */}
        <div className="text-white text-[18px] md:text-[20px] leading-relaxed tracking-wide space-y-8">
          <p>{t("intro")}</p>

          <div className="space-y-4">
            <h3 className="text-[#ffe500] font-bold text-2xl">
              {t("missionTitle")}
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("missionList.item1")}</li>
              <li>{t("missionList.item2")}</li>
              <li>{t("missionList.item3")}</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#ffe500] font-bold text-2xl">
              {t("whatDoTitle")}
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("whatDoList.item1")}</li>
              <li>{t("whatDoList.item2")}</li>
              <li>{t("whatDoList.item3")}</li>
              <li>{t("whatDoList.item4")}</li>
            </ul>
          </div>

          <p>{t("closing")}</p>
        </div>
      </div>
    </section>
  );
}
