import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package, Ruler, Droplets, Info, ArrowRight, CheckCircle2, Phone, ShoppingCart, Plus, Minus, Check, Ban } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const { cartItems, addToCart } = useContext(CartContext);
    const [selectedSize, setSelectedSize] = useState('');
    const [sizeError, setSizeError] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-brand rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium">Loading product...</p>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen pt-32 pb-16 px-4 bg-gray-50">
            <div className="max-w-lg mx-auto bg-white p-10 rounded-3xl text-center shadow-card border border-gray-100">
                <h2 className="text-2xl font-bold text-dark mb-4 font-display">Product Not Found</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft size={18} /> Return to Catalog
                </Link>
            </div>
        </div>
    );

    const images = product.images?.length > 0
        ? product.images.map(img => (img.startsWith('http') || img.startsWith('/images/')) ? img : `http://localhost:5000${img}`)
        : ['/images/hero-garments.png'];

    const isOutOfStock = product.availableQuantity <= 0;
    const genderIcon = product.gender === 'Men' ? '👔' : product.gender === 'Women' ? '👗' : '🔀';
    const isInCart = cartItems?.some(item => item._id === product._id);

    const handleCartAction = () => {
        if (isInCart) {
            navigate('/cart');
            return;
        }
        if (!selectedSize && product.sizes && product.sizes.length > 0) {
            setSizeError(true);
            return;
        }
        setSizeError(false);
        addToCart({ ...product, selectedSize }, qty);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-hero-gradient pt-28 pb-16 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link to="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium text-sm">
                        <ArrowLeft size={16} /> Back to Products
                    </Link>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60L1440 60V30C1200 5 960 50 720 30C480 10 240 50 0 30V60Z" fill="#f8fafc" /></svg>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-20">
                <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Images */}
                        <div className="p-8 bg-gray-50 border-r border-gray-100">
                            <div className="rounded-2xl overflow-hidden aspect-square bg-white border border-gray-100 mb-4 relative">
                                <img src={images[selectedImage]} alt={product.title} className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-60 grayscale' : ''}`} />
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {product.isFeatured && (
                                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-1.5 rounded-full text-xs tracking-wider uppercase shadow-lg">
                                            ⭐ Premium
                                        </span>
                                    )}
                                    {isOutOfStock && (
                                        <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full text-xs tracking-wider uppercase shadow-lg">
                                            🚫 Out of Stock
                                        </span>
                                    )}
                                </div>
                                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                                    {genderIcon} {product.gender || 'Unisex'}
                                </span>
                            </div>
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`rounded-xl overflow-hidden aspect-square border-2 transition-all ${selectedImage === idx ? 'border-brand shadow-md' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            <span className="text-brand font-bold text-sm tracking-wider uppercase">
                                {product.category?.name || 'Garment Category'}
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-bold text-dark mt-2 mb-4 font-display leading-tight">{product.title}</h1>

                            <div className="text-3xl font-bold font-display mb-6 flex items-baseline gap-2">
                                <span className="gradient-text">₹{product.priceRange?.min}</span>
                                <span className="text-xs text-gray-400 font-normal ml-1">/ piece</span>
                            </div>

                            <p className="text-gray-500 text-base leading-relaxed mb-8">{product.description}</p>

                            {/* Specs grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[
                                    { icon: Droplets, label: 'Fabric', value: product.fabricType, color: 'from-green-500 to-emerald-600' },
                                    { icon: Ruler, label: 'Sizes', value: product.sizes?.join(', ') || 'S, M, L, XL, XXL', color: 'from-purple-500 to-purple-600' },
                                    { icon: Info, label: 'Custom', value: 'Print & Embroidery', color: 'from-orange-500 to-red-500' }
                                ].map((spec, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className={`w-9 h-9 bg-gradient-to-br ${spec.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                                            <spec.icon size={18} />
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">{spec.label}</p>
                                        <p className="text-sm font-bold text-dark mt-0.5">{spec.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Sizes Selection */}
                            {product.sizes?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-dark mb-3 text-sm">Select Size <span className="text-red-500">*</span></h4>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((size, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setSelectedSize(size); setSizeError(false); }}
                                                className={`min-w-[3rem] h-10 px-3 flex items-center justify-center font-bold text-sm rounded-xl border-2 transition-all ${selectedSize === size ? 'border-brand bg-orange-50 text-brand' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {sizeError && <p className="text-red-500 text-xs font-semibold mt-2">Please select a size before adding to cart.</p>}
                                </div>
                            )}

                            {/* Colors */}
                            {product.colors?.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="font-semibold text-dark mb-3 text-sm">Available Colors</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map((color, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-brand hover:text-brand transition-colors cursor-pointer">
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-4 py-4 border-t border-gray-100 mb-6 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Quality Assured</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Bulk Pricing</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Custom Options</span>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto space-y-3">
                                {isOutOfStock ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-5 px-6 bg-red-50 border border-red-100 rounded-2xl">
                                        <Ban size={32} className="text-red-400" />
                                        <p className="text-red-600 font-bold text-lg">Out of Stock</p>
                                        <p className="text-red-400 text-sm text-center">This product is currently unavailable. Please check back later or contact us.</p>
                                        <a href="tel:+91" className="btn-primary flex items-center gap-2 mt-1">
                                            <Phone size={16} /> Contact Us
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Stock info */}
                                        {product.availableQuantity < 5 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full inline-block"></span>
                                                <span className="text-orange-700 font-semibold">{product.availableQuantity} pcs left</span>
                                            </div>
                                        )}
                                        {/* Quantity + Add to Cart */}
                                        <div className="flex gap-3">
                                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 flex items-center justify-center text-gray-500 hover:text-brand">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center font-bold text-dark">{qty}</span>
                                                <button onClick={() => setQty(q => q + 1)} className="w-10 h-12 flex items-center justify-center text-gray-500 hover:text-brand">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleCartAction}
                                                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isInCart ? 'bg-green-500 text-white hover:bg-green-600' : addedToCart ? 'bg-green-500 text-white' : 'bg-dark text-white hover:bg-gray-800'}`}
                                            >
                                                {isInCart ? <><ShoppingCart size={18} /> View Cart</> : addedToCart ? <><Check size={18} /> Added to Cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

