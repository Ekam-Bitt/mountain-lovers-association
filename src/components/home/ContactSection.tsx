"use client";

import Image from "next/image";
import imgContactBg from "@/assets/d1c8f1d18e8d84943eb254657da65965012663c2.png";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function ContactSection() {
  const t = useTranslations("ContactSection");

  const handleContact = () => {
    toast.info("Contact form would open here");
  };

  return (
    <section id="contact" className="relative py-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imgContactBg}
          alt="Mountain landscape"
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-black text-[18px] italic mb-4">{t("subtitle")}</p>
        <h2 className="text-black text-[32px] md:text-[40px] max-w-[689px] leading-tight mb-8">
          {t("title")}
        </h2>
        <button
          onClick={handleContact}
          className="bg-[#0356c2] text-white text-[20px] px-8 py-3 min-h-[48px] tracking-wider hover:bg-[#013370] active:scale-95 transition-all"
        >
          {t("button")}
        </button>
      </div>
    </section>
  );
}
