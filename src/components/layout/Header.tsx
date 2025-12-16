'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import Image from "next/image";
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import imgLogo from "@/assets/099112c81acd80ef13c7c5f5bbda4ccd24f36dfe.png";

export function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navKeys = ['membership', 'programs', 'media', 'blog', 'about', 'contact', 'login'];

  // Ensure these match the IDs in your page sections
  const sectionMap: Record<string, string> = {
    membership: 'membership',
    programs: 'programs',
    media: 'news', // 'MEDIA' likely maps to 'news' or similar based on previous file content
    blog: 'blog',
    about: 'about',
    contact: 'contact',
    login: 'login'
  };

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (key: string) => {
    const sectionId = sectionMap[key] || key;
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#' + sectionId);
    }

    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = () => {
    const nextLocale = locale === 'en' ? 'bn' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'md:bg-white/50 md:backdrop-blur-lg md:shadow-md' : 'bg-transparent'
      }`}>
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <div className="relative w-[40px] h-[40px] md:w-[60px] md:h-[60px] bg-white rounded-full flex items-center justify-center">
            <Image
              src={imgLogo}
              alt="Mountain Lover's Association Logo"
              className="w-[23px] h-[36px] md:w-[34px] md:h-[54px] object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleNavClick(key)}
              className={`text-[12px] uppercase hover:text-[#ffe500] transition-colors cursor-pointer ${isScrolled ? 'text-[#013370]' : 'text-white'
                }`}
            >
              {t(`nav.${key}`)}
            </button>
          ))}

          {/* Language Switcher */}
          <button
            onClick={handleLanguageChange}
            className={`flex items-center gap-2 text-[12px] uppercase hover:text-[#ffe500] transition-colors cursor-pointer border border-current px-3 py-1 rounded-full ${isScrolled ? 'text-[#013370]' : 'text-white'
              }`}
          >
            <Globe className="w-4 h-4" />
            <span>{locale === 'en' ? 'BN' : 'EN'}</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#013370] transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-4">
            {navKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className="text-[#013370] text-[14px] uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-2"
              >
                {t(`nav.${key}`)}
              </button>
            ))}

            {/* Mobile Language Switcher */}
            <button
              onClick={handleLanguageChange}
              className="flex items-center gap-2 text-[#013370] text-[14px] uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-2 border-t border-gray-100 mt-2 pt-4"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'en' ? 'SWITCH TO BENGALI' : 'SWITCH TO ENGLISH'}</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}