import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { ArrowRight, ShoppingCart, Check, Ban } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { API_URL } from '../api';

const ProductCard = ({ product }) => {
    const { cartItems, addToCart } = useContext(CartContext);
    const [added, setAdded] = useState(false);
    const navigate = useNavigate();

    const isOutOfStock = product.availableQuantity <= 0;
    const isInCart = cartItems?.some(item => item._id === product._id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;

        if (isInCart) {
            navigate('/cart');
            return;
        }

        addToCart(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const genderIcon = product.gender === 'Men' ? '👔' : product.gender === 'Women' ? '👗' : '🔀';

    return (
        <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 card-hover">
            {/* Image */}
            <div className="relative h-72 overflow-hidden bg-gray-100">
                <img
                    src={product.images && product.images.length > 0
                        ? (product.images[0].startsWith('http')
                            ? product.images[0]
                            : `${window.location.origin}${product.images[0]}`)
                        : `${window.location.origin}/images/hero-garments.png`}
                    alt={product.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Top-left badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {product.isFeatured && (
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                            ⭐ Featured
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                            🚫 Out of Stock
                        </span>
                    )}
                </div>

                {/* Gender badge top-right */}
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    {genderIcon} {product.gender || 'Unisex'}
                </span>

                {/* Quick actions on hover */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <Link
                        to={`/products/${product._id}`}
                        className="flex-1 bg-white/95 backdrop-blur-sm text-dark font-semibold text-center py-3 rounded-xl hover:bg-brand hover:text-white shadow-lg transition-all"
                    >
                        View Details
                    </Link>
                    {!isOutOfStock && (
                        <button
                            onClick={handleAddToCart}
                            title={isInCart ? 'View Cart' : 'Add to Cart'}
                            className={`w-12 flex items-center justify-center rounded-xl shadow-lg transition-all ${isInCart || added
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-brand text-white hover:bg-orange-600'
                                }`}
                        >
                            {isInCart ? <ShoppingCart size={18} /> : added ? <Check size={20} /> : <ShoppingCart size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-brand font-bold tracking-wider uppercase bg-orange-50 px-2 py-0.5 rounded-md">
                        {product.category?.name || 'Garment'}
                    </span>
                    {isOutOfStock ? (
                        <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            Out of Stock
                        </span>
                    ) : product.availableQuantity < 5 ? (
                        <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                            {product.availableQuantity} pcs left
                        </span>
                    ) : null}
                </div>

                <h3 className="text-lg font-bold text-dark mb-2 font-display line-clamp-1 group-hover:text-brand transition-colors">
                    {product.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                {/* Specs */}
                <div className="flex gap-4 mb-4 text-xs">
                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-400 block">Fabric</span>
                        <span className="font-bold text-dark truncate">{product.fabricType}</span>
                    </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-xs text-gray-400">Price</span>
                        <p className="text-xl font-bold text-dark font-display">
                            ₹{product.priceRange?.min} <span className="text-sm text-gray-400 font-normal">/ pc</span>
                        </p>
                    </div>
                    {isOutOfStock ? (
                        <span className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center cursor-not-allowed" title="Out of Stock">
                            <Ban size={18} />
                        </span>
                    ) : (
                        <Link to={`/products/${product._id}`}
                            className="w-10 h-10 bg-orange-50 text-brand rounded-xl flex items-center justify-center hover:bg-brand hover:text-white transition-all duration-300"
                        >
                            <ArrowRight size={18} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
