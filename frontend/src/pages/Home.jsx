import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Star, Truck, Shield, Factory, Award, Phone, Zap, Users, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Animated counter component
const Counter = ({ target, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const duration = 2000;
        const step = Math.ceil(target / (duration / 30));
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [target]);
    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Default fallback ads shown when backend has no data
const DEFAULT_ADS = [
    {
        _id: 'd1', title: 'Summer Sale — Up to 30% Off', subtitle: 'Bulk orders on T-Shirts & Hoodies at unbeatable prices. Limited time offer!',
        badge: '🔥 HOT DEAL', bgColor: '#1a1a1a', accentColor: '#ff6b00', ctaText: 'Shop Now', ctaLink: '/products'
    },
    {
        _id: 'd2', title: 'New Sportswear Collection', subtitle: 'Moisture-wicking fabric, custom branding available. MOQ just 50 pcs.',
        badge: '✨ NEW ARRIVAL', bgColor: '#0f172a', accentColor: '#6366f1', ctaText: 'Explore', ctaLink: '/products'
    },
    {
        _id: 'd3', title: 'Free Shipping on Orders ₹50,000+', subtitle: 'Pan-India delivery at zero cost. Place your bulk order today!',
        badge: '🚚 FREE SHIPPING', bgColor: '#14532d', accentColor: '#22c55e', ctaText: 'Order Now', ctaLink: '/bulk-order'
    },
    {
        _id: 'd4', title: 'Custom Embroidery & Printing', subtitle: 'Your logo, your colors — we handle it all. Min 100 pcs per design.',
        badge: '🎨 CUSTOMIZE', bgColor: '#1e1b4b', accentColor: '#a855f7', ctaText: 'Get Quote', ctaLink: '/bulk-order'
    },
    {
        _id: 'd5', title: 'Kids Collection — Soft & Safe', subtitle: 'OEKO-TEX certified fabrics. Gentle on skin, strong on quality.',
        badge: '👶 KIDSWEAR', bgColor: '#431407', accentColor: '#fb923c', ctaText: 'View Range', ctaLink: '/products'
    },
];

// ─── Ad Carousel ─────────────────────────────────────────────
const AdCarousel = () => {
    const [ads, setAds] = useState(DEFAULT_ADS);
    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);
    const timerRef = useRef(null);
    const carouselRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/admin/ads/public')
            .then(res => setAds(res.data.length >= 1 ? res.data : DEFAULT_ADS))
            .catch(() => setAds(DEFAULT_ADS));
    }, []);

    // Auto-scroll on mount
    useEffect(() => {
        setTimeout(() => {
            if (carouselRef.current) {
                carouselRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }, []);

    const goTo = (idx) => {
        if (fading || ads.length === 0) return;
        setFading(true);
        setTimeout(() => {
            setCurrent((idx + ads.length) % ads.length);
            setFading(false);
        }, 280);
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    useEffect(() => {
        if (ads.length < 2) return;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(next, 4000);
        return () => clearInterval(timerRef.current);
    }, [ads.length, current]);

    if (ads.length === 0) return null;

    const ad = ads[current];

    return (
        <section ref={carouselRef} style={{ background: '#f8fafc' }} className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Tag size={20} style={{ color: '#ff6b00' }} />
                    <span style={{ color: '#ff6b00' }} className="text-sm font-extrabold uppercase tracking-widest">Offers & Promotions</span>
                </div>

                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl" style={{ minHeight: '400px' }}>
                    {/* Slide Panel */}
                    <div
                        className="relative w-full flex flex-col justify-center px-10 sm:px-20 py-16 sm:py-24"
                        style={{
                            background: `linear-gradient(135deg, ${ad.bgColor} 0%, ${ad.bgColor}e0 50%, ${ad.accentColor}40 100%)`,
                            minHeight: '400px',
                            opacity: fading ? 0 : 1,
                            transform: fading ? 'scale(0.98)' : 'scale(1)',
                            transition: 'opacity 0.4s ease, transform 0.4s easeOut',
                        }}
                    >
                        {/* Decorative blobs */}
                        <div style={{
                            position: 'absolute', right: 0, top: 0,
                            width: '500px', height: '500px', borderRadius: '50%', opacity: 0.15,
                            background: `radial-gradient(circle, ${ad.accentColor}, transparent)`,
                            transform: 'translate(20%,-20%)', pointerEvents: 'none'
                        }} />
                        <div style={{
                            position: 'absolute', left: 0, bottom: 0,
                            width: '300px', height: '300px', borderRadius: '50%', opacity: 0.15,
                            background: `radial-gradient(circle, ${ad.accentColor}, transparent)`,
                            transform: 'translate(-10%,10%)', pointerEvents: 'none'
                        }} />

                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px' }}>
                            {ad.badge && (
                                <span style={{
                                    display: 'inline-block', fontSize: '13px', fontWeight: 800,
                                    padding: '6px 16px', borderRadius: '999px', marginBottom: '24px',
                                    color: ad.accentColor,
                                    background: `${ad.accentColor}22`,
                                    border: `2px solid ${ad.accentColor}50`,
                                    textTransform: 'uppercase', letterSpacing: '1px'
                                }}>
                                    {ad.badge}
                                </span>
                            )}
                            <h2 style={{ color: '#fff', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px' }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-display">
                                {ad.title}
                            </h2>
                            {ad.subtitle && (
                                <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '36px' }}
                                    className="text-lg sm:text-xl leading-relaxed max-w-2xl font-light">
                                    {ad.subtitle}
                                </p>
                            )}
                            <Link
                                to={ad.ctaLink}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '12px',
                                    padding: '16px 36px', borderRadius: '16px',
                                    background: ad.accentColor, color: '#fff', fontWeight: 800, fontSize: '16px',
                                    boxShadow: `0 8px 30px ${ad.accentColor}80`,
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    textDecoration: 'none',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {ad.ctaText} <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* Slide counter badge */}
                        <span style={{
                            position: 'absolute', bottom: '16px', right: '56px',
                            fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                            userSelect: 'none'
                        }}>
                            {current + 1} / {ads.length}
                        </span>
                    </div>

                    {/* Arrows */}
                    {ads.length > 1 && (
                        <>
                            <button onClick={() => { clearInterval(timerRef.current); prev(); }}
                                style={{
                                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                                    width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 20, transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => { clearInterval(timerRef.current); next(); }}
                                style={{
                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                    width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 20, transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Dot indicators */}
                {ads.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                        {ads.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                style={{
                                    width: i === current ? '28px' : '8px',
                                    height: '8px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: i === current ? (ad.accentColor || '#ff6b00') : '#d1d5db',
                                    transition: 'all 0.3s ease',
                                    padding: 0,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <div className="overflow-hidden">

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden">
                <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-glow opacity-30"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-orange-300 text-sm font-medium mb-8 border border-white/10">
                                <Zap size={16} className="text-orange-400" />
                                Tiruppur's Trusted Manufacturer Since 2005
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] font-display">
                                Premium Garments<br />
                                <span className="gradient-text">Made to Order</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl font-light">
                                From T-shirts to sportswear — we manufacture export-quality apparel with custom printing, embroidery, and wholesale pricing for brands worldwide.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Link to="/products" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 animate-pulse-glow">
                                    Explore Catalog <ArrowRight size={20} />
                                </Link>
                                <Link to="/bulk-order" className="group px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-center flex items-center justify-center gap-2">
                                    Get a Quote <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-6 text-gray-400 text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> ISO Certified</span>
                                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> 100% Cotton</span>
                                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> MOQ 50 Pcs</span>
                            </div>
                        </div>

                        <div className="hidden lg:block relative">
                            <div className="relative">
                                <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10 animate-fade-in-up delay-200">
                                    <img src="/images/hero-garments.png" alt="Premium Garments" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -left-8 bottom-20 glass-card p-4 animate-float shadow-glow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-dark text-sm">Fast Delivery</p>
                                            <p className="text-gray-500 text-xs">Pan-India Shipping</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-4 top-20 glass-card p-4 animate-float delay-300 shadow-glow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-dark text-sm">Export Quality</p>
                                            <p className="text-gray-500 text-xs">Global Standards</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
                    </svg>
                </div>
            </section>

            {/* ═══════════════ ADS CAROUSEL ═══════════════ */}
            <AdCarousel />

            {/* ═══════════════ STATS COUNTER ═══════════════ */}
            <section className="py-16 bg-gray-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: 500, suffix: '+', label: 'Happy Clients', icon: Users },
                            { value: 15000, suffix: '+', label: 'Orders Delivered', icon: Truck },
                            { value: 18, suffix: '+', label: 'Years Experience', icon: Award },
                            { value: 50, suffix: '+', label: 'Countries Served', icon: Factory }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand group-hover:text-white text-brand transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-orange-200">
                                    <stat.icon size={26} />
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-dark font-display">
                                    <Counter target={stat.value} suffix={stat.suffix} />
                                </p>
                                <p className="text-gray-500 text-sm mt-1 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHY CHOOSE US ═══════════════ */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-brand font-bold tracking-widest text-sm uppercase">Why GJ TEX</span>
                        <h2 className="section-heading mt-4">Built on Trust &<br /><span className="gradient-text">Quality Craftsmanship</span></h2>
                        <p className="section-subtext mx-auto mt-6">From yarn to finished garment, every step is controlled for perfection.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: 'Premium Fabric Sourcing', desc: 'We source the finest combed cotton and blended fabrics directly from Tiruppur mills for unmatched quality and comfort.', color: 'from-blue-500 to-blue-600' },
                            { icon: Factory, title: 'In-House Manufacturing', desc: 'Complete production under one roof — from knitting and dyeing to cutting, stitching, and finishing with modern machinery.', color: 'from-orange-500 to-red-500' },
                            { icon: Truck, title: 'On-Time Global Delivery', desc: 'Streamlined logistics ensure your bulk orders reach anywhere in India or the world, strictly on schedule.', color: 'from-green-500 to-emerald-600' }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl bg-white border border-gray-100 card-hover cursor-pointer relative overflow-hidden">
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-dark mb-3 font-display">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CATEGORIES ═══════════════ */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                        <div>
                            <span className="text-brand font-bold tracking-widest text-sm uppercase">Our Range</span>
                            <h2 className="section-heading mt-4">Explore Our <span className="gradient-text">Categories</span></h2>
                        </div>
                        <Link to="/products" className="group flex items-center gap-2 text-brand font-semibold hover:text-orange-600 transition-colors">
                            View Full Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'T-Shirts', count: '120+ Styles', img: '/images/hero-garments.png' },
                            { name: 'Hoodies', count: '45+ Styles', img: '/images/hoodies.png' },
                            { name: 'Sportswear', count: '60+ Styles', img: '/images/sports.png' },
                            { name: 'Kidswear', count: '80+ Styles', img: '/images/kids.png' }
                        ].map((cat, idx) => (
                            <Link to={`/products?category=${cat.name.toLowerCase()}`} key={idx}
                                className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer card-hover">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <p className="text-orange-300 text-sm font-medium mb-1">{cat.count}</p>
                                    <h3 className="text-white font-bold text-2xl font-display">{cat.name}</h3>
                                    <div className="mt-4 overflow-hidden h-0 group-hover:h-10 transition-all duration-500">
                                        <span className="text-white/80 text-sm flex items-center gap-2">
                                            Explore Collection <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ TESTIMONIALS ═══════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-brand font-bold tracking-widest text-sm uppercase">Testimonials</span>
                        <h2 className="section-heading mt-4">Trusted by <span className="gradient-text">Brands Worldwide</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Ankit Sharma', company: 'ActiveWear India', quote: 'GJ TEX provided exceptional quality and delivered our 10,000 pcs order ahead of schedule. The custom printing was flawless.', rating: 5 },
                            { name: 'Sarah Mitchell', company: 'Urban Thread Co (UK)', quote: 'We have been sourcing from Tiruppur for years, and GJ TEX stands out with their attention to detail and competitive pricing.', rating: 5 },
                            { name: 'Rajesh Patel', company: 'KidsWorld Brands', quote: 'Their kidswear collection quality is outstanding. Soft fabrics, perfect stitching, and they handle all our custom requirements.', rating: 5 }
                        ].map((item, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 card-hover relative">
                                <div className="absolute -top-3 left-8 text-6xl text-brand/20 font-serif">"</div>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 italic">"{item.quote}"</p>
                                <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {item.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-bold text-dark text-sm">{item.name}</p>
                                        <p className="text-gray-500 text-xs">{item.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA SECTION ═══════════════ */}
            <section className="py-24 bg-hero-gradient relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-glow opacity-40"></div>
                <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/10 rounded-full"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display leading-tight">
                        Ready to Place Your<br /><span className="gradient-text">Bulk Order?</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
                        Tell us your requirements and our team will prepare a custom quotation within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/bulk-order" className="btn-primary text-lg px-10 py-4 animate-pulse-glow">
                            Request Quotation
                        </Link>
                        <a href="https://wa.me/7010035491?text=Hi%20GJ%20TEX%2C%20I%27d%20like%20to%20discuss%20a%20bulk%20order"
                            target="_blank" rel="noreferrer"
                            className="px-10 py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
                            <Phone size={20} /> WhatsApp Us
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHATSAPP FLOATING BUTTON ═══════════════ */}
            <a href="https://wa.me/7010035491?text=Hi%20GJ%20TEX%2C%20I%27d%20like%20to%20discuss%20a%20bulk%20order"
                target="_blank" rel="noreferrer"
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/40 hover:bg-green-600 hover:scale-110 transition-all duration-300 animate-pulse-glow"
                title="Chat on WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
};

export default Home;
