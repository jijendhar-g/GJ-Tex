import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Menu, X, User as UserIcon, LogOut, ChevronDown, ShoppingCart } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Products' },
        { to: '/bulk-order', label: 'Bulk Order' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-2'
            : 'bg-transparent py-4'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-300/40 group-hover:shadow-orange-400/60 transition-shadow duration-300">
                                G
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                        </div>
                        <div className="hidden sm:block">
                            <span className={`font-display font-bold text-2xl tracking-tight ${scrolled ? 'text-dark' : 'text-white'} transition-colors duration-300`}>
                                GJ <span className="gradient-text">TEX</span>
                            </span>
                            <p className={`text-[10px] tracking-[0.2em] uppercase font-medium ${scrolled ? 'text-gray-400' : 'text-gray-300'} transition-colors -mt-1`}>
                                Premium Garments
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${isActive(link.to)
                                    ? 'text-brand'
                                    : scrolled ? 'text-gray-600 hover:text-brand hover:bg-orange-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                                {isActive(link.to) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/cart" className={`relative p-2 rounded-xl transition-all duration-300 ${scrolled ? 'text-gray-600 hover:text-brand hover:bg-orange-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.name}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-black/10 py-2 z-50 border border-gray-100 animate-fade-in-up">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-dark">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            {user.role === 'admin' ? (
                                                <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand transition-colors">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> Admin Dashboard
                                                </Link>
                                            ) : (
                                                <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand transition-colors">
                                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span> My Orders
                                                </Link>
                                            )}
                                            <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand transition-colors">
                                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span> My Account
                                            </Link>
                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${scrolled ? 'text-gray-700 hover:text-brand' : 'text-white/80 hover:text-white'
                                    }`}>Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm !px-5 !py-2">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 mt-2 shadow-2xl rounded-b-3xl mx-4 animate-fade-in-up">
                    <div className="py-4 px-4 space-y-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.to) ? 'bg-orange-50 text-brand' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link to="/cart" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/cart') ? 'bg-orange-50 text-brand' : 'text-gray-700 hover:bg-gray-50'}`}>
                            🛒 Cart {cartCount > 0 && `(${cartCount})`}
                        </Link>
                        <div className="border-t border-gray-100 pt-3 mt-3">
                            {user ? (
                                <>
                                    {user.role !== 'admin' && <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50">My Orders</Link>}
                                    {user.role === 'admin' && <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Admin Dashboard</Link>}
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50">My Account</Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-red-500 font-medium hover:bg-red-50">Sign Out</button>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-3 rounded-xl font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">Sign In</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="flex-1 text-center btn-primary !rounded-xl">Get Started</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
