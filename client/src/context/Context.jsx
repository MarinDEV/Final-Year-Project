import { createContext } from 'react';
export const AuthContext = createContext({
  loaded: null,
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  cartCount: 0,
  setCart: () => {},
  cartPrice: 0,
  setCartPrice: () => {},
  role: null,
  setRole: () => {}
});

