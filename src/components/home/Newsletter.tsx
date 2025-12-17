'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function Newsletter() {
  const t = useTranslations('Newsletter');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Newsletter signup: ${email}`);
    setEmail('');
  };

  return (
    <section className="relative bg-[#ffe500] py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Quote */}
        <div className="text-center mb-12">
          <p className="text-black text-[60px] md:text-[80px]">&quot;</p>
          <p className="text-black text-[16px] md:text-[20px] max-w-[782px] mx-auto px-4">
            {t('quote')}
          </p>
          <p className="text-black text-[60px] md:text-[80px]">&quot;</p>
        </div>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4 md:gap-0 max-w-[900px] mx-auto">
          <label htmlFor="email" className="text-black text-[18px] md:text-[25px] tracking-wider md:mr-4 text-center md:text-left whitespace-nowrap">
            {t('label')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full md:flex-1 h-12 px-6 bg-white text-black text-base outline-none focus:ring-2 focus:ring-black z-10"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            className="w-full md:w-auto min-h-[48px] px-8 bg-black text-white text-[18px] md:text-[20px] tracking-wider hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap"
          >
            {t('button')}
          </button>
        </form>
      </div>
    </section>
  );
}