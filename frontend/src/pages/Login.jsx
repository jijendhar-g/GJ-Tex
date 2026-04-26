import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Lock, ArrowRight } from 'lucide-react';
import { API_URL } from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || '/';

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            login(data);
            // Admin users go directly to admin dashboard
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
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
                        <h2 className="text-3xl font-bold text-dark font-display">Welcome Back</h2>
                        <p className="text-gray-500 mt-2 text-sm">Log in to manage your wholesale orders</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100 text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submitHandler}>
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-dark">Password</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-brand hover:text-orange-600 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading} className={`w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="font-semibold text-brand hover:text-orange-600 transition-colors">
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
