"use client";

import { useState, useEffect } from "react";
import { Menu, X, Globe, User, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import imgLogo from "@/assets/099112c81acd80ef13c7c5f5bbda4ccd24f36dfe.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const baseNavKeys = [
    "membership",
    "events",
    "media",
    "blogs",
    "about",
    "contact",
  ];

  // Ensure these match the IDs in your page sections
  const sectionMap: Record<string, string> = {
    membership: "membership",
    events: "events",
    media: "news",
    blogs: "blogs",
    about: "about",
    contact: "contact",
  };

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = async (key: string) => {
    if (key === "login") {
      router.push("/login");
      setIsMobileMenuOpen(false);
      return;
    }

    if (key === "logout") {
      await logout();
      setIsMobileMenuOpen(false);
      return;
    }

    // Direct page navigation for events and blogs
    if (key === "events") {
      router.push("/events");
      setIsMobileMenuOpen(false);
      return;
    }

    if (key === "blogs") {
      router.push("/blogs");
      setIsMobileMenuOpen(false);
      return;
    }

    // Anchor link navigation for sections on homepage
    const sectionId = sectionMap[key] || key;
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#" + sectionId);
    }

    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = () => {
    const nextLocale = locale === "en" ? "bn" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "md:bg-white/50 md:backdrop-blur-lg md:shadow-md"
          : "bg-transparent"
      }`}
    >
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
          {baseNavKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleNavClick(key)}
              className={`text-[12px] uppercase hover:text-[#ffe500] focus-visible:ring-2 focus-visible:ring-[#ffe500] outline-none rounded-sm transition-colors cursor-pointer ${
                isScrolled ? "text-[#013370]" : "text-white"
              }`}
            >
              {t(`nav.${key}`)}
            </button>
          ))}

          {/* Auth Section */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div
                  className={`flex items-center gap-2 cursor-pointer ${isScrolled ? "text-[#013370]" : "text-white"}`}
                >
                  <Avatar className="w-8 h-8 border border-current">
                    <AvatarFallback className="bg-transparent text-xs font-bold">
                      {user?.email?.substring(0, 2).toUpperCase() || "ME"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white text-black border-gray-200"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      My Account
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      user?.role === "ADMIN"
                        ? "/dashboard/admin"
                        : "/dashboard/member",
                    )
                  }
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className={`text-[12px] uppercase hover:text-[#ffe500] focus-visible:ring-2 focus-visible:ring-[#ffe500] outline-none rounded-sm transition-colors cursor-pointer ${isScrolled ? "text-[#013370]" : "text-white"}`}
            >
              {t("nav.login")}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={handleLanguageChange}
            className={`flex items-center gap-2 text-[12px] uppercase hover:text-[#ffe500] focus-visible:ring-2 focus-visible:ring-[#ffe500] outline-none transition-colors cursor-pointer border border-current px-3 py-1 rounded-full ${
              isScrolled ? "text-[#013370]" : "text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{locale === "en" ? "BN" : "EN"}</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-[#013370] transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-4">
            {isAuthenticated && (
              <div className="pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-3 px-2 mb-4">
                  <Avatar className="w-10 h-10 border border-[#013370] text-[#013370]">
                    <AvatarFallback className="bg-transparent font-bold">
                      {user?.email?.substring(0, 2).toUpperCase() || "ME"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#013370]">
                      My Account
                    </span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    router.push("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-[#013370] text-lg font-bold uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-2 px-2 rounded hover:bg-gray-50 flex items-center gap-2"
                >
                  <User size={18} /> Profile
                </button>
                <button
                  onClick={() => {
                    router.push(
                      user?.role === "ADMIN"
                        ? "/dashboard/admin"
                        : "/dashboard/member",
                    );
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-[#013370] text-lg font-bold uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-2 px-2 rounded hover:bg-gray-50 flex items-center gap-2"
                >
                  <LayoutDashboard size={18} /> Dashboard
                </button>
              </div>
            )}

            {baseNavKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className="text-[#013370] text-lg font-bold uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-4 border-b border-gray-100 last:border-0"
              >
                {t(`nav.${key}`)}
              </button>
            ))}

            {/* Mobile Auth Actions */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-600 text-lg font-bold uppercase hover:text-red-700 transition-colors cursor-pointer text-left py-4 border-t border-gray-100 flex items-center gap-2"
              >
                <LogOut size={18} /> LOGOUT
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="text-[#013370] text-lg font-bold uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-4 border-b border-gray-100 last:border-0"
              >
                {t("nav.login")}
              </button>
            )}

            {/* Mobile Language Switcher */}
            <button
              onClick={handleLanguageChange}
              className="flex items-center gap-2 text-[#013370] text-lg font-bold uppercase hover:text-[#ffe500] transition-colors cursor-pointer text-left py-4 border-t border-gray-100 mt-2"
            >
              <Globe className="w-5 h-5" />
              <span>
                {locale === "en" ? "SWITCH TO BENGALI" : "SWITCH TO ENGLISH"}
              </span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
