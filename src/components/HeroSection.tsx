
import React, { useState, useEffect } from 'react';
import { HeroSlide, HomepageContent, Language } from '../types';

interface HeroSectionProps {
  onSignupClick: () => void;
  heroSlides: HeroSlide[];
  content?: HomepageContent;
  strings: { [key: string]: string };
  language: Language;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSignupClick, heroSlides = [], content, strings, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isEn = language === 'en';

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides]);

  const currentSlide = heroSlides[currentIndex];

  const Title: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const words = text.split(' ');
    const lastWord = words.pop();
    const mainText = words.join(' ');
    return (
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-tight px-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {mainText} <span className="text-green-400">{lastWord}</span>
        </h1>
    );
  };

  const stats = [
    {
      value: (isEn ? content?.statsTeacherCount_en : content?.statsTeacherCount) || '+750',
      label: (isEn ? content?.statsTeacherLabel_en : content?.statsTeacherLabel) || (isEn ? 'Tutors' : 'معلم ومعلمة'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      value: (isEn ? content?.statsAcceptanceRate_en : content?.statsAcceptanceRate) || '25%',
      label: (isEn ? content?.statsAcceptanceLabel_en : content?.statsAcceptanceLabel) || (isEn ? 'Acceptance Rate' : 'معدل القبول'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
        </svg>
      )
    },
    {
      value: (isEn ? content?.statsStudentCount_en : content?.statsStudentCount) || '+5000',
      label: (isEn ? content?.statsStudentLabel_en : content?.statsStudentLabel) || (isEn ? 'Students' : 'طالب مسجل'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      value: (isEn ? content?.statsSatisfactionRate_en : content?.statsSatisfactionRate) || '95%',
      label: (isEn ? content?.statsSatisfactionLabel_en : content?.statsSatisfactionLabel) || (isEn ? 'Satisfaction' : 'رضا أولياء الأمور'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col">
      <section className="relative text-white min-h-[450px] sm:min-h-[500px]">
         <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `url(${isEn && slide.imageUrl_en ? slide.imageUrl_en : slide.imageUrl})`,
                  opacity: index === currentIndex ? 1 : 0,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-32 flex flex-col items-center justify-center relative z-10">
          <div className="w-full max-w-4xl text-center">
            {currentSlide && <Title text={isEn && currentSlide.title_en ? currentSlide.title_en : currentSlide.title} />}
            {currentSlide && (
              <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-gray-200 max-w-2xl mx-auto px-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {isEn && currentSlide.description_en ? currentSlide.description_en : currentSlide.description}
              </p>
            )}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button onClick={onSignupClick} className="bg-green-500 text-white font-bold text-base sm:text-lg py-2.5 px-6 sm:py-3 sm:px-8 rounded-full hover:bg-green-600 transition-transform duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2 space-x-reverse">
                <span>{content?.heroButton || strings.heroButton}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l-5 5 5 5m-5-5h12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-10 sm:py-16 border-b border-gray-200 relative z-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="aspect-square rounded-full border-2 sm:border-4 border-green-500 bg-white flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 group text-center p-2 mx-auto w-full max-w-[140px] sm:max-w-[180px]">
                <div className="text-green-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                    {stat.icon}
                </div>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-blue-900 leading-tight">{stat.value}</h3>
                <p className="text-[8px] sm:text-xs md:text-sm text-gray-600 font-bold mt-0.5 sm:mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
