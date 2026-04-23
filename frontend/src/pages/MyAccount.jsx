import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Save, AlertCircle, CheckCircle, Building, Phone, Mail } from 'lucide-react';

const MyAccount = () => {
    const { user, login } = useContext(AuthContext);

    // Profile State
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
                setName(data.name || '');
                setCompanyName(data.companyName || '');
                setPhone(data.phone || '');
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('http://localhost:5000/api/auth/profile', {
                name, companyName, phone
            }, config);

            // Update context user
            login({ ...data, token: user.token });
            setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setProfileMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        }
        setUpdatingProfile(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setUpdatingPassword(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put('http://localhost:5000/api/auth/change-password', {
                currentPassword, newPassword
            }, config);

            setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password'
            });
        }
        setUpdatingPassword(false);
    };

    if (!user) return null;

    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark font-display">My Account</h1>
                    <p className="text-gray-500 mt-2">Manage your personal information and security settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Quick Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-dark">{user.name}</h2>
                            <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-brand text-xs font-bold rounded-full uppercase tracking-wider">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Profile Settings */}
                        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-brand rounded-xl">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-dark">Profile Details</h3>
                            </div>

                            <div className="p-6">
                                {profileMessage.text && (
                                    <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium ${profileMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                        {profileMessage.type === 'error' ? <AlertCircle size={18} className="mt-0.5" /> : <CheckCircle size={18} className="mt-0.5" />}
                                        <p>{profileMessage.text}</p>
                                    </div>
                                )}

                                <form onSubmit={handleProfileUpdate} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Email Address (Cannot be changed)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400" />
                                            </div>
                                            <input type="email" value={user.email} disabled className="input-field pl-10 bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-dark mb-2">Full Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User size={18} className="text-gray-400" />
                                                </div>
                                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-dark mb-2">Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone size={18} className="text-gray-400" />
                                                </div>
                                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pl-10" placeholder="+91 98765 43210" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Company / Business Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building size={18} className="text-gray-400" />
                                            </div>
                                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field pl-10" placeholder="Your Business Name" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={updatingProfile} className={`btn-primary flex items-center gap-2 ${updatingProfile ? 'opacity-70' : ''}`}>
                                            {updatingProfile ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={18} /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Password Settings */}
                        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                                    <Lock size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-dark">Change Password</h3>
                            </div>

                            <div className="p-6">
                                {passwordMessage.text && (
                                    <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                        {passwordMessage.type === 'error' ? <AlertCircle size={18} className="mt-0.5" /> : <CheckCircle size={18} className="mt-0.5" />}
                                        <p>{passwordMessage.text}</p>
                                    </div>
                                )}

                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Current Password</label>
                                        <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-dark mb-2">New Password (min 6 characters)</label>
                                            <input type="password" required minLength="6" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-dark mb-2">Confirm New Password</label>
                                            <input type="password" required minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={updatingPassword} className={`px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-gray-200 ${updatingPassword ? 'opacity-70' : ''}`}>
                                            {updatingPassword ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Lock size={18} /> Update Password</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccount;
