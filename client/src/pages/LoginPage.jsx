import api from "../api";
import { useNavigate } from "react-router-dom";
import styles from "../style/pages/login.module.css";
import React, {useContext, useState, useEffect} from "react";

import {AuthContext} from '../context/Context';

function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loaded, setCart, setCartPrice } = useContext(AuthContext);

  const [details, setDetails] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if(user){
      navigate(`${process.env.PUBLIC_URL}/`);
    }
  }, [user]);


  // Updates the details when the user types on the email field
  const handleEmailChange = (event) => {
    var value = event.target.value;
    setDetails({...details, email: value});
  }

  // Updates the details when the user types on the password field
  const handlePassChange = (event) => {
    var value = event.target.value;
    setDetails({...details, password: value});
  }


  // Hooks & methods for updating styles of forms in case of error with the inputs
  const [passwordStyle, setPasswordStyle] = useState({
    input: styles.textInput,
    label: styles.textLabel,
    text: ''
  });

  const [emailStyle, setEmailStyle] = useState({
    input: styles.textInput,
    label: styles.textLabel,
    text: ''
  });

  const setEmailError = (bool, text) => {
    if(bool){
      setEmailStyle({
        input: styles.textInputError,
        label: styles.textLabelError,
        text: text
      });
    }else{
      setEmailStyle({
        input: styles.textInput,
        label: styles.textLabel,
        text: ''
  });}}

  const setPasswordError = (bool, text) => {
    if(bool){
      setPasswordStyle({
        input: styles.passwordInputError,
        label: styles.textLabelError,
        text: text
      });
    }else{
      setPasswordStyle({
        input: styles.textInput,
        label: styles.textLabel,
        text: ''
  });}}


  // Validates email field
  const validateEmail = (email) => {
    if(!email) {
      setEmailError(true, "Enter an email!");
      return false;
    }
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmailFormat = String(email).toLowerCase().match(emailRegex);
    if(!isEmailFormat){
      setEmailError(true, "Enter a valid email!");
      return;
    }
    setEmailError(false, '');
    return true;
  };

  // Validates password field
  const validatePassword = (password) => {
    if(!password){
      setPasswordError(true, "Enter a password!");
    }else{
      setPasswordError(false, '')
      return true;
    }
    return false;
  }

  // Handles the user login once the inputs have been validated.
  const handleLogin = async (e) => {
    e.preventDefault();
    var email = details.email;
    var password = details.password;
    if(!validateEmail(email) || !validatePassword(password)){
      return false;
    }
    
    const result = await api.loginUser({email, password}).then((res) => {
      /*  
        res: 
          - success: [true,false]
          - message: response message
          - userDetails: {id, name, email, role}
          - expiration: date of token expiration
      */
      if(!res.data.success){
        return false;
      }
      const user = res.data.user;
      const token = res.data.token;
      const expiration = res.data.expiration;
      login(user, token, new Date(expiration));
      navigate(`${process.env.PUBLIC_URL}/`);
      return true;
    }).catch(() => {
      return false;
    });

    if(result == false){
      setEmailError(true, '');
      setPasswordError(true, 'Wrong email or password!');
      return false;
    }

    // Update Cart
    await api.getCartItems().then((res) => {
        if(res){
          setCart(res.data.cart.length);
          let totalPrice = 0;
          res.data.cart.forEach((cartItem) => {
            totalPrice+=(cartItem.price * cartItem.quantity)
          });
          setCartPrice(totalPrice);
        }else{
          setCart(0);
          setCartPrice(0);
        }
  });}

  // If the context data has loaded and the user is null
  if(loaded && !user){
    return(
      <div className={styles.register}>
        <div className={styles.division}>
            <h2>Login to Your Account</h2>
            <span>Don't have an account? 
              <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/register`)}}> Sign Up</a>
            </span>
            <img className={styles.image} src={`${process.env.PUBLIC_URL}/images/login.jpg`} />
        </div>
        <div className={styles.division}>
            <h1 className={styles.title}><b>Sign In</b></h1>
            <form className={styles.form} onSubmit={(e) => handleLogin(e)}>
              <span className={emailStyle.label}><b>Email</b></span>
              <span className={styles.errorMessageError}>{emailStyle.text}</span>
              <input 
                className={emailStyle.input}
                type="email" 
                maxLength="50" 
                name="email"
                value={details.email}
                placeholder="Enter Your Email" 
                required
                onChange={handleEmailChange}
              />
              <span className={passwordStyle.label}><b>Password</b></span>
              <span className={styles.errorMessageError}>{passwordStyle.text}</span>
              <input 
                className={passwordStyle.input}
                type="password" 
                name="password"
                maxLength="50" 
                value={details.password}
                placeholder="**********" 
                required
                onChange={handlePassChange}
              />
              {/* <p className={styles.p}><a href="">Forgot your password?</a></p> */}
              <input style={{marginTop: 20}} type="submit" value="SIGN IN"></input>
            </form>
        </div>
      </div>
    );
  }else{
    return(null);
  }
}

export default LoginPage;