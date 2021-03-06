import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const storagedProducts = await AsyncStorage.getItem(
          '@GoMarketplace:products',
        );

        if (storagedProducts) {
          setProducts(JSON.parse(storagedProducts));
        }
      } catch (err) {
        console.log(err);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const existingProductInCart = products.some(
        item => item.id === product.id,
      );

      let addedProducts = products;

      if (existingProductInCart) {
        addedProducts = products.map(item => {
          return item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item;
        });
      } else {
        const addedProduct = {
          ...product,
          quantity: 1,
        };

        addedProducts = [...products, addedProduct];
      }

      setProducts(addedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(addedProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incremetedProducts = products.map(product =>
        product.id === id
          ? {
              ...product,
              quantity: product.quantity + 1,
            }
          : product,
      );

      setProducts(incremetedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(incremetedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementedProducts = products.map(product =>
        product.id === id
          ? {
              ...product,
              quantity: product.quantity - 1,
            }
          : product,
      );

      setProducts(decrementedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(decrementedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
