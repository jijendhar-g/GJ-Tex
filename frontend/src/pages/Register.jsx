import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ArrowRight, Mail, Phone, CheckCircle2, Loader2, Smartphone } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', companyName: '', phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP states
    const [otpMethod, setOtpMethod] = useState('email'); // 'email' | 'phone'
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [verified, setVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [otpChannel, setOtpChannel] = useState(''); // what the server actually used

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || '/';

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Reset OTP if the identifier changes
        if (e.target.name === 'email' || e.target.name === 'phone') {
            setOtpSent(false);
            setVerified(false);
            setOtpToken('');
            setOtp('');
            setOtpError('');
        }
    };

    // Switch OTP method
    const switchMethod = (method) => {
        setOtpMethod(method);
        setOtpSent(false);
        setVerified(false);
        setOtpToken('');
        setOtp('');
        setOtpError('');
        setCountdown(0);
    };

    // ─── Send OTP ───────────────────────────────────────────────
    const handleSendOTP = async () => {
        const isPhone = otpMethod === 'phone';
        const identifier = isPhone ? formData.phone : formData.email;

        if (isPhone) {
            const digits = identifier.replace(/\D/g, '');
            if (digits.length < 10) {
                setOtpError('Please enter a valid 10-digit mobile number');
                return;
            }
        } else {
            if (!identifier || !identifier.includes('@')) {
                setOtpError('Please enter a valid email address');
                return;
            }
        }

        try {
            setOtpLoading(true);
            setOtpError('');
            const payload = isPhone
                ? { phone: identifier, email: formData.email }
                : { email: identifier };
            const { data } = await axios.post('http://localhost:5000/api/auth/send-otp', payload);
            setOtpSent(true);
            setOtpChannel(data.channel || otpMethod);
            setCountdown(60);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // ─── Verify OTP ─────────────────────────────────────────────
    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter the 6-digit OTP');
            return;
        }
        try {
            setOtpLoading(true);
            setOtpError('');
            const payload = otpMethod === 'phone'
                ? { phone: formData.phone, otp }
                : { email: formData.email, otp };
            const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', payload);
            setOtpToken(data.otpToken);
            setVerified(true);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // ─── Register ───────────────────────────────────────────────
    const submitHandler = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!verified) {
            setError('Please verify your mobile / email first');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.post('http://localhost:5000/api/auth/register', {
                ...formData,
                otpToken
            });
            login(data);
            navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const canSend = otpMethod === 'phone'
        ? formData.phone.replace(/\D/g, '').length >= 10
        : formData.email.includes('@');

    const channelLabel = otpChannel === 'sms' ? 'your mobile' : otpChannel === 'email' ? 'your email' : 'your mobile/email';

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center py-20 px-4 relative overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-2xl w-full relative z-10 animate-fade-in-up">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-300/30">
                            <UserPlus className="text-white" size={28} />
                        </div>
                        <h2 className="text-3xl font-bold text-dark font-display">Create Account</h2>
                        <p className="text-gray-500 mt-2 text-sm">Join GJ TEX to place and track bulk garment orders</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100 text-center font-medium">{error}</div>
                    )}

                    <form className="space-y-5" onSubmit={submitHandler}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Full Name *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Company / Brand</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="input-field" placeholder="Acme Apparel" />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-dark mb-2">Email *</label>
                                <input
                                    type="email" name="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="input-field"
                                    placeholder="john@example.com"
                                    disabled={verified && otpMethod === 'email'}
                                />
                            </div>

                            {/* Phone */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-dark mb-2">
                                    Mobile Number *
                                    {verified && otpMethod === 'phone' && (
                                        <span className="inline-flex items-center gap-1 ml-2 text-green-600 text-xs font-bold">
                                            <CheckCircle2 size={14} /> Verified
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="tel" name="phone" required
                                    value={formData.phone} onChange={handleChange}
                                    className={`input-field ${verified && otpMethod === 'phone' ? '!border-green-300 !bg-green-50' : ''}`}
                                    placeholder="+91 98765 43210"
                                    disabled={verified && otpMethod === 'phone'}
                                />
                            </div>
                        </div>

                        {/* ─── OTP Verification Block ──────────────────────────── */}
                        {!verified && (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 space-y-4">
                                <p className="text-sm font-bold text-dark">Verify your identity</p>

                                {/* Method toggle */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => switchMethod('phone')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${otpMethod === 'phone'
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md shadow-orange-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                                    >
                                        <Smartphone size={15} /> Mobile OTP
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => switchMethod('email')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${otpMethod === 'email'
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md shadow-orange-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                                    >
                                        <Mail size={15} /> Email OTP
                                    </button>
                                </div>

                                {/* Send button */}
                                {!otpSent && (
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={otpLoading || !canSend}
                                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-orange-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {otpLoading ? <Loader2 size={16} className="animate-spin" /> : (otpMethod === 'phone' ? <Phone size={15} /> : <Mail size={15} />)}
                                        {otpLoading ? 'Sending…' : `Send OTP to ${otpMethod === 'phone' ? 'Mobile' : 'Email'}`}
                                    </button>
                                )}

                                {/* OTP sent state */}
                                {otpSent && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500 font-medium">
                                            ✅ OTP sent to <strong>{channelLabel}</strong>. Enter it below:
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength="6"
                                                value={otp}
                                                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                                                className="input-field flex-1 text-center text-2xl tracking-[0.5em] font-mono font-bold"
                                                placeholder="● ● ● ● ● ●"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyOTP}
                                                disabled={otpLoading || otp.length !== 6}
                                                className="px-6 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                Verify
                                            </button>
                                        </div>

                                        {/* Resend */}
                                        <div className="flex items-center justify-between">
                                            {otpError && <p className="text-red-500 text-xs font-medium">{otpError}</p>}
                                            <button
                                                type="button"
                                                onClick={handleSendOTP}
                                                disabled={countdown > 0 || otpLoading}
                                                className="ml-auto text-xs font-semibold text-orange-500 hover:text-orange-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {countdown > 0 ? `Resend in ${countdown}s` : '↺ Resend OTP'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verified banner */}
                        {verified && (
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                                <CheckCircle2 size={22} className="text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-green-700">
                                        {otpMethod === 'phone' ? 'Mobile verified!' : 'Email verified!'}
                                    </p>
                                    <p className="text-xs text-green-600">You can now complete your registration.</p>
                                </div>
                            </div>
                        )}

                        {/* Password fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Password *</label>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Confirm Password *</label>
                                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="••••••••" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !verified}
                            className={`w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 ${(loading || !verified) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : !verified ? (
                                <>Verify to Continue</>
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="font-semibold text-brand hover:text-orange-600 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
