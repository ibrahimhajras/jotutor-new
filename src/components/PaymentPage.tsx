
import React, { useState, useCallback } from 'react';
import { Course, Currency, Language, SiteContent } from '../types';

interface PaymentPageProps {
    course: Course;
    siteContent: SiteContent;
    currency: Currency;
    exchangeRate: number;
    strings: { [key: string]: string };
    language: Language;
    onEnroll: (course: Course, status: 'Success' | 'Pending', details?: any) => void;
    isLoggedIn: boolean;
    onLoginRequired: () => void;
}

declare global {
    interface Window {
        PaymentSession: any;
    }
}

const PaymentPage: React.FC<PaymentPageProps> = ({ course, onEnroll, isLoggedIn, onLoginRequired, strings, language }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [gatewayError, setGatewayError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'visa' | 'cliq' | 'bank'>('visa');
    const [showManualModal, setShowManualModal] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState<any>(null);
    const [paymentStep, setPaymentStep] = useState<string>('');

    const [sessionReady, setSessionReady] = useState(false);
    const [showOTPFrame, setShowOTPFrame] = useState(false);

    const log = useCallback((msg: string) => {
        const time = new Date().toLocaleTimeString();
        console.log(`[${time}] ${msg}`);
    }, []);

    const generateOrderId = () => `JOT-${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;

    const writeToIframe = (iframeId: string, html: string) => {
        const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
        if (!iframe) return;
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
        }
    };

    const translateGatewayError = (code: string) => {
        const errors: Record<string, string> = {
            'UNSPECIFIED_FAILURE': 'تم رفض العملية من قبل البنك المصدر للبطاقة. يرجى التأكد من الرصيد أو التواصل مع البنك.',
            'DECLINED': 'تم رفض البطاقة من قبل البنك.',
            'TIMED_OUT': 'انتهت مهلة الاتصال بالبنك. يرجى المحاولة مرة أخرى.',
            'EXPIRED_CARD': 'البطاقة منتهية الصلاحية.',
            'INSUFFICIENT_FUNDS': 'لا يوجد رصيد كافٍ في البطاقة.',
            'ACQUIRER_SYSTEM_ERROR': 'خطأ في نظام الدفع البنكي، يرجى المحاولة لاحقاً.',
            'SYSTEM_ERROR': 'خطأ في النظام، يرجى المحاولة لاحقاً.',
            'NOT_SUPPORTED': 'البطاقة غير مدعومة.',
            'DECLINED_DO_NOT_CONTACT': 'تم رفض البطاقة نهائياً. يرجى استخدام بطاقة أخرى.',
            'ABORTED': 'تم إلغاء العملية.',
            'BLOCKED': 'تم حظر البطاقة لأسباب أمنية.',
            'CANCELLED': 'تم إلغاء العملية من قبل المستخدم.',
            'INVALID_REQUEST': 'طلب الدفع غير صالح أو بيانات البطاقة خاطئة.',
            'REQUEST_REJECTED': 'تم رفض طلب الدفع من قبل البوابة.',
            'AUTHENTICATION_FAILED': 'فشل التحقق من الهوية (3D Secure).',
            'CARD_NOT_ENROLLED': 'البطاقة غير مسجلة في خدمة الأمان من البنك.',
            'INVALID_CARD': 'بيانات البطاقة غير صحيحة.'
        };
        // Remove spaces and make uppercase to ensure matching
        const cleanCode = (code || '').trim().toUpperCase();
        return errors[cleanCode] || code;
    };

    // ===========================
    // STEP 1: Create session + configure hosted fields
    // ===========================
    const initializePaymentSession = async (isRetry = false) => {
        const orderId = generateOrderId();
        const amount = course.priceJod || course.price || 1;

        try {
            if (!isRetry) {
                setIsLoading(true);
                setGatewayError(null);
            }
            // For retries silently mark session not ready until it completes
            setSessionReady(false);

            log(`🚀 Creating session: orderId=${orderId}, amount=${amount} JOD`);

            const resp = await fetch('/api/payment/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency: 'JOD', orderId })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(JSON.stringify(data));

            const { sessionId } = data;
            log(`✅ Session created: ${sessionId}`);

            if (!window.PaymentSession) throw new Error('PaymentSession library not loaded');

            log('⏳ Configuring hosted payment fields...');
            window.PaymentSession.configure({
                session: sessionId,
                fields: {
                    card: {
                        number: "#card-number",
                        securityCode: "#security-code",
                        expiryMonth: "#expiry-month",
                        expiryYear: "#expiry-year",
                        nameOnCard: "#cardholder-name"
                    }
                },
                frameEmbeddingMitigation: ["javascript"],
                callbacks: {
                    initialized: function (response: any) {
                        log(`✅ Hosted fields initialized: ${JSON.stringify(response)}`);
                        setSessionReady(true);
                        if (!isRetry) {
                            setIsLoading(false);
                            setShowCardForm(true); // Now we can safely show the form
                        }
                    },
                    formSessionUpdate: function (response: any) {
                        log(`📋 Form session update: status=${response.status}`);
                        if (response.status === "ok") {
                            log('✅ Card details tokenized');
                            handle3DSAndPay(orderId, sessionId, amount);
                        } else if (response.status === "fields_in_error") {
                            setIsLoading(false);
                            const errorFields = Object.keys(response.errors || {}).join(', ');
                            setGatewayError(`${strings.fieldsError || 'Card fields error'}: ${errorFields}`);
                            log(`❌ Card validation error: ${errorFields}`);
                        } else {
                            setIsLoading(false);
                            setGatewayError(strings.systemError || 'System error. Please try again.');
                            log(`❌ System error during tokenization`);
                        }
                    }
                },
                interaction: {
                    displayControl: {
                        formatCard: "EMBOSSED",
                        invalidFieldCharacters: "REJECT"
                    }
                }
            });
        } catch (err: any) {
            if (!isRetry) {
                setIsLoading(false);
                setGatewayError(err.message);
            }
            log(`💥 Error: ${err.message}`);
        }
    };

    // ===========================
    // STEP 2: Tokenize card
    // ===========================
    const handleSubmitPayment = () => {
        if (!sessionReady) return;
        setIsLoading(true);
        setGatewayError(null);
        setPaymentStep(strings.checkingCardData || 'Checking card data...');
        log('📤 Submitting card for tokenization...');
        window.PaymentSession.updateSessionFromForm('card');
    };

    // ===========================
    // STEP 3: 3DS flow via server-side API calls
    // Hidden iframe for device fingerprinting, visible iframe for OTP
    // ===========================
    const handle3DSAndPay = async (orderId: string, sid: string, amount: number) => {
        try {
            setPaymentStep(strings.security3DS || '3DS Security Authentication...');
            const authTransId = `auth-${Date.now()}`;

            // ---- 3a: INITIATE_AUTHENTICATION (device fingerprinting - HIDDEN iframe) ----
            log('🔐 Step 1: INITIATE_AUTHENTICATION (background device fingerprinting)...');
            const initResp = await fetch('/api/payment/initiate-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, transactionId: authTransId, sessionId: sid, currency: 'JOD' })
            });
            const initData = await initResp.json();
            log(`📋 InitAuth response: result=${initData.result}, redirectVersion=${initData.authentication?.redirect?.version}`);

            if (initData.result === 'ERROR') {
                throw new Error(`3DS Init failed: ${initData.error?.explanation || JSON.stringify(initData.error)}`);
            }

            // Inject into HIDDEN iframe and wait for device fingerprinting (~3 sec)
            const initHtml = initData.authentication?.redirect?.html;
            if (initHtml) {
                log('📱 Injecting device fingerprinting into hidden iframe...');
                writeToIframe('hidden-3ds-frame', initHtml);
                // Give device fingerprinting time to complete
                await new Promise(r => setTimeout(r, 3000));
            }

            // ---- 3b: AUTHENTICATE_PAYER (OTP challenge - VISIBLE iframe) ----
            log('🔐 Step 2: AUTHENTICATE_PAYER (OTP challenge)...');
            setPaymentStep(strings.completeBankVerification || 'Please complete bank verification...');

            const authResp = await fetch('/api/payment/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    transactionId: authTransId,
                    sessionId: sid,
                    amount,
                    currency: 'JOD',
                    browserDetails: {
                        javaEnabled: navigator.javaEnabled?.() || false,
                        language: navigator.language,
                        screenHeight: screen.height,
                        screenWidth: screen.width,
                        timeZone: new Date().getTimezoneOffset(),
                        colorDepth: screen.colorDepth,
                        returnUrl: window.location.origin + '/api/payment/3ds-callback'
                    }
                })
            });
            const authData = await authResp.json();
            log(`📋 Auth response: result=${authData.result}, payerInteraction=${authData.authentication?.payerInteraction}`);

            if (authData.result === 'ERROR') {
                throw new Error(`3DS Auth failed: ${authData.error?.explanation || JSON.stringify(authData.error)}`);
            }

            let otpHtml = authData.authentication?.redirect?.html;

            // No challenge needed (frictionless) — only if payerInteraction explicitly says NOT_REQUIRED
            if (!otpHtml && authData.authentication?.payerInteraction === 'NOT_REQUIRED') {
                log('✅ Frictionless auth - no OTP needed, proceeding to PAY...');
                await executePayment(orderId, sid, amount, authTransId);
                return;
            }

            if (otpHtml) {
                // Forcibly rewrite ANY target attribute to _self so it can't break out of the iframe
                log('🛠️ Rewriting form target to stay in iframe...');
                otpHtml = otpHtml.replace(/target=["'][^"']*["']/gi, 'target="_self"');

                // If it didn't have a target at all, ensure we add it just in case there's a base target
                if (!otpHtml.toLowerCase().includes('target=')) {
                    otpHtml = otpHtml.replace(/<form/i, '<form target="_self"');
                }
            }

            // Challenge needed — render OTP in the visible iframe
            log('🌐 OTP challenge required - rendering iframe...');
            setShowOTPFrame(true); // Show overlay containing the iframe

            await new Promise(r => setTimeout(r, 200));
            writeToIframe('otp-3ds-frame', otpHtml || '');

            // Listen for completion message from our /api/payment/3ds-callback
            // The callback posts to window.top/parent
            await new Promise<void>((resolve, reject) => {
                const maxWait = setTimeout(() => {
                    reject(new Error(strings.bankTimedOut || 'Bank verification timed out'));
                }, 5 * 60 * 1000); // 5 minutes timeout

                const messageHandler = (event: MessageEvent) => {
                    if (event.data === '3ds_challenge_complete') {
                        log('📥 3DS challenge complete signal received!');
                        clearTimeout(maxWait);
                        window.removeEventListener('message', messageHandler);
                        setShowOTPFrame(false);
                        resolve();
                    }
                };
                window.addEventListener('message', messageHandler);
            });

            // Give gateway a moment then poll to confirm authentication is complete
            log('⏳ Confirming 3DS authentication status...');
            let authConfirmed = false;
            for (let attempt = 1; attempt <= 12; attempt++) {
                await new Promise(r => setTimeout(r, 2500));
                try {
                    const statusResp = await fetch(`/api/payment/order-status/${orderId}`);
                    const statusText = await statusResp.text();
                    const statusData = JSON.parse(statusText);
                    const authStatus = statusData.authenticationStatus;
                    log(`🔍 Poll ${attempt}: authStatus=${authStatus}, orderStatus=${statusData.status}`);
                    if (authStatus === 'AUTHENTICATION_SUCCESSFUL') {
                        authConfirmed = true;
                        break;
                    } else if (authStatus === 'AUTHENTICATION_UNSUCCESSFUL' || authStatus === 'AUTHENTICATION_FAILED') {
                        throw new Error(strings.authFailed || 'Authentication failed. Please try again.');
                    }
                } catch (pollErr: any) {
                    if (pollErr.message.includes('فشل')) throw pollErr;
                    log(`⚠️ Poll error (continuing): ${pollErr.message}`);
                }
            }
            if (!authConfirmed) {
                throw new Error(strings.authNotConfirmed || 'Authentication not confirmed in time');
            }
            await executePayment(orderId, sid, amount, authTransId);

        } catch (err: any) {
            setIsLoading(false);
            setShowOTPFrame(false);
            log(`💥 Error in 3DS/Pay: ${err.message}`);
            setGatewayError(err.message);
            // Silently fetch a new session and order ID for retry
            initializePaymentSession(true);
        }
    };

    // ===========================
    // STEP 4: Server-side PAY
    // ===========================
    const executePayment = async (orderId: string, sid: string, amount: number, authTransId: string) => {
        try {
            setPaymentStep(strings.executingPayment || 'Executing payment...');
            log('💳 Calling PAY API...');

            const resp = await fetch('/api/payment/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, sessionId: sid, amount, currency: 'JOD', authTransactionId: authTransId })
            });
            const data = await resp.json();
            log(`📋 PAY Response: ${JSON.stringify(data)}`);

            if (data.success) {
                log('🎉 PAYMENT SUCCESSFUL!');
                setPaymentReceipt({ orderId, amount, status: data.status, transactionId: data.transactionId });
                onEnroll(course, 'Success', { transactionId: data.transactionId, orderId });
            } else {
                const gatewayCode = data.gatewayCode || data.error?.cause || data.result;
                const translatedError = translateGatewayError(gatewayCode);
                throw new Error(`${strings.paymentFailed || 'Payment failed'}: ${translatedError} ${gatewayCode && gatewayCode !== translatedError ? `(${gatewayCode})` : ''}`);
            }
        } catch (err: any) {
            log(`💥 Payment error: ${err.message}`);
            setGatewayError(err.message);
            // Silently fetch a new session and order ID for retry
            initializePaymentSession(true);
        } finally {
            setIsLoading(false);
            setPaymentStep('');
        }
    };

    const handleConfirmPayment = (methodOverride?: 'visa' | 'cliq' | 'bank') => {
        const method = methodOverride || paymentMethod;
        if (!isLoggedIn) {
            onLoginRequired();
            return;
        }
        if (method === 'visa') {
            // setShowCardForm(true); // Don't show yet, wait for session init
            initializePaymentSession();
        } else {
            setShowManualModal(true);
        }
    };

    const handleConfirmManualTransfer = () => {
        onEnroll(course, 'Pending', {
            paymentMethod: paymentMethod === 'cliq' ? 'CliQ' : 'Bank Transfer',
            transactionId: `MANUAL-${Date.now()}`
        });
        setShowManualModal(false);
    };

    // ===========================
    // SUCCESS RECEIPT
    // ===========================
    if (paymentReceipt) {
        return (
            <div className="py-12 bg-gray-50 min-h-screen animate-fade-in">
                <div className="container mx-auto px-4 max-w-lg">
                    <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
                        <h2 className="text-3xl font-black text-green-600 mb-2">{strings.successTransaction || 'Transaction Successful!'}</h2>
                        <p className="text-gray-500 mb-8">{strings.paymentDeducted || 'Payment deducted and you are enrolled in the course'}</p>
                        <div className={`space-y-3 bg-gray-50 p-6 rounded-2xl text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className="flex justify-between"><span className="text-gray-400">{strings.amount || 'Amount'}</span><span className="font-black text-blue-900">{paymentReceipt.amount} {strings.jodLabel}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">{strings.orderNumber || 'Order Number'}</span><span className="font-black text-blue-900">{paymentReceipt.orderId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">{strings.transactionId || 'Transaction ID'}</span><span className="font-black text-blue-900">{paymentReceipt.transactionId}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">{strings.status || 'Status'}</span><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">✅ {strings.completed || 'Completed'}</span></div>
                        </div>
                        <button onClick={() => window.location.href = '/dashboard'} className="w-full py-5 rounded-2xl font-black text-white bg-blue-900 hover:bg-blue-800 shadow-xl transition-all mt-6">
                            {strings.goToDashboard || 'Go to Dashboard'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 bg-gray-50 min-h-screen animate-fade-in">
            {/* HIDDEN iframes - always in DOM */}
            <iframe
                id="hidden-3ds-frame"
                title="3DS Device Fingerprint"
                style={{ display: 'none', width: 0, height: 0, border: 'none' }}
            />

            {/* OTP Challenge Overlay */}
            {showOTPFrame && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-4">
                        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-black text-sm uppercase tracking-wider">{strings.identityVerification}</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-green-400 text-xs font-bold">SECURE</span>
                            </div>
                        </div>
                        <iframe
                            id="otp-3ds-frame"
                            title="3DS OTP Challenge"
                            style={{ width: '100%', height: '450px', border: 'none', display: 'block' }}
                        />
                    </div>
                </div>
            )}

            {/* Manual Payment Details Modal */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="bg-[#002146] p-10 text-white relative text-center">
                            <button onClick={() => setShowManualModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            
                            <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3">
                                {strings.paymentDetailsTitle} - {course.title}
                            </h2>
                            <p className="text-xl font-bold opacity-90 mb-4">
                                {course.sessionCount || 8} Sessions X {course.totalHours || 1.5} Hours
                            </p>
                            
                            <div className="bg-[#4CAF50]/20 text-[#4CAF50] text-sm font-black uppercase tracking-wider inline-block px-6 py-2 rounded-full border border-[#4CAF50]/30 shadow-lg shadow-black/20">
                                {course.priceJod || course.price} {strings.jodLabel}
                            </div>
                        </div>

                        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto text-right" dir="rtl">
                            {/* E-Wallets Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-[#002146] border-b border-gray-100 pb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    <h3 className="font-black text-2xl">{strings.eWallets}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-1 relative group hover:border-blue-200 transition-all shadow-sm">
                                        <button onClick={() => navigator.clipboard.writeText('JOTUTOR')} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        </button>
                                        <span className="text-[11px] font-black text-gray-400 mb-1">{strings.cliqUsername} (CLIQ)</span>
                                        <span className="font-black text-[#002146] text-xl">JOTUTOR</span>
                                    </div>
                                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-1 relative group hover:border-blue-200 transition-all shadow-sm">
                                        <button onClick={() => navigator.clipboard.writeText('0792822241')} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        </button>
                                        <span className="text-[11px] font-black text-gray-400 mb-1">{strings.walletNumber} (ZAIN CASH)</span>
                                        <span className="font-black text-[#002146] text-xl">0792822241</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer Section */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-4 text-[#002146] border-b border-gray-100 pb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    <h3 className="font-black text-2xl">{strings.bankTransfer}</h3>
                                </div>

                                {/* Etihad Bank */}
                                <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6 relative group transition-all shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-5 flex-1 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="bg-[#6366F1] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">{strings.etihadBank}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002146]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-white p-4 rounded-2xl border border-gray-100 relative group/row hover:border-blue-200 transition-colors">
                                                    <button onClick={() => navigator.clipboard.writeText('Smooth Business')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{strings.accountName}</p>
                                                    <p className="font-black text-[#002146] text-lg">Smooth Business</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-gray-100 relative group/row hover:border-blue-200 transition-colors">
                                                    <button onClick={() => navigator.clipboard.writeText('0370137195515102')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{strings.accountNumber}</p>
                                                    <p className="font-black text-[#002146] text-lg tracking-wider">0370137195515102</p>
                                                </div>
                                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 relative group/row hover:border-blue-200 transition-colors" dir="ltr">
                                                    <button onClick={() => navigator.clipboard.writeText('JO23UBS1250000370137195515102')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-gray-50 rounded-xl transition-all text-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                    <p className="text-[10px] text-blue-400 font-black uppercase text-right mb-1">{strings.iban}</p>
                                                    <p className="font-black text-[#002146] text-xs tracking-tight">JO23UBS1250000370137195515102</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Arab Bank */}
                                <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6 relative group transition-all shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-5 flex-1 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="bg-[#475569] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">{strings.arabBank}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002146]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 relative group/row hover:border-blue-200 transition-colors" dir="ltr">
                                                    <button onClick={() => navigator.clipboard.writeText('JO89 ARAB 1450 0000 0014 5199 5405 00')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-gray-50 rounded-xl transition-all text-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                    <p className="text-[10px] text-blue-400 font-black uppercase text-right mb-1">{strings.iban}</p>
                                                    <p className="font-black text-[#002146] text-xs tracking-tight">JO89 ARAB 1450 0000 0014 5199 5405 00</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Important Note */}
                            <div className="bg-[#FFFDE7] p-8 rounded-[2.5rem] border border-[#FFF9C4] flex gap-6 items-start shadow-sm">
                                <div className="p-4 bg-[#FFD600] text-white rounded-2xl shadow-lg ring-4 ring-[#FFD600]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-[#827717] text-xl mb-2">{strings.importantNote}</h4>
                                    <p className="text-sm text-[#827717] leading-relaxed font-bold opacity-80">{strings.manualPaymentInstruction}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 pt-4">
                                <button
                                    onClick={() => {
                                        const msg = encodeURIComponent(`مرحباً، لقد قمت بالتحويل لعملية شراء دورة: ${course.title} بمبلغ ${course.priceJod || course.price} د.أ. يرجى تفعيل الدورة.`);
                                        window.open(`https://wa.me/962792822241?text=${msg}`);
                                    }}
                                    className="w-full py-6 rounded-[2rem] font-black text-white bg-[#4CAF50] hover:bg-[#43a047] shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-4 text-xl"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.92s.214.123.58.345c1.486.879 3.198 1.345 4.947 1.345 5.232 0 9.492-4.259 9.494-9.494.001-2.536-.987-4.92-2.782-6.714s-4.177-2.783-6.715-2.783c-5.232 0-9.491 4.259-9.494 9.494 0 1.734.456 3.425 1.319 4.898.153.261.32.543.32.543l-1.008 3.682 3.839-1.006zm10.985-6.756c-.237-.119-1.401-.691-1.619-.771-.217-.079-.375-.119-.533.119-.158.238-.612.771-.75.931-.138.161-.277.181-.514.062-.237-.119-.998-.368-1.9-1.173-.702-.626-1.176-1.398-1.314-1.635-.138-.238-.015-.367.104-.485.107-.107.237-.277.356-.416.119-.138.158-.238.237-.396s.04-.297-.079-.416l-.533-1.287c-.156-.376-.32-.324-.533-.324-.158 0-.337-.019-.514-.019s-.474.066-.721.336c-.247.271-.948.926-.948 2.257 0 1.331.968 2.615 1.106 2.801.138.182 1.902 2.903 4.608 4.069.645.277 1.148.441 1.541.566.647.205 1.236.176 1.701.107.519-.077 1.401-.572 1.599-1.126.198-.554.198-1.029.139-1.127-.059-.099-.218-.158-.456-.277z" /></svg>
                                    {strings.contactWhatsApp}
                                </button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button onClick={handleConfirmManualTransfer} className="py-6 rounded-[2rem] font-black text-white bg-[#002146] hover:bg-[#00152e] shadow-xl transition-all text-xl">
                                        {strings.confirmManualTransfer}
                                    </button>
                                    <button onClick={() => setShowManualModal(false)} className="py-6 rounded-[2rem] font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all text-xl">
                                        {strings.close}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tighter uppercase">{strings.paymentGatewayTitle}</h1>
                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                        {strings.securePaymentSystem}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Invoice */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50"></div>
                            <h2 className="font-black text-blue-900 mb-6 text-sm uppercase tracking-widest border-b pb-4">{strings.subscriptionInvoice}</h2>
                            <div className="flex gap-4 mb-8 relative z-10">
                                <img src={course.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white" alt="" />
                                <div className="flex flex-col justify-center">
                                    <h3 className="font-black text-blue-900 text-sm leading-tight line-clamp-2">{course.title}</h3>
                                    <span className="text-[10px] font-black text-green-600 mt-1 uppercase tracking-tighter">{course.category}</span>
                                </div>
                            </div>
                            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 text-center">
                                <p className="text-[10px] font-black text-blue-400 mb-1 uppercase">{strings.amountToPay}</p>
                                <div className="text-4xl font-black text-blue-900">{course.priceJod || course.price} <small className="text-xs font-bold">{strings.jodLabel}</small></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-6 opacity-30 px-6 grayscale">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                        </div>
                    </div>

                    {/* Main Payment Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-gray-100 min-h-[500px] flex flex-col">
                            <div className={`${showCardForm ? 'hidden' : 'flex-1 flex flex-col items-center justify-center animate-fade-in py-6'}`}>
                                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-12">
                                    <button onClick={() => { setPaymentMethod('visa'); handleConfirmPayment('visa'); }} className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${paymentMethod === 'visa' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 bg-gray-50/20'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${paymentMethod === 'visa' ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-white text-gray-400 border shadow-sm'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        </div>
                                        <span className={`font-black text-[9px] uppercase tracking-widest ${paymentMethod === 'visa' ? 'text-blue-900' : 'text-gray-400'}`}>{strings.bankCard}</span>
                                    </button>
                                    <button onClick={() => { setPaymentMethod('cliq'); handleConfirmPayment('cliq'); }} className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${paymentMethod === 'cliq' ? 'border-green-600 bg-green-50/30' : 'border-gray-50 bg-gray-50/20'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${paymentMethod === 'cliq' ? 'bg-green-600 text-white shadow-xl scale-110' : 'bg-white text-gray-400 border shadow-sm'}`}>
                                            <span className="font-black text-lg italic">Q</span>
                                        </div>
                                        <span className={`font-black text-[9px] uppercase tracking-widest ${paymentMethod === 'cliq' ? 'text-green-900' : 'text-gray-400'}`}>{strings.cliqTransfer}</span>
                                    </button>
                                </div>
                                <button onClick={() => handleConfirmPayment()} disabled={isLoading} className="w-full max-w-sm py-5 rounded-2xl font-black text-white bg-blue-900 hover:bg-blue-800 shadow-[0_15px_30px_rgba(0,33,70,0.2)] transition-all transform active:scale-95 text-lg flex items-center justify-center gap-3">
                                    {isLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : strings.startBankConnection}
                                </button>
                            </div>

                            <div className={`${!showCardForm ? 'hidden' : 'animate-fade-in-up flex-1 flex flex-col'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => { setShowCardForm(false); setSessionReady(false); setGatewayError(null); setPaymentStep(''); }} className="text-blue-600 font-black text-xs flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-full transition-all">&larr; {strings.back}</button>
                                    <div className="bg-gray-100 text-[9px] font-black text-gray-500 px-4 py-1.5 rounded-full border uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                        {strings.securePayment}
                                    </div>
                                </div>

                                {/* Card Hosted Fields */}
                                <div className="flex-1 space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">{strings.cardHolder}</label>
                                        <input type="text" id="cardholder-name" className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors bg-gray-50" readOnly placeholder="Cardholder Name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">{strings.cardNumber}</label>
                                        <input type="text" id="card-number" dir="ltr" className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors bg-gray-50" readOnly placeholder="Card Number" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4" dir="ltr">
                                        <div>
                                            <label className="block text-[8px] font-black text-gray-500 mb-1 uppercase tracking-wider text-center">{strings.month}</label>
                                            <input type="text" id="expiry-month" className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 text-center" readOnly placeholder="MM" />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-gray-500 mb-1 uppercase tracking-wider text-center">{strings.year}</label>
                                            <input type="text" id="expiry-year" className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 text-center" readOnly placeholder="YY" />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-gray-500 mb-1 uppercase tracking-wider text-center">{strings.cvv}</label>
                                            <input type="text" id="security-code" className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 text-center" readOnly placeholder="CVV" />
                                        </div>
                                    </div>

                                    {paymentStep && (
                                        <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                            {paymentStep}
                                        </div>
                                    )}

                                    {gatewayError && (
                                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex flex-col gap-1">
                                            <span>⚠️ {gatewayError}</span>
                                            <span className="text-[10px] font-normal opacity-80">{strings.sessionRefreshed}</span>
                                        </div>
                                    )}

                                    <button onClick={handleSubmitPayment} disabled={isLoading || !sessionReady} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all text-lg flex items-center justify-center gap-3 mt-4 ${isLoading || !sessionReady ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800 active:scale-95'}`}>
                                        {isLoading ? (
                                            <><div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>{paymentStep || 'Processing...'}</>
                                        ) : !sessionReady ? 'Loading payment form...' : `${strings.payAmount} ${course.priceJod || course.price} ${strings.jodLabel}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default PaymentPage;
