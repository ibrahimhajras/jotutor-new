import React from 'react';
import { AboutContent } from '../types';

interface AboutPageProps {
  content: AboutContent;
  strings: { [key: string]: string };
}

const AboutPage: React.FC<AboutPageProps> = ({ content, strings }) => {

    return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-72 bg-cover bg-center" style={{ backgroundImage: `url(${content.heroImage_en || content.heroImage})` }}>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center">{content.aboutTitle}</h1>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">{content.visionTitle}</h2>
              <p className="text-xl text-gray-600 italic leading-relaxed">
                  "{content.vision}"
              </p>
            </div>
            <div className="order-1 md:order-2">
                <img src={content.visionImage_en || content.visionImage} alt="Vision" className="rounded-2xl shadow-xl w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">{content.missionTitle}</h2>
              <p className="text-lg text-gray-700 leading-loose">
                  {content.mission}
              </p>
          </div>
      </section>

      {/* Teacher Community Section */}
       <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">{content.teacherCommunityTitle}</h2>
            <p className="text-lg text-gray-700 leading-loose">
                {content.teacherCommunity}
            </p>
        </div>
      </section>
      
      {/* Why JoTutor Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-blue-900">{content.whyJoTutorTitle}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {content.whyJoTutor.map((point, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl flex items-start space-x-4 space-x-reverse transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-500">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                      </div>
                      <p className="text-gray-700 text-base mt-1">{point}</p>
                  </div>
              ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
