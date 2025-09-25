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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      // 👇 Only runs in production or dev with real session
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
      } else {
        // Guest mode
        setUser(null);
        setAddress(null);
      }
    };

    initUser();

    // Auth state listener
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