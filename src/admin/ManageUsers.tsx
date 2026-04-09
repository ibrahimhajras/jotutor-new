
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ManageUsersProps {
    users: UserProfile[];
    setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
    onViewUser: (user: UserProfile) => void;
    isEnglishAdmin?: boolean;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ users, setUsers, onViewUser, isEnglishAdmin }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = (users || []).filter(user => {
        const username = user.username || '';
        const email = user.email || '';
        const search = searchTerm.toLowerCase();
        return username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
    });

    const handleRemoveUser = (id: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setUsers(prev => prev.filter(user => user.id !== id));
        }
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">{isEnglishAdmin ? 'User Management' : 'إدارة المستخدمين'}</h1>
                <input
                    type="text"
                    placeholder={isEnglishAdmin ? "Search by name or email..." : "ابحث بالاسم أو البريد الإلكتروني..."}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md md:w-72"
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-right py-3 px-4 font-semibold text-sm">{isEnglishAdmin ? 'Name' : 'الاسم'}</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">{isEnglishAdmin ? 'Email' : 'البريد الإلكتروني'}</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">{isEnglishAdmin ? 'Type' : 'نوع الحساب'}</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">{isEnglishAdmin ? 'Actions' : 'الإجراءات'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{user.username}</td>
                                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                    <td className="py-3 px-4 text-gray-600">{user.userType}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <button onClick={() => onViewUser(user)} className="text-blue-500 hover:underline mr-4">{isEnglishAdmin ? 'View' : 'عرض'}</button>
                                        {!isEnglishAdmin && <button onClick={() => handleRemoveUser(user.id)} className="text-red-500 hover:underline">{isEnglishAdmin ? 'Delete' : 'حذف'}</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
