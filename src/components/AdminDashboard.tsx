
import React, { useState } from 'react';
import { 
    SiteContent, HeroSlide, OnboardingOptions, UserProfile, StaffMember, 
    Payment, Teacher, Course, Testimonial, BlogPost, Language 
} from '../types';

import AdminNav, { AdminView } from '../admin/AdminNav';
import ManageContent from '../admin/ManageContent';
import ManageCourses from '../admin/ManageCourses';
import ManageTeachers from '../admin/ManageTeachers';
import ManageTestimonials from '../admin/ManageTestimonials';
import ManageBlog from '../admin/ManageBlog';
import ManageOnboarding from '../admin/ManageOnboarding';
import ManageUsers from '../admin/ManageUsers';
import ManageStaff from '../admin/ManageStaff';
import ManagePayments from '../admin/ManagePayments';
import AdminUserView from '../admin/AdminUserView';
import ManageHeroSlides from '../admin/ManageHeroSlides';
import ManageWhatsAppRequests from '../admin/ManageWhatsAppRequests';

interface AdminDashboardProps {
    onLogout: () => void;
    content: SiteContent;
    setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
    heroSlides: HeroSlide[];
    setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>>;
    onboardingOptions: OnboardingOptions;
    setOnboardingOptions: React.Dispatch<React.SetStateAction<OnboardingOptions>>;
    users: UserProfile[];
    setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
    staff: StaffMember[];
    setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    teachers: Teacher[];
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    subjects: string[];
    testimonials: Testimonial[];
    setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
    blogPosts: BlogPost[];
    setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
    onActivateCourse: (paymentId: string) => Promise<void>;
    strings: { [key: string]: string };
    language: Language;
    isEnglishAdmin?: boolean; 
    isSuperAdmin?: boolean; // New Prop
    onToggleEnglishMode?: () => void; // New Prop
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeView, setActiveView] = useState<AdminView>('content'); // Default view
    const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

    const handleViewUser = (user: UserProfile) => {
        setViewingUser(user);
    };

    const handleBackToUsers = () => {
        setViewingUser(null);
    };

    const renderMainContent = () => {
        if (viewingUser) {
            return <AdminUserView user={viewingUser} onBack={handleBackToUsers} courses={props.courses} />;
        }

        switch (activeView) {
            case 'content':
                return <ManageContent content={props.content} onUpdate={props.setContent} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'onboarding':
                return <ManageOnboarding options={props.onboardingOptions} onUpdate={props.setOnboardingOptions} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'users':
                return <ManageUsers users={props.users} setUsers={props.setUsers} onViewUser={handleViewUser} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'staff':
                return <ManageStaff staff={props.staff} setStaff={props.setStaff} />;
             case 'payments':
                return <ManagePayments payments={props.payments} />;
            case 'teachers':
                return <ManageTeachers teachers={props.teachers} setTeachers={props.setTeachers} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'courses':
                return <ManageCourses 
                            courses={props.courses} 
                            setCourses={props.setCourses} 
                            courseCategories={props.onboardingOptions.serviceTypes} 
                            curriculums={props.onboardingOptions.curriculums}
                            isEnglishAdmin={props.isEnglishAdmin}
                        />;
            case 'testimonials':
                return <ManageTestimonials testimonials={props.testimonials} setTestimonials={props.setTestimonials} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'blog':
                return <ManageBlog posts={props.blogPosts} setPosts={props.setBlogPosts} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'heroImages':
                return <ManageHeroSlides heroSlides={props.heroSlides} setHeroSlides={props.setHeroSlides} isEnglishAdmin={props.isEnglishAdmin} />;
            case 'whatsapp-courses':
                return <ManageWhatsAppRequests payments={props.payments} onActivate={props.onActivateCourse} />;
            default:
                return <div>Welcome to the Admin Dashboard.</div>;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <AdminNav 
                        activeView={activeView}
                        setActiveView={setActiveView}
                        onLogout={props.onLogout}
                        strings={props.strings}
                        isEnglishAdmin={props.isEnglishAdmin}
                        isSuperAdmin={props.isSuperAdmin}
                        onSwitchMode={props.onToggleEnglishMode}
                    />
                    <main className="flex-1">
                        {renderMainContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
