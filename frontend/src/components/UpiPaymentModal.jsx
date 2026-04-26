import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ShieldCheck, X, CheckCircle, Loader2, QrCode, AlertCircle, RefreshCw, ExternalLink, Smartphone, XCircle } from 'lucide-react';
import { API_URL } from '../api';

const POLL_INTERVAL = 4000; // 4 seconds
const MAX_POLL_DURATION = 10 * 60 * 1000; // 10 minutes timeout

/**
 * UpiPaymentModal — Real UPI Gateway Integration
 * Props:
 *   amount    – total amount (number)
 *   token     – user auth token
 *   onSuccess – called after payment is verified as SUCCESS
 *   onClose   – called when user dismisses modal
 */
const UpiPaymentModal = ({ amount, token, customerName, customerEmail, customerMobile, onSuccess, onClose }) => {
    const [status, setStatus] = useState('INITIATING'); // INITIATING | PENDING | REDIRECTING | SUCCESS | FAILED | ERROR
    const [clientTxnId, setClientTxnId] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [upiIntent, setUpiIntent] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [utrNumber, setUtrNumber] = useState(null);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // ── 1. On mount: create UPI order via backend
    useEffect(() => {
        const initiate = async () => {
            try {
                const { data } = await axios.post(
                    `${API_URL}/api/payment/upi-initiate`,
                    { amount, customerName, customerEmail, customerMobile },
                    config
                );

                if (data.success) {
                    setClientTxnId(data.clientTxnId);
                    setPaymentUrl(data.paymentUrl);
                    setUpiIntent(data.upiIntent);
                    setStatus('PENDING');
                    startTimeRef.current = Date.now();
                } else {
                    setErrorMsg(data.message || 'Failed to create UPI order');
                    setStatus('ERROR');
                }
            } catch (err) {
                setErrorMsg(err.response?.data?.message || err.message);
                setStatus('ERROR');
            }
        };
        initiate();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // ── 2. Polling: check payment status via backend
    useEffect(() => {
        if (!clientTxnId || (status !== 'PENDING' && status !== 'REDIRECTING')) return;

        intervalRef.current = setInterval(async () => {
            // Timeout check
            if (Date.now() - startTimeRef.current > MAX_POLL_DURATION) {
                clearInterval(intervalRef.current);
                setStatus('ERROR');
                setErrorMsg('Payment session timed out. Please try again.');
                return;
            }

            try {
                const { data } = await axios.post(
                    `${API_URL}/api/payment/upi-status`,
                    { clientTxnId },
                    config
                );
                setPollCount(c => c + 1);

                if (data.status === 'SUCCESS') {
                    clearInterval(intervalRef.current);
                    setUtrNumber(data.utrNumber);
                    setStatus('SUCCESS');
                    // Wait 2s on success screen then call onSuccess
                    setTimeout(() => onSuccess(), 2000);
                } else if (data.status === 'FAILED') {
                    clearInterval(intervalRef.current);
                    setStatus('FAILED');
                    setErrorMsg('Payment failed or was declined. Please try again.');
                }
            } catch (err) {
                // Silently continue polling on network error
            }
        }, POLL_INTERVAL);

        return () => clearInterval(intervalRef.current);
    }, [clientTxnId, status]);

    // ── Open UPI Gateway payment page
    const handleOpenPaymentPage = () => {
        if (paymentUrl) {
            window.open(paymentUrl, '_blank');
            setStatus('REDIRECTING');
        }
    };

    return (
        <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">

                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <QrCode size={20} />
                        </div>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: '16px', display: 'block' }}>UPI Payment</span>
                            <span style={{ fontSize: '12px', opacity: 0.8 }}>Powered by UPI Gateway</span>
                        </div>
                    </div>
                    {status !== 'SUCCESS' && (
                        <button
                            onClick={onClose}
                            style={{
                                color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)',
                                border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div style={{ padding: '32px 28px' }}>

                    {/* ── INITIATING ── */}
                    {status === 'INITIATING' && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <Loader2 size={28} className="animate-spin" style={{ color: '#6366f1' }} />
                            </div>
                            <p style={{ color: '#6b7280', fontSize: '15px' }}>Creating your payment session…</p>
                            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>This only takes a moment</p>
                        </div>
                    )}

                    {/* ── ERROR ── */}
                    {status === 'ERROR' && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#fef2f2', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 16px'
                            }}>
                                <AlertCircle size={32} style={{ color: '#ef4444' }} />
                            </div>
                            <p style={{ fontWeight: 700, color: '#1f2937', marginBottom: '6px', fontSize: '17px' }}>Something went wrong</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', padding: '0 10px' }}>{errorMsg}</p>
                            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 32px', fontSize: '14px' }}>Close</button>
                        </div>
                    )}

                    {/* ── FAILED ── */}
                    {status === 'FAILED' && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#fef2f2', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 16px'
                            }}>
                                <XCircle size={36} style={{ color: '#ef4444' }} />
                            </div>
                            <p style={{ fontWeight: 700, color: '#1f2937', marginBottom: '6px', fontSize: '18px' }}>Payment Failed</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>{errorMsg}</p>
                            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 32px', fontSize: '14px' }}>Try Again</button>
                        </div>
                    )}

                    {/* ── PENDING / REDIRECTING: Show payment link + polling ── */}
                    {(status === 'PENDING' || status === 'REDIRECTING') && (
                        <>
                            {/* Amount Display */}
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Amount to Pay</p>
                                <p style={{
                                    fontSize: '36px', fontWeight: 800, color: '#1f2937',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>
                                    ₹{amount?.toLocaleString()}
                                </p>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handleOpenPaymentPage}
                                disabled={!paymentUrl}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: status === 'REDIRECTING'
                                        ? 'linear-gradient(135deg, #059669, #10b981)'
                                        : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: paymentUrl ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                                    marginBottom: '20px'
                                }}
                            >
                                {status === 'REDIRECTING' ? (
                                    <>
                                        <ShieldCheck size={18} />
                                        Payment Page Opened — Complete Payment
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink size={18} />
                                        Open UPI Payment Page
                                    </>
                                )}
                            </button>

                            {/* UPI App Quick Links */}
                            {upiIntent && (
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                        Or pay directly via
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {upiIntent.gpay_link && (
                                            <a href={upiIntent.gpay_link} target="_blank" rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    padding: '10px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                                                    textDecoration: 'none', color: '#374151', fontSize: '13px', fontWeight: 600,
                                                    background: '#fff', transition: 'all 0.2s'
                                                }}
                                                onClick={() => setStatus('REDIRECTING')}
                                            >
                                                <Smartphone size={14} style={{ color: '#4285f4' }} />
                                                Google Pay
                                            </a>
                                        )}
                                        {upiIntent.phonepe_link && (
                                            <a href={upiIntent.phonepe_link} target="_blank" rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    padding: '10px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                                                    textDecoration: 'none', color: '#374151', fontSize: '13px', fontWeight: 600,
                                                    background: '#fff', transition: 'all 0.2s'
                                                }}
                                                onClick={() => setStatus('REDIRECTING')}
                                            >
                                                <Smartphone size={14} style={{ color: '#5f259f' }} />
                                                PhonePe
                                            </a>
                                        )}
                                        {upiIntent.paytm_link && (
                                            <a href={upiIntent.paytm_link} target="_blank" rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    padding: '10px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                                                    textDecoration: 'none', color: '#374151', fontSize: '13px', fontWeight: 600,
                                                    background: '#fff', transition: 'all 0.2s'
                                                }}
                                                onClick={() => setStatus('REDIRECTING')}
                                            >
                                                <Smartphone size={14} style={{ color: '#00b9f5' }} />
                                                Paytm
                                            </a>
                                        )}
                                        {upiIntent.bhim_link && (
                                            <a href={upiIntent.bhim_link} target="_blank" rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    padding: '10px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                                                    textDecoration: 'none', color: '#374151', fontSize: '13px', fontWeight: 600,
                                                    background: '#fff', transition: 'all 0.2s'
                                                }}
                                                onClick={() => setStatus('REDIRECTING')}
                                            >
                                                <Smartphone size={14} style={{ color: '#00897b' }} />
                                                BHIM UPI
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            <div style={{
                                background: '#f8fafc', borderRadius: '14px', padding: '16px',
                                border: '1px solid #e2e8f0', marginBottom: '16px'
                            }}>
                                <ol style={{ fontSize: '13px', color: '#475569', listStyle: 'none', padding: 0, margin: 0 }}>
                                    {[
                                        'Click "Open UPI Payment Page" or choose a UPI app above',
                                        `Complete the payment of ₹${amount?.toLocaleString()}`,
                                        'This page will automatically detect your payment'
                                    ].map((step, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < 2 ? '10px' : 0 }}>
                                            <span style={{
                                                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                color: '#fff', fontSize: '11px', fontWeight: 700, marginTop: '1px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>{i + 1}</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Polling Status */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', color: '#9ca3af', fontSize: '13px'
                            }}>
                                <RefreshCw size={14} className="animate-spin" style={{ color: '#818cf8' }} />
                                Verifying payment… (check #{pollCount})
                            </div>

                            {/* Security Badge */}
                            <div style={{
                                marginTop: '16px', textAlign: 'center', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px',
                                color: '#a1a1aa', fontSize: '11px'
                            }}>
                                <ShieldCheck size={14} style={{ color: '#22c55e' }} />
                                Secured by UPI Gateway · 256-bit SSL Encrypted
                            </div>
                        </>
                    )}

                    {/* ── SUCCESS state ── */}
                    {status === 'SUCCESS' && (
                        <div style={{ textAlign: 'center', padding: '24px 0' }} className="animate-fade-in-up">
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)'
                            }}>
                                <CheckCircle size={44} style={{ color: '#16a34a' }} />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>Payment Verified!</h3>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                                Your UPI payment of <strong>₹{amount?.toLocaleString()}</strong> has been confirmed.
                            </p>
                            {utrNumber && (
                                <p style={{
                                    fontSize: '12px', color: '#818cf8', fontFamily: 'monospace',
                                    background: '#f5f3ff', padding: '6px 14px', borderRadius: '8px',
                                    display: 'inline-block', marginTop: '8px'
                                }}>
                                    UTR: {utrNumber}
                                </p>
                            )}
                            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '12px' }}>
                                Placing your order…
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UpiPaymentModal;
