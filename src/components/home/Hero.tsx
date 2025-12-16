'use client';

import Image from "next/image";
import imgHeroBg from "@/assets/hero.png";
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Image
          src={imgHeroBg}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-[1280px] mx-auto min-h-[400px] flex items-center justify-center">
        <h1 className="text-white text-[45px] md:text-[90px] font-bold leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {t('titleLine1')}<br />
          {t('titleLine2')}
        </h1>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}