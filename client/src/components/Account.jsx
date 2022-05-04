/*
    The account component of the header.
*/
import React,{useContext} from "react";
import { Component } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "../style/header.module.css";
import { AuthContext } from "../context/Context";
import { useEffect } from "react";


function Account() {
    const navigate = useNavigate();
    const { user,logout, role } = useContext(AuthContext);
    
    // Redifrects to login page
    const handleClickLogin = (e) => {
        e.preventDefault();
        navigate(`${process.env.PUBLIC_URL}/login`)
    }

    // Redirects to register page
    const handleClickRegister = (e) => {
        e.preventDefault();
        navigate(`${process.env.PUBLIC_URL}/register`)
    }

    const popover = (
        <Popover id="popover-basic">
            <div className={styles.popover}>
                <a href="" className={styles.button} onClick={(e) => handleClickLogin(e)}>Sign In</a>
                <span className={styles.text}>New customer? <a className={styles.popoverLink} href="" onClick={(e) => handleClickRegister(e)}>Sign Up</a></span>
            </div>
        </Popover>
    );

    const logoutFunc = () => {
        logout();
        navigate(`${process.env.PUBLIC_URL}/`)
    }
    
    const popover2 = (
        <Popover id="popover-basic">
            <div className={styles.popover2}>
                <ul>
                    <li>
                        <span><b>Your Account</b></span>
                    </li>
                    <li>
                        <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/orders`)}}>Your Purchases</a>
                    </li>
                    {role == "Admin" ?
                    <>
                    <li>
                        <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/admin/products`)}}>View Products</a>
                    </li>
                    <li>
                        <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/admin/orders`)}}>View Orders</a>
                    </li>
                    <li>
                        <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/admin/users`)}}>View Users</a>
                    </li>
                    </>
                    : role == "Seller" ?
                    <>
                        <li>
                            <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/seller/products`)}}>Your Products</a>
                        </li>
                        <li>
                            <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/seller/orders`)}}>Your Orders</a>
                        </li>
                    </>
                    : role == "Courier" ?
                    <>
                        <li>
                            <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/courier/startdelivery`)}}>Start Delivery</a>
                        </li>
                        <li>
                            <a href="" onClick={(e) => {e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/admin/orders`)}}>View Orders</a>
                        </li>
                    </>
                    : null
                    }
                    <li>
                        <a onClick={logoutFunc}>Log Out</a>
                    </li>
                </ul>
            </div>
        </Popover>
    );

    if(!user){
        return (
            <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={popover}>
                <div className={styles.login}>
                    <img className={styles.loginImg} src={`${process.env.PUBLIC_URL}/images/header-account.png`}></img>
                    <div className={styles.loginDiv}>
                        <span className={styles.loginSpan}>Hello, Sign In</span>
                        <span className={styles.loginSpan2} href="">Account</span>
                    </div>        
                </div>
            </OverlayTrigger>
        )
    }else{

        let name = user.name;
        name = name.split(" ")[0];

        return (
            <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={popover2}>
                <div className={styles.login}>
                    <img className={styles.loginImg} src={`${process.env.PUBLIC_URL}/images/header-account.png`}></img>
                    <div className={styles.loginDiv}>
                        <span className={styles.loginSpan}>Hello, {name}</span>
                        <span className={styles.loginSpan2} href="">Account & Prime</span>
                    </div>        
                </div>
            </OverlayTrigger>
        )
    }

}

  
export {Account};
