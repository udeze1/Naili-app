import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabase';

type UserType = {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  current_cart_id?: string; // ✅ for cart usage
};

type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  address: string | null;
  setAddress: (address: string) => void;
};

const UserContext = createContext<UserContextType | null>(null);

// ✅ mock user (only used in dev mode)
const mockUser: UserType = {
  id: '00000000-0000-0000-0000-000000000001', // ✅ valid UUID format
  email: 'dev@noniq.app',
  full_name: 'Dev Tester',
  phone_number: '08000000000',
  address: '123 Dev Street',
  current_cart_id: '00000000-0000-0000-0000-000000000002', // ✅ valid format
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      // ✅ Use mock user in dev mode only
      if (__DEV__) {
        setUser(mockUser);
        setAddress(mockUser.address || null);
        return;
      }

      // 👇 Only runs in production
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('full_name, phone_number, address, current_cart_id')
          .eq('id', sessionUser.id)
          .single();

        if (profile) {
          const loadedUser: UserType = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            full_name: profile.full_name || '',
            phone_number: profile.phone_number || '',
            address: profile.address || '',
            current_cart_id: profile.current_cart_id || '',
          };
          setUser(loadedUser);
          setAddress(loadedUser.address || null);
        }
      }
    };

    initUser();

    // ✅ Skip auth state listener in dev to avoid overriding mock user
    if (!__DEV__) {
      const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        const sessionUser = session?.user;

        if (sessionUser) {
          supabaseClient
            .from('profiles')
            .select('full_name, phone_number, address, current_cart_id')
            .eq('id', sessionUser.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                const loadedUser: UserType = {
                  id: sessionUser.id,
                  email: sessionUser.email || '',
                  full_name: profile.full_name || '',
                  phone_number: profile.phone_number || '',
                  address: profile.address || '',
                  current_cart_id: profile.current_cart_id || '',
                };
                setUser(loadedUser);
                setAddress(loadedUser.address || null);
              }
            });
        } else {
          setUser(null);
          setAddress(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, address, setAddress }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};