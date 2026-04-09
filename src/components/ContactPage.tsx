import React from 'react';
import { SiteContent } from '../types';

interface ContactPageProps {
  content: SiteContent['contact'];
  strings: { [key: string]: string };
}

const ContactPage: React.FC<ContactPageProps> = ({ content, strings }) => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-blue-900">{content.contactTitle || strings.contactTitle}</h1>
          <p className="mt-4 text-lg text-gray-600">{content.contactSubtitle || 'نحن هنا لمساعدتك. تواصل معنا عبر القنوات التالية أو أرسل لنا رسالة مباشرة.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{strings.contactInfo}</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <p className="text-gray-700"><strong className="font-semibold">Email:</strong> <a href={`mailto:${content.email}`} className="text-green-600 hover:underline">{content.email}</a></p>
              </div>
              <div className="flex items-start">
                <p className="text-gray-700"><strong className="font-semibold">Phone:</strong> {content.phone}</p>
              </div>
              <div className="flex items-start">
                <p className="text-gray-700"><strong className="font-semibold">Address:</strong> {content.address}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{strings.contactFormTitle}</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{strings.yourName}</label>
                <input type="text" id="name" className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{strings.yourEmail}</label>
                <input type="email" id="email" className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">{strings.yourMessage}</label>
                <textarea id="message" rows={5} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required></textarea>
              </div>
              <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-md hover:bg-green-600">{strings.sendMessage}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
