import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_URL } from '../api';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 pb-20">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="bg-white p-16 rounded-3xl shadow-card border border-gray-100">
                        <ShoppingBag size={64} className="mx-auto mb-6 text-gray-200" />
                        <h2 className="text-3xl font-bold text-dark font-display mb-3">Your Cart is Empty</h2>
                        <p className="text-gray-500 mb-8">Browse our catalog and add products to get started!</p>
                        <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                            <ArrowLeft size={18} /> Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const cartTotal = cartItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-hero-gradient pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-brand font-bold tracking-widest text-sm uppercase">Your Selection</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 mt-4 font-display">
                            Shopping <span className="gradient-text">Cart</span>
                        </h1>
                        <p className="text-gray-300 text-lg font-light">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60L1440 60V30C1200 5 960 50 720 30C480 10 240 50 0 30V60Z" fill="#f8fafc" /></svg>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map(item => (
                            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex gap-6 items-center">
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                        src={item.image?.startsWith('http') ? item.image : `${window.location.origin}${item.image}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-dark font-display text-lg truncate">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">{item.category} • {item.fabricType}</p>
                                    <p className="text-brand font-bold mt-1">₹{item.price} / pc</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-12 text-center font-bold text-dark">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="font-bold text-dark">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4">
                            <Link to="/products" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1">
                                <ArrowLeft size={16} /> Continue Shopping
                            </Link>
                            <button
                                onClick={clearCart}
                                className="text-red-500 font-semibold text-sm hover:underline flex items-center gap-1"
                            >
                                <Trash2 size={14} /> Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 sticky top-28">
                            <h3 className="font-display font-bold text-xl text-dark mb-6 pb-4 border-b border-gray-100">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 truncate max-w-[200px]">{item.title} × {item.quantity}</span>
                                        <span className="font-medium text-dark">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-6">
                                <div className="flex justify-between text-sm text-gray-500 mb-2">
                                    <span>Total Items</span>
                                    <span>{cartItems.reduce((s, i) => s + i.quantity, 0)} pcs</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-dark">
                                    <span>Total</span>
                                    <span className="gradient-text">₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
                            >
                                {user ? 'Proceed to Checkout' : 'Sign In to Checkout'} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
