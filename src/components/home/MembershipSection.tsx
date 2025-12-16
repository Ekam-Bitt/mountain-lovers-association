'use client';

import Image from "next/image";
import imgMembership from "@/assets/1487fb9b56fc9a075eeb3555a15f1ce90fc4a202.png";
import imgMap from "@/assets/fe369899f9499675e74faf19aa84ec1403c41212.png";
import { useTranslations } from 'next-intl';

export function MembershipSection() {
  const t = useTranslations('MembershipSection');

  const handleRegister = () => {
    // Handle registration logic
    alert('Registration form would open here');
  };

  return (
    <section id="membership" className="relative bg-white py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Left Side - Image & Text */}
          <div className="relative w-full md:w-[716px]">
            <div className="relative h-[300px] md:h-[426px] overflow-hidden rounded-lg">
              <Image
                src={imgMembership}
                alt="Mountain climbing"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Side - Registration & Map */}
          <div className="w-full md:w-[249px] space-y-6">
            {/* Register Button */}
            <button
              onClick={handleRegister}
              className="w-full bg-[#013370] text-white text-[25px] py-3 hover:bg-[#035bc1] transition-colors"
            >
              {t('register')}
            </button>

            {/* Map */}
            <div className="relative border border-[#013370] overflow-hidden h-[200px] md:h-[284px]">
              <Image
                src={imgMap}
                alt="Location map"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded">
                <p className="text-[#035bc1] text-[10px] text-center whitespace-nowrap">{t('visitOffice')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}