import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('aj_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('aj_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCart((prev) => {
      const cartItemId = variant ? `${product.id}-${variant.name}` : `${product.id}`;
      const existing = prev.find(item => item.cart_id === cartItemId || (!item.cart_id && item.product_id === product.id && !variant));
      
      const effectivePrice = (variant && Number(variant.price) > 0)
        ? Number(variant.price)
        : (Number(product.discounted_price) || Number(product.price) || 0);

      if (existing) {
        return prev.map(item => 
          (item.cart_id === cartItemId || (!item.cart_id && item.product_id === product.id && !variant))
            ? { ...item, quantity: item.quantity + quantity, price: effectivePrice }
            : item
        );
      }
      return [...prev, { 
        cart_id: cartItemId,
        product_id: product.id, 
        name: product.name, 
        price: effectivePrice, 
        image_url: product.image_url,
        variant_name: variant ? variant.name : null,
        quantity 
      }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter(item => (item.cart_id || `${item.product_id}`) !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) return;
    setCart((prev) => 
      prev.map(item => 
        (item.cart_id || `${item.product_id}`) === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
