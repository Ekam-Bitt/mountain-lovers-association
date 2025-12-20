"use client";

import Image from "next/image";
import imgLogo from "@/assets/099112c81acd80ef13c7c5f5bbda4ccd24f36dfe.png";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-[#030303] text-white">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-[134px] h-[134px] bg-white rounded-full flex items-center justify-center">
              <Image
                src={imgLogo}
                alt="Mountain Lover's Association Logo"
                fill
                sizes="134px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Address */}
          <div className="text-center md:text-left">
            <p className="text-[22px] mb-4">{t("title")}</p>
            <div className="text-[12px] text-gray-300">
              <p>{t("address.line1")}</p>
              <p>{t("address.line2")}</p>
              <p>{t("address.line3")}</p>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            {/* Terms & Privacy */}
            <div className="flex gap-4 text-[10px] md:text-right w-full justify-center md:justify-start">
              <Link
                href="/terms"
                className="hover:text-[#ffe500] md:hover:scale-110 active:scale-95 transition-all whitespace-nowrap"
              >
                {t("links.terms")}
              </Link>
              <span>/</span>
              <Link
                href="/privacy"
                className="hover:text-[#ffe500] md:hover:scale-110 active:scale-95 transition-all whitespace-nowrap"
              >
                {t("links.privacy")}
              </Link>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <div className="flex flex-row gap-4 justify-center md:justify-start">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] bg-white rounded-full flex items-center justify-center text-black hover:bg-[#ffe500] hover:text-black transition-all transform hover:scale-110"
                >
                  <FaFacebook className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] bg-white rounded-full flex items-center justify-center text-black hover:bg-[#ffe500] hover:text-black transition-all transform hover:scale-110"
                >
                  <FaInstagram className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] bg-white rounded-full flex items-center justify-center text-black hover:bg-[#ffe500] hover:text-black transition-all transform hover:scale-110"
                >
                  <FaTwitter className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] bg-white rounded-full flex items-center justify-center text-black hover:bg-[#ffe500] hover:text-black transition-all transform hover:scale-110"
                >
                  <FaYoutube className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-white text-black text-center py-2">
        <p className="text-[12px] tracking-wider">
          <a
            href="https://ekambitt.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0356c2] hover:underline transition-colors"
          >
            {t("copyright")}
          </a>
        </p>
      </div>
    </footer>
  );
}
