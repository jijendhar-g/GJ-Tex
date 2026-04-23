import { useState, useContext, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, UploadCloud, AlertCircle } from 'lucide-react';

const BulkOrder = () => {
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('product');
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        companyName: user?.companyName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        product: productId || '',
        quantity: '',
        customizationDetails: '',
        logoFile: null
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/products');
                setProducts(data.products || data);
            } catch (err) {
                console.error("Failed to load products for dropdown");
            }
        };
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'logoFile') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login?redirect=bulk-order');
            return;
        }

        setLoading(true);
        setError(null);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                submitData.append(key, formData[key]);
            }
        });

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            await axios.post('http://localhost:5000/api/orders', submitData, config);
            setSuccess(true);
            setLoading(false);
            // reset form
            setFormData({
                ...formData, quantity: '', customizationDetails: '', logoFile: null
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-20 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-dark mb-4">Inquiry Sent!</h2>
                    <p className="text-gray-600 mb-8">Thank you for your bulk order request. Our sales team will evaluate your requirements and contact you shortly with a quotation.</p>
                    <div className="flex flex-col gap-3">
                        <Link to="/dashboard" className="btn-primary">View My Orders</Link>
                        <button onClick={() => setSuccess(false)} className="text-brand font-medium hover:underline">Submit Another Request</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">Request Bulk Order Quote</h1>
                    <p className="text-gray-600 text-lg">Connect with Tiruppur's finest garment manufacturers to bring your designs to life.</p>
                </div>

                {!user && (
                    <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-brand shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-semibold text-orange-800">Authentication Required</h4>
                            <p className="text-orange-700 text-sm mt-1">Please log in or create an account to submit a bulk order inquiry so we can track and process your request securely.</p>
                            <Link to="/login?redirect=bulk-order" className="inline-block mt-3 text-sm font-bold text-brand hover:underline">Log in now &rarr;</Link>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-dark p-6 sm:p-10 text-white">
                        <h2 className="text-2xl font-semibold mb-2">Order Specifics</h2>
                        <p className="text-gray-400">Please provide detailed requirements to get the most accurate quotation.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-lg font-semibold text-dark border-b pb-2 mb-4">Contact Information</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" disabled={!!user} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company / Brand Name</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="input-field" placeholder="Acme Clothing Co" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="john@example.com" disabled={!!user} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-4">
                                <h3 className="text-lg font-semibold text-dark border-b pb-2 mb-4">Product Requirements</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product Base *</label>
                                <select name="product" required value={formData.product} onChange={handleChange} className="input-field bg-white">
                                    <option value="" disabled>-- Choose a base garment --</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.title} (MOQ: {p.moq})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Est. Quantity *</label>
                                <input type="number" name="quantity" required min="50" value={formData.quantity} onChange={handleChange} className="input-field" placeholder="e.g. 500" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customization Details (Colors, Sizes, Printing needs)</label>
                                <textarea name="customizationDetails" rows="4" value={formData.customizationDetails} onChange={handleChange} className="input-field resize-none" placeholder="We need 300 M, 200 L sizes in Navy Blue. Logo to be embroidered on the left chest..."></textarea>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attach Logo / Tech Pack (Optional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand transition-colors cursor-pointer bg-gray-50 group">
                                    <div className="space-y-2 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-brand transition-colors" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-brand hover:text-orange-600 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="logoFile" type="file" className="sr-only" onChange={handleChange} accept="image/*,.pdf" />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formData.logoFile ? <span className="text-brand font-medium">Selected: {formData.logoFile.name}</span> : 'PNG, JPG, PDF up to 10MB'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading || !user}
                                className={`w-full py-4 text-lg btn-primary flex items-center justify-center gap-2 ${(!user || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>Submit Inquiry <Send size={20} /></>
                                )}
                            </button>
                            <p className="text-center text-sm text-gray-500 mt-4">By submitting, you agree to our Terms and Conditions.</p>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

// Also adding a dummy check component here to use in success state 
function Check(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}

export default BulkOrder;
