import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setMessage('');

            const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(data.message);
            setIsSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-hero-gradient flex items-center justify-center py-12 px-4 relative overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-md w-full relative z-10 animate-fade-in-up">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">

                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-dark mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-300/30">
                            <Mail className="text-white" size={28} />
                        </div>
                        <h2 className="text-3xl font-bold text-dark font-display">Forgot Password</h2>
                        <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset link</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100 text-center font-medium">
                            {error}
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="text-center">
                            <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm border border-green-100 flex flex-col items-center gap-2 font-medium">
                                <CheckCircle size={24} />
                                {message}
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Didn't receive the email? Check your spam folder or try again.</p>
                            <button onClick={() => setIsSuccess(false)} className="text-brand font-semibold hover:text-orange-600">
                                Try another email
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={submitHandler}>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Email Address</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
                            </div>
                            <button type="submit" disabled={loading} className={`w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Send Reset Link <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
