import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const RestaurantContext = createContext<{ restaurantId: string | null }>({ restaurantId: null });

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    if (user) setRestaurantId(user.restaurant_id);
    else setRestaurantId(null);
  }, [user]);

  return (
    <RestaurantContext.Provider value={{ restaurantId }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
