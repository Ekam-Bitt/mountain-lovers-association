'use client';

import Image from "next/image";
import imgAboutBg from "@/assets/de2be69e63e34878132f2e0895ece1dd6e2781ee.png";
import { useTranslations } from 'next-intl';

export function AboutSection() {
  const t = useTranslations('AboutSection');

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
        <h2 className="text-[#ffe500] text-[60px] text-center mb-12">{t('title')}</h2>

        {/* Text Content */}
        <div className="text-white text-[20px] leading-relaxed space-y-6 tracking-wide">
          <p>{t('p1')}</p>
          <p>{t('p2')}</p>
          <p>{t('p3')}</p>
          <p>{t('p4')}</p>
          <p>{t('p5')}</p>
        </div>
      </div>
    </section>
  );
}