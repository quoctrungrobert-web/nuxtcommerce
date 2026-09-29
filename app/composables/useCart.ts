import { push } from 'notivue';

const CART_STORAGE_KEY = 'cart';

export interface CartItem {
  key: string;
  productId: string;
  variantId: string | number;
  title: string;
  variantTitle: string;
  image: string;
  price: number; // in cents
  quantity: number;
}

export const useCart = () => {
  const cart = useState<CartItem[]>('cart', () => []);
  const addToCartButtonStatus = ref<'add'|'loading'|'added'>('add');

  const persistCart = () => {
    if (!process.client) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.value));
  };

  const setCart = (items: CartItem[]) => {
    cart.value = items;
    persistCart();
  };

  const findItem = (key: string) => {
    return cart.value.find(item => item.key === key);
  };

  const handleAddToCart = (product: any, variant: any, quantity: number = 1, customPriceCents?: number) => {
    addToCartButtonStatus.value = 'loading';

    try {
      const key = `${product.id}_${variant.id}`;
      const itemIndex = cart.value.findIndex(item => item.key === key);
      
      const finalPrice = customPriceCents !== undefined ? customPriceCents : variant.price;

      if (itemIndex >= 0) {
        const next = [...cart.value];
        next[itemIndex] = { ...next[itemIndex], quantity: next[itemIndex].quantity + quantity, price: finalPrice };
        setCart(next);
      } else {
        const incoming: CartItem = {
          key,
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          variantTitle: variant.title,
          image: product.images?.[0] || product.img || '',
          price: finalPrice, // cents
          quantity: quantity
        };
        setCart([...cart.value, incoming]);
      }

      addToCartButtonStatus.value = 'added';
      push.success('Added to cart');
      setTimeout(() => {
        addToCartButtonStatus.value = 'add';
      }, 2000);
    } catch {
      addToCartButtonStatus.value = 'add';
      push.error('Failed to add to cart');
    }
  };

  const changeQuantity = (key: string, quantity: number) => {
    const next =
      quantity <= 0
        ? cart.value.filter(item => item.key !== key)
        : cart.value.map(item => (item.key === key ? { ...item, quantity } : item));

    setCart(next);
  };

  const increment = (key: string) => {
    const item = findItem(key);
    if (!item) return;
    changeQuantity(key, item.quantity + 1);
  };

  const decrement = (key: string) => {
    const item = findItem(key);
    if (!item) return;
    changeQuantity(key, item.quantity - 1);
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  onMounted(() => {
    if (!process.client) return;
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }
  });

  return {
    cart,
    addToCartButtonStatus,
    handleAddToCart,
    increment,
    decrement,
    changeQuantity,
    clearCart,
    getTotal
  };
};
