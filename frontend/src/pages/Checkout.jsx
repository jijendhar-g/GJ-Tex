import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Send, ArrowLeft, Package, MapPin, CreditCard, Banknote, ShieldCheck, X, QrCode } from 'lucide-react';
import { API_URL } from '../api';

const Checkout = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [contactDetails, setContactDetails] = useState({
        name: user?.name || '',
        companyName: user?.companyName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [processingPayment, setProcessingPayment] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    if (!user) {
        navigate('/login?redirect=checkout');
        return null;
    }

    if (cartItems.length === 0 && !success) {
        navigate('/cart');
        return null;
    }

    const cartTotal = cartItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'Online Payment' || paymentMethod === 'UPI / QR Code') {
            handleRazorpayPayment();
            return;
        }

        processOrder();
    };

    const handleRazorpayPayment = async () => {
        setProcessingPayment(true);
        setError('');

        const res = await loadRazorpay();
        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setProcessingPayment(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            // 1. Create Order
            const { data: order } = await axios.post(`${API_URL}/api/payment/create-order`, { amount: cartTotal }, config);

            // 2. Get Razorpay Key
            const { data: { key } } = await axios.get(`${API_URL}/api/payment/key`, config);

            const options = {
                key,
                amount: order.amount.toString(),
                currency: order.currency,
                name: 'GJ TEX',
                description: 'Payment for your order',
                order_id: order.id,
                prefill: {
                    name: contactDetails.name,
                    email: contactDetails.email,
                    contact: contactDetails.phone
                },
                handler: async function (response) {
                    try {
                        setProcessingPayment(true);
                        // 3. Verify Payment
                        const verifyRes = await axios.post(`${API_URL}/api/payment/verify`, response, config);

                        if (verifyRes.data.success) {
                            // 4. Place Order in our DB
                            await processOrder(true);
                        } else {
                            setError('Payment verification failed. Please contact support.');
                            setProcessingPayment(false);
                        }
                    } catch (err) {
                        setError('Payment verification failed.');
                        setProcessingPayment(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(false);
                    }
                },
                theme: {
                    color: '#f97316'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setProcessingPayment(false);
        }
    };

    const processOrder = async (isOnlinePaid = false) => {
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            };

            const deliveryAddress = `${contactDetails.address}, ${contactDetails.city}, ${contactDetails.state} - ${contactDetails.pincode}`;

            const orderItemsPayload = cartItems.map(item => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price
            }));

            await axios.post(`${API_URL}/api/orders`, {
                orderItems: orderItemsPayload,
                totalPrice: cartTotal,
                contactDetails: {
                    name: contactDetails.name,
                    companyName: contactDetails.companyName,
                    email: contactDetails.email,
                    phone: contactDetails.phone
                },
                customizationDetails: `Delivery Address: ${deliveryAddress}`,
                paymentMethod
            }, config);

            clearCart();
            setSuccess(true);
            setLoading(false);
            setProcessingPayment(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
            setProcessingPayment(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-20 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center border border-gray-100 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-dark font-display mb-4">Order Placed!</h2>
                    <p className="text-gray-500 mb-8">Thank you for your order. Our team will review your requirements and contact you shortly.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/dashboard" className="btn-primary py-3">View My Orders</Link>
                        <Link to="/products" className="text-brand font-semibold hover:underline">Continue Shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-hero-gradient pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-brand font-bold tracking-widest text-sm uppercase">Final Step</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 mt-4 font-display">
                            <span className="gradient-text">Checkout</span>
                        </h1>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60L1440 60V30C1200 5 960 50 720 30C480 10 240 50 0 30V60Z" fill="#f8fafc" /></svg>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Contact + Address Form */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Details */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                                <h2 className="font-display font-bold text-xl text-dark mb-6 pb-4 border-b border-gray-100">Contact Details</h2>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100">{error}</div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Name *</label>
                                        <input type="text" required value={contactDetails.name} onChange={(e) => setContactDetails({ ...contactDetails, name: e.target.value })} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Company</label>
                                        <input type="text" value={contactDetails.companyName} onChange={(e) => setContactDetails({ ...contactDetails, companyName: e.target.value })} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Email *</label>
                                        <input type="email" required value={contactDetails.email} onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Phone *</label>
                                        <input type="tel" required value={contactDetails.phone} onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })} className="input-field" />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                                <h2 className="font-display font-bold text-xl text-dark mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                                    <MapPin size={20} className="text-brand" /> Delivery Address
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-dark mb-2">Street Address *</label>
                                        <input type="text" required value={contactDetails.address} onChange={(e) => setContactDetails({ ...contactDetails, address: e.target.value })} className="input-field" placeholder="123, Main Street, Area" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">City *</label>
                                        <input type="text" required value={contactDetails.city} onChange={(e) => setContactDetails({ ...contactDetails, city: e.target.value })} className="input-field" placeholder="Tiruppur" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">State *</label>
                                        <input type="text" required value={contactDetails.state} onChange={(e) => setContactDetails({ ...contactDetails, state: e.target.value })} className="input-field" placeholder="Tamil Nadu" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-dark mb-2">Pincode *</label>
                                        <input type="text" required value={contactDetails.pincode} onChange={(e) => setContactDetails({ ...contactDetails, pincode: e.target.value })} className="input-field" placeholder="641601" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                                <h2 className="font-display font-bold text-xl text-dark mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                                    <CreditCard size={20} className="text-brand" /> Payment Method
                                </h2>

                                <div className="space-y-4">
                                    <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-brand bg-orange-50' : 'border-gray-100 hover:border-brand/30'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="Cash on Delivery"
                                                    checked={paymentMethod === 'Cash on Delivery'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-5 h-5 text-brand focus:ring-brand border-gray-300"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                                        <Banknote size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark">Cash on Delivery (COD)</p>
                                                        <p className="text-sm text-gray-500">Pay when your order arrives</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Online Payment' ? 'border-brand bg-orange-50' : 'border-gray-100 hover:border-brand/30'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="Online Payment"
                                                    checked={paymentMethod === 'Online Payment'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-5 h-5 text-brand focus:ring-brand border-gray-300"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                        <CreditCard size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark">Online Payment</p>
                                                        <p className="text-sm text-gray-500">Credit/Debit Card, UPI, NetBanking</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>

                                    {/* UPI / QR Code Option (Using Razorpay) */}
                                    <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'UPI / QR Code' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-300'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="UPI / QR Code"
                                                    checked={paymentMethod === 'UPI / QR Code'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                        <QrCode size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark">UPI / QR Code</p>
                                                        <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm & more</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full btn-primary py-4 text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Placing Order...</span>
                                    </div>
                                ) : (
                                    <>
                                        {paymentMethod === 'Online Payment' ? 'Proceed to Pay via Card' : paymentMethod === 'UPI / QR Code' ? 'Proceed to Pay via UPI' : 'Place Order'}
                                        {paymentMethod === 'Online Payment' ? <CreditCard size={18} /> : paymentMethod === 'UPI / QR Code' ? <QrCode size={18} /> : <Send size={18} />}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 sticky top-28">
                            <h3 className="font-display font-bold text-xl text-dark mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                                <Package size={20} className="text-brand" /> Order Summary
                            </h3>

                            <div className="space-y-4 mb-6">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex gap-3 items-center">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={item.image?.startsWith('http') ? item.image : `${window.location.origin}${item.image}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-dark truncate">{item.title}</p>
                                            <p className="text-xs text-gray-400">{item.quantity} pcs × ₹{item.price}</p>
                                        </div>
                                        <span className="font-bold text-dark text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between text-lg font-bold text-dark">
                                    <span>Total</span>
                                    <span className="gradient-text">₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link to="/cart" className="flex items-center gap-1 text-brand text-sm font-semibold mt-4 hover:underline">
                                <ArrowLeft size={14} /> Edit Cart
                            </Link>
                        </div>
                    </div>
                </div >
            </div >

        </div >
    );
};

export default Checkout;
