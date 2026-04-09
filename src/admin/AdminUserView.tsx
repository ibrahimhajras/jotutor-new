import React from 'react';
import { UserProfile, Course } from '../types';

interface AdminUserViewProps {
    user: UserProfile;
    onBack: () => void;
    courses: Course[];
}

const DetailItem: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2 mt-2">
                {value.map(item => (
                    <span key={item} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">{item}</span>
                ))}
            </div>
        ) : (
            <p className="text-lg font-semibold text-gray-800 mt-1">{value || '-'}</p>
        )}
    </div>
);


const AdminUserView: React.FC<AdminUserViewProps> = ({ user, onBack, courses }) => {
    const enrolledCoursesDetails = user.enrolledCourses 
        ? courses.filter(course => user.enrolledCourses!.includes(course.id)) 
        : [];

    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-blue-600 hover:underline">&larr; العودة إلى المستخدمين</button>
                <h1 className="text-3xl font-bold text-gray-800 mr-4">ملف المستخدم: {user.username}</h1>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">المعلومات الشخصية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <DetailItem label="الاسم الكامل" value={user.username} />
                    <DetailItem label="البريد الإلكتروني" value={user.email} />
                    <DetailItem label="رقم الهاتف" value={user.phone} />
                    <DetailItem label="نوع الحساب" value={user.userType} />
                    <DetailItem label="العمر" value={user.age} />
                    <DetailItem label="الخدمة المطلوبة" value={user.serviceType} />
                    <DetailItem label="المرحلة التعليمية" value={user.educationStage} />
                    <DetailItem label="الصف الدراسي" value={user.grade} />
                    <DetailItem label="المنهاج" value={user.curriculum} />
                    <div className="md:col-span-2 lg:col-span-3">
                         <DetailItem label="المواد" value={user.subjects} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">الدورات المسجل بها</h2>
                {enrolledCoursesDetails.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCoursesDetails.map(course => (
                            <div key={course.id} className="border rounded-lg overflow-hidden flex flex-col">
                                <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover" />
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{course.teacher}</p>
                                    <p className="text-sm text-gray-500 mt-auto">{course.level}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد دورات مسجلة لهذا المستخدم.</p>
                )}
            </div>
        </div>
    );
};

export default AdminUserView;