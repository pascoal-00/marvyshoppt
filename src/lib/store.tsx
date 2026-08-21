import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Product } from "./catalog";
import { useCatalog } from "./catalog-context";

export type CartItem = {
  key: string;
  productId: string;
  size: string;
  quantity: number;
};

type StoreValue = {
  items: CartItem[];
  wishlist: string[];
  drawerOpen: boolean;
  hydrated: boolean;
  count: number;
  subtotal: number;
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  toggleWishlist: (productId: string) => void;
  isWished: (productId: string) => boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "mshop.cart.v1";
const WISH_KEY = "mshop.wishlist.v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const w = localStorage.getItem(WISH_KEY);
      if (c) setItems(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addItem = useCallback((product: Product, size: string, quantity = 1) => {
    const key = `${product.id}__${size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { key, productId: product.id, size, quantity }];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev.flatMap((i) =>
        i.key === key ? (quantity < 1 ? [] : [{ ...i, quantity: Math.min(quantity, 20) }]) : [i],
      ),
    );
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const subtotal = items.reduce((sum, item) => {
      const p = products.find((pr) => pr.id === item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);
    return {
      items,
      wishlist,
      drawerOpen,
      hydrated,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clear: () => setItems([]),
      toggleWishlist,
      isWished: (id: string) => wishlist.includes(id),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [items, wishlist, drawerOpen, hydrated, addItem, removeItem, setQuantity, toggleWishlist, products]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
