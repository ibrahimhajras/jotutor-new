const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { SiteContent, FAQItem, AboutContent, ContactContent, HomepageContent, FooterContent } from '../types';
import ImageUploadInput from './ImageUploadInput';

interface ManageContentProps {
  content: SiteContent;
  onUpdate: (newContent: SiteContent) => void;
  isEnglishAdmin?: boolean;
}

type ContentTab = 'homepage' | 'about' | 'faq' | 'contact' | 'footer' | 'settings' | 'privacy' | 'terms' | 'paymentRefund';

const ManageContent: React.FC<ManageContentProps> = ({ content, onUpdate, isEnglishAdmin }) => {
  const [activeTab, setActiveTab] = useState<ContentTab>('homepage');
  const [localContent, setLocalContent] = useState<SiteContent>(JSON.parse(JSON.stringify(content)));
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLocalContent(JSON.parse(JSON.stringify(content)));
  }, [content, isEnglishAdmin]);

  const handleHomepageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalContent(prev => ({
        ...prev,
        homepage: { ...prev.homepage, [name]: value }
    }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalContent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalContent(prev => ({
        ...prev,
        footer: { ...(prev.footer || { description: '', description_en: '', rights: '', rights_en: '' }), [name]: value }
    }));
  };

  const handleAboutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'whyJoTutor') {
        setLocalContent(prev => ({ ...prev, about: { ...prev.about, [name]: value.split('\\n') } }));
    } else {
        setLocalContent(prev => ({ ...prev, about: { ...prev.about, [name]: value } }));
    }
  };

  const handleAboutImageChange = (name: string, value: string) => {
      setLocalContent(prev => ({ ...prev, about: { ...prev.about, [name]: value } }));
  };
  
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
     setLocalContent(prev => ({ ...prev, contact: { ...prev.contact, [name]: value } }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
    setLocalContent(prev => ({ ...prev, [field]: e.target.value }));
  };
  
  const handleFaqChange = (id: string, field: string, value: string) => {
    setLocalContent(prev => ({
        ...prev,
        faq: prev.faq.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addFaqItem = () => {
    setLocalContent(prev => ({
        ...prev,
        faq: [...prev.faq, { id: Date.now().toString(), question: '', answer: '', question_en: '', answer_en: '' }]
    }));
  };

  const handleSaveChanges = () => {
    onUpdate(localContent);
    setStatus({ message: isEnglishAdmin ? 'Content saved successfully!' : 'تم حفظ المحتوى بنجاح!', type: 'success' });
    setTimeout(() => setStatus(null), 3000);
  };
  
  const renderTabContent = () => {
    switch(activeTab) {
        case 'homepage':
            return (
                <div className="space-y-6">
                    <div className="p-4 border rounded-xl bg-green-50/20">
                        <h3 className="font-black mb-4 text-blue-900">إحصائيات الصفحة الرئيسية</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'Teacher', type: 'Count' },
                                { id: 'Acceptance', type: 'Rate' },
                                { id: 'Student', type: 'Count' },
                                { id: 'Satisfaction', type: 'Rate' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase">{stat.id}</label>
                                    <input name={\`stats\${stat.id}\${stat.type}\${isEnglishAdmin ? '_en' : ''}\` as any} value={(localContent.homepage as any)[\`stats\${stat.id}\${stat.type}\${isEnglishAdmin ? '_en' : ''}\`] || ''} onChange={handleHomepageChange} className="w-full p-2 border rounded mb-2 text-sm" />
                                    <input name={\`stats\${stat.id}Label\${isEnglishAdmin ? '_en' : ''}\` as any} value={(localContent.homepage as any)[\`stats\${stat.id}Label\${isEnglishAdmin ? '_en' : ''}\`] || ''} onChange={handleHomepageChange} className="w-full p-2 border rounded text-xs" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div className="p-4 border rounded-xl bg-gray-50">
                            <h3 className="font-bold mb-3">قسم الميزات</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="featuresTitle" value={localContent.homepage.featuresTitle || ''} onChange={handleHomepageChange} placeholder="عنوان الميزات" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="featuresSubtitle" value={localContent.homepage.featuresSubtitle || ''} onChange={handleHomepageChange} placeholder="وصف الميزات" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="feature1Title" value={localContent.homepage.feature1Title || ''} onChange={handleHomepageChange} placeholder="عنوان الميزة ١" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="feature1Desc" value={localContent.homepage.feature1Desc || ''} onChange={handleHomepageChange} placeholder="وصف الميزة ١" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="feature2Title" value={localContent.homepage.feature2Title || ''} onChange={handleHomepageChange} placeholder="عنوان الميزة ٢" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="feature2Desc" value={localContent.homepage.feature2Desc || ''} onChange={handleHomepageChange} placeholder="وصف الميزة ٢" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="feature3Title" value={localContent.homepage.feature3Title || ''} onChange={handleHomepageChange} placeholder="عنوان الميزة ٣" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="feature3Desc" value={localContent.homepage.feature3Desc || ''} onChange={handleHomepageChange} placeholder="وصف الميزة ٣" className="w-full p-3 border rounded-xl text-sm" />
                            </div>
                        </div>

                        <div className="p-4 border rounded-xl bg-gray-50">
                            <h3 className="font-bold mb-3">قسم كيف يعمل</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="howItWorksTitle" value={localContent.homepage.howItWorksTitle || ''} onChange={handleHomepageChange} placeholder="عنوان كيف يعمل" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="howItWorksSubtitle" value={localContent.homepage.howItWorksSubtitle || ''} onChange={handleHomepageChange} placeholder="وصف كيف يعمل" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="step1Title" value={localContent.homepage.step1Title || ''} onChange={handleHomepageChange} placeholder="خطوة ١" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="step1Desc" value={localContent.homepage.step1Desc || ''} onChange={handleHomepageChange} placeholder="وصف خطوة ١" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="step2Title" value={localContent.homepage.step2Title || ''} onChange={handleHomepageChange} placeholder="خطوة ٢" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="step2Desc" value={localContent.homepage.step2Desc || ''} onChange={handleHomepageChange} placeholder="وصف خطوة ٢" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="step3Title" value={localContent.homepage.step3Title || ''} onChange={handleHomepageChange} placeholder="خطوة ٣" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="step3Desc" value={localContent.homepage.step3Desc || ''} onChange={handleHomepageChange} placeholder="وصف خطوة ٣" className="w-full p-3 border rounded-xl text-sm" />
                            </div>
                        </div>

                        <div className="p-4 border rounded-xl bg-gray-50">
                            <h3 className="font-bold mb-3">عناوين الأقسام الأخرى</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="teacherSearchTitle" value={localContent.homepage.teacherSearchTitle || ''} onChange={handleHomepageChange} placeholder="عنوان البحث عن معلم" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="teacherSearchSubtitle" value={localContent.homepage.teacherSearchSubtitle || ''} onChange={handleHomepageChange} placeholder="وصف البحث عن معلم" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="discoverMoreTeachers" value={localContent.homepage.discoverMoreTeachers || ''} onChange={handleHomepageChange} placeholder="زر تصفح المزيد من المعلمين" className="w-full p-3 border rounded-xl text-sm" />
                                
                                <input name="coursesPreviewTitle" value={localContent.homepage.coursesPreviewTitle || ''} onChange={handleHomepageChange} placeholder="عنوان الدورات" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="coursesPreviewSubtitle" value={localContent.homepage.coursesPreviewSubtitle || ''} onChange={handleHomepageChange} placeholder="وصف الدورات" className="w-full p-3 border rounded-xl text-sm" />
                                <input name="discoverMoreCourses" value={localContent.homepage.discoverMoreCourses || ''} onChange={handleHomepageChange} placeholder="زر تصفح المزيد من الدورات" className="w-full p-3 border rounded-xl text-sm" />

                                <input name="testimonialsTitle" value={localContent.homepage.testimonialsTitle || ''} onChange={handleHomepageChange} placeholder="عنوان الآراء" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="testimonialsSubtitle" value={localContent.homepage.testimonialsSubtitle || ''} onChange={handleHomepageChange} placeholder="وصف الآراء" className="w-full p-3 border rounded-xl text-sm" />

                                <input name="aiPlannerTitle" value={localContent.homepage.aiPlannerTitle || ''} onChange={handleHomepageChange} placeholder="عنوان الذكاء الاصطناعي" className="w-full p-3 border rounded-xl font-bold" />
                                <input name="aiPlannerSubtitle" value={localContent.homepage.aiPlannerSubtitle || ''} onChange={handleHomepageChange} placeholder="وصف الذكاء الاصطناعي" className="w-full p-3 border rounded-xl text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'settings':
            return (
                <div className="space-y-8 animate-fade-in">
                    <div className="p-8 border-4 border-dashed border-blue-200 rounded-[2.5rem] bg-blue-50/30">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">💳</div>
                            <div>
                                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">إعدادات بوابة ماستركارد</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase">Real-Time Gateway Session Controller</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-blue-900 mb-2 uppercase tracking-widest">Active Mastercard Session ID</label>
                                <input 
                                    name="mastercardSessionId" 
                                    value={localContent.mastercardSessionId || ''} 
                                    onChange={handleSettingsChange} 
                                    className="w-full p-5 bg-white border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-600 font-mono text-blue-600 font-bold shadow-inner" 
                                    placeholder="Enter Session ID" 
                                />
                                <p className="mt-3 text-[10px] text-gray-400 font-bold leading-relaxed bg-white/50 p-3 rounded-lg border">
                                    ملاحظة: هذا المعرف يتم استخراجه من لوحة تحكم التاجر. إذا انتهت صلاحيته، ستظهر للطلاب رسالة "Session Expired". قم بتوليد معرف جديد وضعه هنا ليعمل الدفع فوراً.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border rounded-[2.5rem] bg-gray-50/50">
                        <h3 className="text-lg font-black text-blue-900 mb-4 uppercase">إعدادات النظام</h3>
                        <p className="text-xs text-gray-500 font-bold">تم نقل إعدادات المفاتيح الحساسة إلى متغيرات البيئة (Environment Variables) لزيادة الأمان.</p>
                    </div>
                </div>
            );
        case 'about':
            return (
                <div className="space-y-6">
                    <div className="p-4 border rounded-xl bg-gray-50">
                        <h3 className="font-bold mb-3">الصفحة الرئيسية وعناوين رئيسية</h3>
                        <input name="aboutTitle" value={localContent.about.aboutTitle || ''} onChange={handleAboutChange} className="w-full p-2 border rounded mb-3" placeholder="عنوان الصفحة (من نحن)"/>
                        <div className="mb-3">
                            <label className="block text-xs mb-1 font-bold">صورة الهيرو {isEnglishAdmin ? '(انجليزي)' : ''}</label>
                            <ImageUploadInput value={isEnglishAdmin ? (localContent.about.heroImage_en || '') : (localContent.about.heroImage || '')} onChange={(v) => handleAboutImageChange(isEnglishAdmin ? 'heroImage_en' : 'heroImage', v)} />
                        </div>
                    </div>
                    
                    <div className="p-4 border rounded-xl bg-gray-50">
                        <h3 className="font-bold mb-3">الرؤية</h3>
                        <input name="visionTitle" value={localContent.about.visionTitle || ''} onChange={handleAboutChange} className="w-full p-2 border rounded mb-2" placeholder="عنوان الرؤية"/>
                        <textarea name="vision" value={localContent.about.vision || ''} onChange={handleAboutChange} className="w-full p-2 border rounded mb-3" rows={3} placeholder="نص الرؤية"></textarea>
                        <div>
                            <label className="block text-xs mb-1 font-bold">صورة الرؤية {isEnglishAdmin ? '(انجليزي)' : ''}</label>
                            <ImageUploadInput value={isEnglishAdmin ? (localContent.about.visionImage_en || '') : (localContent.about.visionImage || '')} onChange={(v) => handleAboutImageChange(isEnglishAdmin ? 'visionImage_en' : 'visionImage', v)} />
                        </div>
                    </div>

                    <div className="p-4 border rounded-xl bg-gray-50">
                        <h3 className="font-bold mb-3">الرسالة</h3>
                        <input name="missionTitle" value={localContent.about.missionTitle || ''} onChange={handleAboutChange} className="w-full p-2 border rounded mb-2" placeholder="عنوان الرسالة"/>
                        <textarea name="mission" value={localContent.about.mission || ''} onChange={handleAboutChange} className="w-full p-2 border rounded" rows={3} placeholder="نص الرسالة"></textarea>
                    </div>

                    <div className="p-4 border rounded-xl bg-gray-50">
                        <h3 className="font-bold mb-3">مجتمع المعلمين</h3>
                        <input name="teacherCommunityTitle" value={localContent.about.teacherCommunityTitle || ''} onChange={handleAboutChange} className="w-full p-2 border rounded mb-2" placeholder="عنوان مجتمع المعلمين"/>
                        <textarea name="teacherCommunity" value={localContent.about.teacherCommunity || ''} onChange={handleAboutChange} className="w-full p-2 border rounded" rows={3} placeholder="نص مجتمع المعلمين"></textarea>
                    </div>

                    <div className="p-4 border rounded-xl bg-gray-50">
                        <h3 className="font-bold mb-3">لماذا نحن</h3>
                        <input name="whyJoTutorTitle" value={localContent.about.whyJoTutorTitle || ''} onChange={handleAboutChange} className="w-full p-2 border rounded mb-2" placeholder="عنوان لماذا تختارنا"/>
                        <textarea name="whyJoTutor" value={(localContent.about.whyJoTutor || []).join('\\n')} onChange={handleAboutChange} className="w-full p-2 border rounded" rows={4} placeholder="الأسباب (كل سبب في سطر جديد)"></textarea>
                    </div>
                </div>
            );
        case 'contact':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="email" value={localContent.contact.email || ''} onChange={handleContactChange} placeholder="البريد الإلكتروني" className="w-full p-3 border rounded-xl" />
                    <input name="phone" value={localContent.contact.phone || ''} onChange={handleContactChange} placeholder="رقم الهاتف" className="w-full p-3 border rounded-xl" />
                    <input name="address" value={localContent.contact.address || ''} onChange={handleContactChange} placeholder="العنوان" className="w-full p-3 border rounded-xl md:col-span-2" />
                    <input name="facebook" value={localContent.contact.facebook || ''} onChange={handleContactChange} placeholder="فيسبوك" className="w-full p-3 border rounded-xl" />
                    <input name="instagram" value={localContent.contact.instagram || ''} onChange={handleContactChange} placeholder="انستغرام" className="w-full p-3 border rounded-xl" />
                    <input name="youtube" value={localContent.contact.youtube || ''} onChange={handleContactChange} placeholder="يوتيوب" className="w-full p-3 border rounded-xl" />
                    <input name="linkedin" value={localContent.contact.linkedin || ''} onChange={handleContactChange} placeholder="لينكد إن" className="w-full p-3 border rounded-xl" />
                </div>
            );
        case 'faq':
            return (
                <div>
                    {localContent.faq.map(item => (
                        <div key={item.id} className="p-4 border rounded mb-4 bg-gray-50 relative">
                            <button onClick={() => setLocalContent(prev => ({ ...prev, faq: prev.faq.filter(f => f.id !== item.id) }))} className="absolute top-2 right-2 text-red-500 font-bold p-1">حذف</button>
                            <input value={isEnglishAdmin ? (item.question_en || '') : item.question} onChange={e => handleFaqChange(item.id, isEnglishAdmin ? 'question_en' : 'question', e.target.value)} className="w-full p-2 border rounded mb-2 font-bold mt-4" placeholder="السؤال" />
                            <textarea value={isEnglishAdmin ? (item.answer_en || '') : item.answer} onChange={e => handleFaqChange(item.id, isEnglishAdmin ? 'answer_en' : 'answer', e.target.value)} className="w-full p-2 border rounded" placeholder="الجواب" rows={3}></textarea>
                        </div>
                    ))}
                    <button onClick={addFaqItem} className="bg-blue-500 text-white px-4 py-2 rounded font-bold">إضافة سؤال جديد</button>
                </div>
            );
        case 'footer':
            return (
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-xl bg-gray-50">
                        <label className="block mb-2 font-bold text-sm">الوصف</label>
                        <textarea name="description" value={localContent.footer?.description || ''} onChange={handleFooterChange} className="w-full p-2 border rounded mb-2" rows={3} placeholder="وصف الفوتر (عربي)"></textarea>
                        <textarea name="description_en" value={localContent.footer?.description_en || ''} onChange={handleFooterChange} className="w-full p-2 border rounded" rows={3} placeholder="Footer Desc (EN)"></textarea>
                    </div>
                    <div className="p-4 border rounded-xl bg-gray-50">
                        <label className="block mb-2 font-bold text-sm">الحقوق</label>
                        <input name="rights" value={localContent.footer?.rights || ''} onChange={handleFooterChange} className="w-full p-2 border rounded mb-2" placeholder="جميع الحقوق محفوظة..." />
                        <input name="rights_en" value={localContent.footer?.rights_en || ''} onChange={handleFooterChange} className="w-full p-2 border rounded" placeholder="All rights reserved..." />
                    </div>
                </div>
            );
        case 'privacy':
        case 'terms':
        case 'paymentRefund':
            const f = activeTab === 'privacy' ? 'privacy' : activeTab === 'terms' ? 'terms' : 'paymentRefundPolicy';
            return <textarea value={(localContent as any)[f] || ''} onChange={e => handleTextChange(e, f)} rows={15} className="w-full p-4 border rounded-xl" placeholder="أدخل النص هنا..."></textarea>;
        default: return null;
    }
  };

  const tabs: { id: ContentTab, label: string }[] = [
      { id: 'homepage', label: isEnglishAdmin ? 'Homepage' : 'الرئيسية' },
      { id: 'about', label: isEnglishAdmin ? 'About' : 'من نحن' },
      { id: 'contact', label: isEnglishAdmin ? 'Contact' : 'تواصل معنا' },
      { id: 'faq', label: isEnglishAdmin ? 'FAQ' : 'الأسئلة الشائعة' },
      { id: 'footer', label: isEnglishAdmin ? 'Footer' : 'الفوتر' },
      { id: 'privacy', label: isEnglishAdmin ? 'Privacy' : 'الخصوصية' },
      { id: 'terms', label: isEnglishAdmin ? 'Terms' : 'الشروط والأحكام' },
      { id: 'paymentRefund', label: isEnglishAdmin ? 'Refund Policy' : 'سياسة الاسترجاع' },
      { id: 'settings', label: isEnglishAdmin ? 'Settings' : 'إعدادات النظام' },
  ];

  return (
    <div className="animate-fade-in pb-20">
      <h1 className="text-3xl font-black text-blue-900 mb-6">{isEnglishAdmin ? 'English Content' : 'إدارة المحتوى'}</h1>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <nav className="flex gap-2 overflow-x-auto border-b pb-4 mb-8 no-scrollbar">
            {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={\`px-6 py-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap \${activeTab === t.id ? 'bg-blue-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}\`}>
                    {t.label.toUpperCase()}
                </button>
            ))}
        </nav>
        <div className="min-h-[500px]">{renderTabContent()}</div>
        <div className="mt-12 pt-8 border-t bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
            <button onClick={handleSaveChanges} className="bg-blue-900 text-white font-black py-4 px-16 rounded-2xl shadow-xl hover:bg-blue-800 transition-all">
                {isEnglishAdmin ? 'Save Changes' : 'حفظ التغييرات'}
            </button>
        </div>
        {status && <div className="fixed bottom-10 right-10 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black z-[100] animate-bounce">{status.message}</div>}
      </div>
    </div>
  );
};

export default ManageContent;
\`;
fs.writeFileSync('src/admin/ManageContent.tsx', content);
