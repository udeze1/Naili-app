// context/CartContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import {
  getOrCreateUserCart,
  getCartItems,
  updateCartItem as supabaseUpdateItem,
} from '../services/cart';
import { useUser } from './UserContext';
import { CartItem } from '../services/cart';

type LocalCart = Record<string, number>;

type CartContextType = {
  localCart: LocalCart;
  cartItems: CartItem[];
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>; // ✅ added clearCart
  totalCount: number;
  totalPrice: number;
  cartId: string | null;
  getTotalCountAndPrice: () => { totalCount: number; totalPrice: number };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [cartId, setCartId] = useState<string | null>(null);
  const [localCart, setLocalCart] = useState<LocalCart>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const ready = !!user?.id && !!cartId;

  useEffect(() => {
    if (!user?.id) return;
    getOrCreateUserCart(user.id).then(id => setCartId(id));
  }, [user]);

  useEffect(() => {
    if (!ready || !user?.id) return;
    getCartItems(user.id).then(items => {
      const validItems = items.filter(i => i.product && i.product.price !== null);
      const initial: LocalCart = {};
      validItems.forEach(ci => {
        initial[ci.product.id] = ci.quantity;
      });
      setLocalCart(initial);
      setCartItems(validItems);
    });
  }, [ready]);

  const updateItem = async (productId: string, quantity: number) => {
    setLocalCart(prev => {
      const next = { ...prev };
      if (quantity > 0) {
        next[productId] = quantity;
      } else {
        delete next[productId];
      }
      return next;
    });

    if (!ready || !user?.id) return;

    try {
      await supabaseUpdateItem(cartId!, productId, quantity, user.id);
      const items = await getCartItems(user.id);
      const validItems = items.filter(i => i.product && i.product.price !== null);
      setCartItems(validItems);
    } catch (err) {
      console.error('❌ Supabase sync error:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    await updateItem(productId, 0);
  };

  const clearCart = async () => {
    setLocalCart({});
    setCartItems([]);

    if (!ready || !user?.id) return;

    try {
      const promises = cartItems.map(item =>
        supabaseUpdateItem(cartId!, item.product.id, 0, user.id)
      );
      await Promise.all(promises);

      const items = await getCartItems(user.id);
      setCartItems(items.filter(i => i.product && i.product.price !== null));
    } catch (err) {
      console.error('❌ Supabase clearCart error:', err);
    }
  };

  const totalCount = useMemo(() => {
    return Object.values(localCart).reduce((sum, q) => sum + q, 0);
  }, [localCart]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item?.product?.price ?? 0;
      return sum + item.quantity * price;
    }, 0);
  }, [cartItems]);

  const getTotalCountAndPrice = () => ({
    totalCount,
    totalPrice,
  });

  return (
    <CartContext.Provider
      value={{
        localCart,
        cartItems,
        updateItem,
        removeFromCart,
        clearCart, // ✅ exposed here
        totalCount,
        totalPrice,
        cartId,
        getTotalCountAndPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};