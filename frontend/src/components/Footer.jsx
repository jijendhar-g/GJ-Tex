import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
            <div className="absolute top-20 right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                    {/* Brand column */}
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                                G
                            </div>
                            <div>
                                <span className="font-display font-bold text-2xl text-white tracking-tight">GJ <span className="text-orange-400">TEX</span></span>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 -mt-1">Premium Garments</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                            Premium garment manufacturing from the heart of Tiruppur. Specializing in bulk orders, custom printing, and high-quality apparel for brands worldwide.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-brand hover:text-white transition-all duration-300 border border-white/5 hover:border-brand">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2">
                        <h3 className="text-white font-display font-semibold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { to: '/products', label: 'All Products' },
                                { to: '/bulk-order', label: 'Bulk Orders' },
                                { to: '/login', label: 'My Account' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link to={link.to} className="text-gray-400 hover:text-brand transition-colors text-sm flex items-center gap-1 group">
                                        {link.label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="md:col-span-3">
                        <h3 className="text-white font-display font-semibold text-lg mb-6">Categories</h3>
                        <ul className="space-y-3">
                            {['T-Shirts', 'Hoodies & Sweatshirts', 'Sportswear', 'Kidswear', 'Custom Printing', 'IPL Jersey'].map((cat, idx) => (
                                <li key={idx}>
                                    <Link to="/products" className="text-gray-400 hover:text-brand transition-colors text-sm">{cat}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-3">
                        <h3 className="text-white font-display font-semibold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-brand flex-shrink-0 border border-white/5">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm text-gray-400">8/3424 Pandian Nagar, P.N. Road, Tiruppur, Tamil Nadu — 641602</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-brand flex-shrink-0 border border-white/5">
                                    <Phone size={16} />
                                </div>
                                <span className="text-sm text-gray-400">+91 7010035491</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-brand flex-shrink-0 border border-white/5">
                                    <Mail size={16} />
                                </div>
                                <span className="text-sm text-gray-400">orders@gjtex.com</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} GJ TEX Manufacturing. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;






//admin@gjtex.com
//admin123