
export type Page = 
  'home' | 'teachers' | 'teacher-profile' | 'courses' | 'course-profile' | 
  'payment' | 'videos' | 'short-player' | 'blog' | 'article' | 'about' | 
  'contact' | 'faq' | 'privacy' | 'terms' | 'payment-refund' |
  'dashboard' | 'admin-dashboard' | 'admin-user-view';

export type DashboardView = 'profile' | 'courses' | 'wallet' | 'ai-assistant';

export type Currency = 'JOD' | 'USD' | 'SAR';
export type Language = 'ar' | 'en';

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageUrl_en?: string; 
  title_en?: string;
  description_en?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatarUrl: string;
  avatarUrl_en?: string; 
  level: string;
  experience: number;
  specialties: string[];
  rating: number;
  reviews: number;
  pricePerHour: number;
  bio: string;
  qualifications: string[];
  name_en?: string;
  level_en?: string;
  bio_en?: string;
  specialties_en?: string[];
  qualifications_en?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  avatarUrl_en?: string; 
  quote: string;
  name_en?: string;
  role_en?: string;
  quote_en?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    teacher: string;
    price?: number; 
    priceJod?: number;
    priceUsd?: number;
    priceSar?: number;
    duration: string;
    level: string;
    imageUrl: string;
    imageUrl_en?: string; 
    category: string;
    curriculum?: string;
    isFeatured?: boolean;
    sessionCount?: number;
    totalHours?: number;
    includedSubjects?: string;
    targetGrades?: string[];
    title_en?: string;
    description_en?: string;
    teacher_en?: string;
    level_en?: string;
    category_en?: string;
    curriculum_en?: string;
    duration_en?: string;
    includedSubjects_en?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    phone: string;
    password?: string;
    userType: 'Student' | 'Parent';
    serviceType: string;
    educationStage: string;
    grade: string;
    curriculum: string;
    subjects: string[];
    age: string;
    enrolledCourses?: string[];
}

export interface OnboardingOptions {
    serviceTypes: string[];
    educationStages: string[];
    curriculums: string[];
    subjects: string[];
    languages: string[];
    serviceTypes_en?: string[];
    educationStages_en?: string[];
    curriculums_en?: string[];
    subjects_en?: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  question_en?: string;
  answer_en?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageUrl_en?: string; 
  tags: string[];
  type: 'article' | 'short';
  youtubeVideoId?: string;
  title_en?: string;
  excerpt_en?: string;
  content_en?: string;
  tags_en?: string[];
}

export interface ContactContent {
  contactTitle?: string;
  contactSubtitle?: string;
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

export interface HomepageContent {
  featuresTitle: string;
  featuresSubtitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  teacherSearchTitle: string;
  teacherSearchSubtitle: string;
  discoverMoreTeachers: string;
  coursesPreviewTitle: string;
  coursesPreviewSubtitle: string;
  discoverMoreCourses: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  aiPlannerTitle: string;
  aiPlannerSubtitle: string;
  heroButton?: string;
  statsTeacherCount?: string;
  statsTeacherLabel?: string;
  statsAcceptanceRate?: string;
  statsAcceptanceLabel?: string;
  statsStudentCount?: string;
  statsStudentLabel?: string;
  statsSatisfactionRate?: string;
  statsSatisfactionLabel?: string;
  statsTeacherCount_en?: string;
  statsTeacherLabel_en?: string;
  statsAcceptanceRate_en?: string;
  statsAcceptanceLabel_en?: string;
  statsStudentCount_en?: string;
  statsStudentLabel_en?: string;
  statsSatisfactionRate_en?: string;
  statsSatisfactionLabel_en?: string;
}

export interface AboutContent {
  heroImage: string;
  heroImage_en?: string; 
  aboutTitle: string;
  visionTitle: string;
  vision: string;
  visionImage: string;
  visionImage_en?: string; 
  missionTitle: string;
  mission: string;
  teacherCommunityTitle: string;
  teacherCommunity: string;
  whyJoTutorTitle: string;
  whyJoTutor: string[];
}

export interface FooterContent {
    description: string;
    description_en: string;
    rights: string;
    rights_en: string;
}

export interface SiteContent {
  geminiApiKey?: string;
  mastercardSessionId?: string;
  homepage: HomepageContent;
  about: AboutContent;
  footer?: FooterContent;
  faq: FAQItem[];
  contact: ContactContent;
  privacy: string;
  terms: string;
  paymentRefundPolicy?: string;
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    courses?: Course[];
}

export type StaffPermission = 'Full Control' | 'Manage Teachers' | 'Manage Users' | 'Manage Blog';

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    permissions: StaffPermission;
}

export interface Payment {
    id: string;
    date: string;
    userId: string;
    userName: string;
    courseId: string;
    courseName: string;
    amount: number;
    currency: Currency;
    status: 'Success' | 'Failed' | 'Pending';
    paymentMethod?: 'Credit Card' | 'CliQ' | 'Manual';
    gatewayOrderId?: string;
    transactionId?: string;
}
