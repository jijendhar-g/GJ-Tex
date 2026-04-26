import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter, Search, X, SlidersHorizontal } from 'lucide-react';
import { API_URL } from '../api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('');
    const [keyword, setKeyword] = useState('');
    const [gender, setGender] = useState('All');
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const categories = ['T-Shirts', 'Hoodies', 'Sportswear', 'Kidswear', 'Custom Printing', 'IPL Jersey'];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/products?`;
            if (category) url += `category=${category}&`;
            if (keyword) url += `keyword=${keyword}&`;
            if (gender && gender !== 'All') url += `gender=${gender}`;
            const { data } = await axios.get(url);
            setProducts(data.products || data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [category, keyword, gender]);

    const FilterPanel = () => (
        <div className="flex flex-col gap-8">
            {/* Search */}
            <div>
                <label className="block text-sm font-semibold text-dark mb-3">Search Products</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g. Cotton, Polo..."
                        className="input-field pl-11 !rounded-xl"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                </div>
            </div>

            {/* Categories */}
            <div>
                <label className="block text-sm font-semibold text-dark mb-3">Categories</label>
                <div className="space-y-1.5">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCategory(category === cat ? '' : cat)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${category === cat
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200'
                                : 'text-gray-600 hover:bg-orange-50 hover:text-brand'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {category && (
                    <button
                        onClick={() => setCategory('')}
                        className="mt-3 text-sm text-brand font-semibold hover:underline flex items-center gap-1"
                    >
                        <X size={14} /> Clear Filter
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Header */}
            <section className="bg-hero-gradient pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-brand font-bold tracking-widest text-sm uppercase">Our Collection</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 mt-4 font-display">
                            Garment <span className="gradient-text">Catalog</span>
                        </h1>
                        <p className="text-gray-300 text-lg font-light">
                            Browse our extensive collection of export-quality garments crafted in Tiruppur with the finest fabrics.
                        </p>
                    </div>
                </div>
                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60L1440 60V30C1200 5 960 50 720 30C480 10 240 50 0 30V60Z" fill="#f8fafc" /></svg>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Gender Tab Filter */}
                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                    {[
                        { key: 'All', label: '👕 All Products' },
                        { key: 'Men', label: '👔 Men' },
                        { key: 'Women', label: '👗 Women' },
                        { key: 'Unisex', label: '🔀 Unisex' },
                    ].map(g => (
                        <button
                            key={g.key}
                            onClick={() => setGender(g.key)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all duration-200 ${gender === g.key
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg shadow-orange-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-brand'
                                }`}
                        >
                            {g.label}
                        </button>
                    ))}
                </div>

                {/* Mobile filter button */}
                <div className="md:hidden mb-6">
                    <button
                        onClick={() => setShowMobileFilter(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700"
                    >
                        <SlidersHorizontal size={18} /> Filters {category && `(${category})`}
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block w-72 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card sticky top-28">
                            <div className="flex items-center gap-2 font-display font-bold text-lg text-dark mb-6 pb-4 border-b border-gray-100">
                                <Filter size={20} className="text-brand" /> Filters
                            </div>
                            <FilterPanel />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="min-h-[400px] flex flex-col items-center justify-center">
                                <div className="w-14 h-14 border-4 border-gray-200 border-t-brand rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400 font-medium">Loading products...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
                                <p className="font-semibold text-lg mb-2">Oops! Connection Error</p>
                                <p className="text-sm text-red-500">{error}</p>
                                <p className="text-sm text-red-400 mt-2">Make sure the backend server and MongoDB are running.</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white p-16 text-center rounded-3xl border border-gray-100 shadow-card">
                                <Search size={56} className="mx-auto mb-4 text-gray-200" />
                                <h3 className="text-2xl font-bold text-dark mb-2 font-display">No Products Found</h3>
                                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter modal */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-auto animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display font-bold text-xl">Filters</h3>
                            <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                        </div>
                        <FilterPanel />
                        <button onClick={() => setShowMobileFilter(false)} className="w-full btn-primary mt-6 py-3">Apply Filters</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
