import { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('cartItems');
        if (saved) {
            setCartItems(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        // Block out-of-stock products
        if (product.availableQuantity <= 0) return false;

        setCartItems(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                return prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                _id: product._id,
                title: product.title,
                image: product.images?.[0] || '/images/hero-garments.png',
                price: product.priceRange?.min || product.price || 0,
                moq: product.moq,
                fabricType: product.fabricType,
                category: product.category?.name || product.category,
                availableQuantity: product.availableQuantity,
                quantity
            }];
        });
        return true;
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId);
        setCartItems(prev =>
            prev.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
