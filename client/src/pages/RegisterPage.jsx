import api from "../api";
import { Link, useNavigate} from "react-router-dom";
import { AuthContext } from "../context/Context";
import React, {useState, useEffect, useContext} from "react";
import styles from "../style/pages/register.module.css";

function RegisterPage() {

  const { user, loaded, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formInputs, setFormInputs] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if(user){
      navigate(`${process.env.PUBLIC_URL}/`);
    }
  }, [user]);

  // Hooks & methods to set the form styles when validating.

  const [nameStyle, setNameStyle] = useState({
    nameLabel: styles.textLabel,
    nameInput: styles.textInput,
    nameInfoText: '',
  });

  const [emailStyle, setEmailStyle] = useState({
    emailInput: styles.textInput,
    emailLabel: styles.textLabel,
    emailInfoText: '',
  });

  const [passwordStyle, setPasswordStyle] = useState({
    passwordLabel: styles.textLabel,
    passwordInput: styles.passwordInput,
    passwordInfoText: '(Minimum 6 characters)',
    passwordInfoStyle: styles.errorMessage
  });

  const setNameError = (bool, text) => {
    if(bool){
      setNameStyle({
        nameInput: styles.textInputError, 
        nameLabel: styles.textLabelError,
        nameInfoText: text
      });
    }else{
      setNameStyle({
        nameInput: styles.textInput, 
        nameLabel: styles.textLabel,
        nameInfoText: '',
  });}}

  const setEmailError = (bool, text) => {
    if(bool){
      setEmailStyle({
        emailInput: styles.textInputError, 
        emailLabel: styles.textLabelError, 
        emailInfoText: text
      });
    }else{
      setEmailStyle({
        emailInput: styles.textInput, 
        emailLabel: styles.textLabel, 
        emailInfoText: ''
  });}}

  const setPasswordError = (bool,text) => {
    if(bool){
      setPasswordStyle({
        passwordInput: styles.passwordInputError, 
        passwordLabel: styles.textLabelError, 
        passwordInfoText: text, 
        passwordInfoStyle: styles.errorMessageError
      });
    }else{
      setPasswordStyle({
        passwordInput: styles.passwordInput, 
        passwordLabel: styles.textLabel, 
        passwordInfoText: '(Minimum 6 characters)', 
        passwordInfoStyle: styles.errorMessage
  });}}

  const validateName = () => {
    if(!formInputs.name){
      setNameError(true, "Enter a name!");
      return false;
    }else{
      setNameError(false);
      return true;
  }}

  // Validates the email field
  const  validateEmail = (email) => {
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

  // Validates the password field
  const validatePassword = (password, confirmPassword) => {
    if(!password){ setPasswordError(true, "Enter a password!");
    }else if(password.length<6){
      setPasswordError(true, "Your password must have 6+ characters!");
    }else if(!confirmPassword){
      setPasswordError(true, "Confirm your password!");
    }else if(password != confirmPassword){
      setPasswordError(true, "Passwords do not match!");
    }else{
      setPasswordError(false, '')
      return true;
    }
    return false;
  }


  // Handles new user registration
  const handleRegistration = async (e) => {
    e.preventDefault();
    if(!validateEmail(formInputs.email) 
    || !validateName(formInputs.name) 
    || !validatePassword(formInputs.password, formInputs.confirmPassword)) return;

    const payload = formInputs;
    api.insertUser(payload).then((res) => {
      if(res.data.success){
        const token = res.data.token;
        const user = res.data.user;
        const expiration = res.data.expiration;
        login(user, token, expiration);
        navigate(`${process.env.PUBLIC_URL}/`);
      }else{
        setEmailError(true, 'This email is already in use!');
      }
    }).catch((err) => {
      if(err.res.data['message']){
        setEmailError(true, 'This email is already in use!');
      }
  });}

   if(loaded & !user){
      return (
        <div className={styles.register}>
          <div className={styles.division}>
              <h2>Create an account and <br/> get the best offers</h2>
              <span>Already have an account? 
                <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/login`)}}> Log In</a>
              </span>
              <img className={styles.image} src={`${process.env.PUBLIC_URL}/images/courier.svg`}/>
          </div>
          <div className={styles.division}>
              <h1 className={styles.title}><b>Register</b></h1>
              <form className={styles.form} onSubmit={(e) => handleRegistration(e)}>
                <span className={nameStyle.nameLabel}><b>Full Name</b></span>
                <span className={styles.errorMessageError}>{nameStyle.nameInfoText}</span>
                <input 
                  required
                  className={nameStyle.nameInput} 
                  maxLength="50" 
                  name="name" 
                  type="text" 
                  placeholder="Enter Your Full Name" 
                  onChange={(e) => setFormInputs({
                    ...formInputs, 
                    name: e.target.value
                  })}
                />
                <span className={emailStyle.emailLabel}><b>Email</b></span>
                <span className={styles.errorMessageError}>{emailStyle.emailInfoText}</span>
                <input 
                  required
                  className={emailStyle.emailInput} 
                  maxLength="50" 
                  name="email" 
                  type="email" 
                  placeholder="Enter Your Email" 
                  onChange={(e) => setFormInputs({
                    ...formInputs, 
                    email: e.target.value
                  })}
                />
                <span className={passwordStyle.passwordLabel}><b>Password</b></span>
                <span className={passwordStyle.passwordInfoStyle}>{passwordStyle.passwordInfoText}</span>
                <input 
                  required
                  className={passwordStyle.passwordInput} 
                  maxLength="50" 
                  name="password" 
                  type="password" 
                  placeholder="********" 
                  onChange={(e) => setFormInputs({
                    ...formInputs, 
                    password: e.target.value
                  })}
                />
                <span className={passwordStyle.passwordLabel}><b>Confirm Password</b></span>
                <input 
                  required
                  className={passwordStyle.passwordInput} 
                  maxLength="50" 
                  type="password" 
                  placeholder="********" 
                  onChange={(e) => setFormInputs({
                    ...formInputs, 
                    confirmPassword: e.target.value
                  })}
                />
                {/* <p className={styles.p}>By registering you agree to the <a href="">Terms & Conditions</a></p> */}
                <input style={{marginTop: 20}} className={styles.textInput} type="submit" value="CONTINUE"></input>
              </form>
          </div>
        </div>
      );
    }else{
      return(null);
    }
}

export default RegisterPage;
