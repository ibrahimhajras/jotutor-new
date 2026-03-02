
import React, { useState, useMemo } from 'react';
import { Payment } from '../types';

interface ManagePaymentsProps {
    payments: Payment[];
}

const ManagePayments: React.FC<ManagePaymentsProps> = ({ payments }) => {
    const [filter, setFilter] = useState<'All' | 'Success' | 'Failed' | 'Pending'>('All');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const filteredPayments = useMemo<Payment[]>(() => {
        // تم إخفاء عرض بيانات الدفعات القادمة من Firebase (قاعدة البيانات)
        return [];
    }, [payments, filter]);

    return (
        <div>
            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-up">
                        <button
                            onClick={() => setSelectedPayment(null)}
                            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 text-center">تفاصيل الدفعة الكاملة</h2>

                        <div className="space-y-3 text-right max-h-[60vh] overflow-y-auto pl-2">
                            <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-2">
                                <span className="font-semibold text-gray-600">الحالة:</span>
                                <span className={`px-3 py-0.5 rounded-full text-sm font-bold w-fit ${selectedPayment.status === 'Success' ? 'bg-green-100 text-green-800' : (selectedPayment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                                    {selectedPayment.status === 'Success' ? 'ناجحة' : (selectedPayment.status === 'Pending' ? 'قيد الانتظار' : 'فاشلة')}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-2">
                                <span className="font-semibold text-gray-600">المبلغ:</span>
                                <span className="text-gray-800 font-bold text-lg">{selectedPayment.amount} {selectedPayment.currency}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-2">
                                <span className="font-semibold text-gray-600">التاريخ والوقت:</span>
                                <span className="text-gray-800 dir-ltr text-right">{new Date(selectedPayment.date).toLocaleString('ar-JO')}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-2">
                                <span className="font-semibold text-gray-600">اسم المستخدم:</span>
                                <span className="text-gray-800">{selectedPayment.userName}</span>
                            </div>
                            <div className="flex flex-col border-b border-gray-100 pb-2">
                                <span className="font-semibold text-gray-600 mb-1">اسم الدورة:</span>
                                <span className="text-gray-800 font-medium">{selectedPayment.courseName}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 pb-2">
                                <span className="font-semibold text-gray-600">طريقة الدفع:</span>
                                <span className="text-gray-800">{selectedPayment.paymentMethod || 'غير محدد'}</span>
                            </div>

                            {/* Technical Details Section */}
                            <div className="bg-gray-50 p-3 rounded-md mt-4 space-y-2">
                                <h3 className="font-bold text-gray-700 text-sm mb-2 border-b pb-1">بيانات تقنية</h3>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500">معرف العملية (Payment ID):</span>
                                    <span className="text-gray-800 font-mono text-xs break-all">{selectedPayment.id}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500">معرف المستخدم (User ID):</span>
                                    <span className="text-gray-800 font-mono text-xs break-all">{selectedPayment.userId}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500">معرف الدورة (Course ID):</span>
                                    <span className="text-gray-800 font-mono text-xs break-all">{selectedPayment.courseId}</span>
                                </div>
                                {selectedPayment.gatewayOrderId && (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500">رقم طلب البوابة (Gateway Order ID):</span>
                                        <span className="text-gray-800 font-mono text-xs break-all">{selectedPayment.gatewayOrderId}</span>
                                    </div>
                                )}
                                {selectedPayment.transactionId && (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500">رقم المعاملة (Transaction ID):</span>
                                        <span className="text-gray-800 font-mono text-xs break-all">{selectedPayment.transactionId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="bg-blue-900 text-white px-8 py-2 rounded-lg hover:bg-blue-800 font-bold transition-colors shadow-md"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">إدارة الدفعات</h1>
                <div className="flex space-x-2 space-x-reverse bg-gray-200 p-1 rounded-lg">
                    {(['All', 'Success', 'Pending', 'Failed'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-white text-blue-900 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                        >
                            {f === 'All' ? 'الكل' : (f === 'Success' ? 'الناجحة' : (f === 'Pending' ? 'قيد الانتظار' : 'الفاشلة'))}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {filteredPayments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg">لا توجد عمليات دفع لعرضها حالياً.</p>
                        {filter !== 'All' && <p className="text-sm">حاول تغيير الفلتر.</p>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-right py-3 px-4 font-semibold">المستخدم</th>
                                    <th className="text-right py-3 px-4 font-semibold">الدورة</th>
                                    <th className="text-right py-3 px-4 font-semibold">المبلغ</th>
                                    <th className="text-right py-3 px-4 font-semibold">طريقة الدفع</th>
                                    <th className="text-right py-3 px-4 font-semibold">رقم الطلب (Order ID)</th>
                                    <th className="text-right py-3 px-4 font-semibold">التاريخ</th>
                                    <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                                    <th className="text-right py-3 px-4 font-semibold">تفاصيل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-800">{payment.userName}</td>
                                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={payment.courseName}>{payment.courseName}</td>
                                        <td className="py-3 px-4 font-bold text-blue-900">{payment.amount} {payment.currency}</td>
                                        <td className="py-3 px-4">
                                            {payment.paymentMethod ? (
                                                <span className={`px-2 py-1 text-xs rounded border ${payment.paymentMethod === 'Credit Card' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                    {payment.paymentMethod}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-xs text-gray-500 max-w-[100px] truncate" title={payment.gatewayOrderId || payment.id}>
                                            {payment.gatewayOrderId || payment.id}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">{new Date(payment.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${payment.status === 'Success' ? 'bg-green-100 text-green-800' : (payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                                                {payment.status === 'Success' ? 'ناجحة' : (payment.status === 'Pending' ? 'معلقة' : 'فاشلة')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => setSelectedPayment(payment)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors text-xs font-bold"
                                            >
                                                عرض
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePayments;
