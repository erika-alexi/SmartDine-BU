import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { menuItems as fallbackMenuItems } from '../data/menuData';
import { normalizeMenuCategory, sortMenuItems } from '../services/menuService';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  allergens?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  addOns?: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface CartContextType {
  cart: CartItem[];
  menuItems: MenuItem[]; // LIVE DATA FROM SUPABASE
  isLoading: boolean;    // TRACKING FETCH STATUS
  addToCart: (item: MenuItem, addOns?: AddOn[]) => void;
  removeFromCart: (itemId: string, addOns?: AddOn[]) => void;
  updateQuantity: (itemId: string, quantity: number, addOns?: AddOn[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function sameAddOns(first?: AddOn[], second?: AddOn[]) {
  const normalize = (items?: AddOn[]) =>
    JSON.stringify([...(items || [])].map(item => item.id).sort());
  return normalize(first) === normalize(second);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH LIVE MENU FROM SUPABASE ON LOAD
  useEffect(() => {
    async function fetchLiveMenu() {
      if (!supabase) {
        setMenuItems(sortMenuItems(fallbackMenuItems));
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true);

        if (data && data.length > 0) {
          const formattedData = sortMenuItems(data.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price), // This ensures 150.00 shows correctly
            category: normalizeMenuCategory(item.category),
            image: item.image_url || item.image,
            allergens: item.allergens || []
          })));
          setMenuItems(formattedData);
        }
        if (error) {
          console.warn("Using bundled menu because Supabase returned an error:", error.message);
          setMenuItems(sortMenuItems(fallbackMenuItems));
        }
      } catch (err) {
        console.warn("Using bundled menu because live menu fetch failed:", err);
        setMenuItems(sortMenuItems(fallbackMenuItems));
      } finally {
        setIsLoading(false);
      }
    }
    fetchLiveMenu();
  }, []);

  // 2. LOCAL STORAGE LOGIC FOR CART
  useEffect(() => {
    const savedCart = localStorage.getItem('smartdine_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smartdine_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem, addOns?: AddOn[]) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i =>
        i.id === item.id && sameAddOns(i.addOns, addOns)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { ...item, quantity: 1, addOns }];
    });
  };

  const removeFromCart = (itemId: string, addOns?: AddOn[]) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && sameAddOns(item.addOns, addOns))));
  };

  const updateQuantity = (itemId: string, quantity: number, addOns?: AddOn[]) => {
    if (quantity <= 0) {
      removeFromCart(itemId, addOns);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId && sameAddOns(item.addOns, addOns) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const addOnsPrice = item.addOns?.reduce((addOnSum, addOn) => addOnSum + addOn.price, 0) || 0;
    return sum + (item.price + addOnsPrice) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      menuItems,     // EXPOSING LIVE DATA
      isLoading,     // EXPOSING LOADING STATE
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
