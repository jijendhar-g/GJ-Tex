import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_URL } from '../api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await axios.post(`${API_URL}/api/auth/reset-password`, {
                token,
                newPassword: password
            });

            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
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

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-300/30">
                            <Lock className="text-white" size={28} />
                        </div>
                        <h2 className="text-3xl font-bold text-dark font-display">Create New Password</h2>
                        <p className="text-gray-500 mt-2 text-sm">Please enter your new password below</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100 text-center font-medium">
                            {error}
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="text-center">
                            <div className="bg-green-50 text-green-600 p-6 rounded-xl mb-6 flex flex-col items-center gap-3 border border-green-100">
                                <CheckCircle size={32} />
                                <div>
                                    <h3 className="font-bold text-lg">Password Reset Successfully!</h3>
                                    <p className="text-sm mt-1">Redirecting to login page...</p>
                                </div>
                            </div>
                            <Link to="/login" className="btn-primary inline-flex gap-2">
                                Go to Login <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={submitHandler}>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">New Password (min 6 chars)</label>
                                <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Confirm New Password</label>
                                <input type="password" required minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={loading} className={`w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Change Password <CheckCircle size={18} /></>}
                            </button>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand transition-colors">
                                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
