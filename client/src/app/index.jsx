import {React} from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import api from "../api";
import '../style/mainPage.css';
import CartPage from "../pages/CartPage";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SearchPage from "../pages/SearchPage";
import OrdersPage from "../pages/OrdersPage";
import { Header } from "../components/Header";
import ProductPage from "../pages/ProductPage";
import CheckoutPage from "../pages/CheckoutPage";
import RegisterPage from "../pages/RegisterPage";
import { AuthContext } from "../context/Context";
import { useState, useEffect, useCallback } from "react";
import UsersPage from "../pages/Admin/UsersPage";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";
import AddProductPage from '../pages/Seller/AddProductPage';
import ViewProducts from '../pages/Seller/ViewProducts';
import SellerOrdersPage from '../pages/Seller/SellerOrdersPage';
import AdminOrdersPage from '../pages/Admin/AdminOrdersPage';
import StartDelivery from '../pages/Courier/StartDelivery';
import DeliveryPage from '../pages/Courier/DeliveryPage';

var logoutTimer;

const App = (props) => { 

  const [user, setUser] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState();
  const [loaded, setLoaded] = useState();
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [cartCount, setCartCount] = useState();
  const [cartPrice, setPrice] = useState();

  const setCart = useCallback((count) => {
    setCartCount(count);
  });

  const setCartPrice = useCallback((price) => {
    setPrice(price);
  });

  // Set login variables 
  const login = useCallback((user, expiration) => {
    setUser(user);
    setRole(user.role);
    setLoggedIn(true);
    const tokenExpirationDate = expiration || 
      new Date(new Date().getTime() + 1000 * 1000); // 1000 seconds
    setTokenExpirationDate(tokenExpirationDate);
  }, []);

  // Remove login variables
  const logout = useCallback(() => {
    setUser(null);
    setRole(null)
    setCart(0);
    setCartPrice(0);
    setLoggedIn(false);
    setTokenExpirationDate(null);
    api.logoutUser();
  });

  // On render: login & set cart variables
  useEffect(() => {
    api.getUser().then((res) => {
      if(res.data == false){
        setLoaded(true);
      }else{
        const user = res.data.user;
        const expiration = new Date(res.data.expiration);
        login(user, expiration);
        setLoaded(true);
      }
    });
    
    api.getCartItems().then((response) => {
      if(!response.data.cart){
        setCart(0);
        setCartPrice(0);
      }else{
        setCart(response.data.cart.length);
        let totalPrice = 0;
        response.data.cart.forEach((cartItem) => {
          totalPrice+=(cartItem.price * cartItem.quantity);
        });
        setPrice(totalPrice);
      }
    }).catch((err) => {
      setCart(0);
      setCartPrice(0);
    });
  }, []);

  // Logout when the token expires
  useEffect(() => {
    if (isLoggedIn && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout,remainingTime);
    }else{
      clearTimeout(logoutTimer);
    }
  }, [isLoggedIn, logout, tokenExpirationDate]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn,
        user: user,
        login: login,
        logout: logout,
        loaded: loaded,
        cartCount: cartCount,
        setCart: setCart,
        cartPrice: cartPrice,
        setCartPrice: setCartPrice,
        role: role,
        setRole: setRole
      }}
    >
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<MainPage></MainPage>}></Route>
            <Route path="/register" element={<RegisterPage></RegisterPage>}></Route>
            <Route path="/login" element={<LoginPage></LoginPage>}></Route>
            <Route path="/search/:category/:term/" element={<SearchPage></SearchPage>}></Route>
            <Route path="/search/:category/" element={<SearchPage></SearchPage>}></Route>
            <Route path="/product/:id/" element={<ProductPage></ProductPage>}></Route>
            <Route path="/cart" element={<CartPage></CartPage>}></Route>
            <Route path="/checkout" element={<CheckoutPage></CheckoutPage>}></Route>
            <Route path="/orders" element={<OrdersPage></OrdersPage>}></Route>
            <Route path="/admin/users" element={<UsersPage></UsersPage>}></Route>
            <Route path="/admin/products" element={<AdminProductsPage></AdminProductsPage>}></Route>
            <Route path="/seller/add" element={<AddProductPage></AddProductPage>}></Route>
            <Route path="/seller/products" element={<ViewProducts></ViewProducts>}></Route>
            <Route path="/seller/orders" element={<SellerOrdersPage></SellerOrdersPage>}></Route>
            <Route path="/admin/orders" element={<AdminOrdersPage></AdminOrdersPage>}></Route>
            <Route path="/courier/startdelivery" element={<StartDelivery></StartDelivery>}></Route>
            <Route path="/courier/delivery/:deliveryId/" element={<DeliveryPage></DeliveryPage>}></Route>
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
