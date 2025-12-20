"use client";

import Image from "next/image";
import imgMembership from "@/assets/1487fb9b56fc9a075eeb3555a15f1ce90fc4a202.png";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";

export function MembershipSection() {
  const t = useTranslations("MembershipSection");
  const router = useRouter();

  const handleRegister = () => {
    router.push("/login");
  };

  return (
    <section id="membership" className="relative bg-white py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Left Side - Image & Text */}
          <div className="relative w-full md:w-[716px]">
            <div className="w-full overflow-hidden rounded-lg">
              <Image
                src={imgMembership}
                alt="Mountain climbing"
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right Side - Registration & Map */}
          <div className="w-full md:w-[249px] space-y-6">
            {/* Register Button */}
            <button
              onClick={handleRegister}
              className="w-full bg-[#013370] text-white text-[20px] md:text-[25px] py-3 min-h-[48px] hover:bg-[#035bc1] active:scale-95 transition-all"
            >
              {t("register")}
            </button>

            {/* Map */}
            <div className="relative border border-[#013370] overflow-hidden h-[200px] md:h-[284px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7306.983336871607!2d86.9554503!3d23.6941301!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f71f5e940bcda9%3A0x9d6da1811bae186c!2sMOUNTAIN%20LOVERS&#39;%20ASSOCIATION!5e0!3m2!1sen!2sin!4v1766254456758!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map location of Mountain Lover's Association"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
