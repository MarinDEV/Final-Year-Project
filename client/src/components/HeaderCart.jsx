/*
    The cart component of the header.
*/
import React, {useEffect, useState, useContext} from "react";
import api from "../api";
import styles from "../style/cart.module.css";
import {
    useNavigate
 } from "react-router-dom";
 import {AuthContext} from '../context/Context';


const Cart = (props) => {
    const navigate = useNavigate();

    const { cartCount, cartPrice } = useContext(AuthContext);

    // Redirects to cart page on click
    const handleClick = () => {
        navigate(`${process.env.PUBLIC_URL}/cart`)
    }

    // Deals with the cart price
    const renderCartPrice = () => {
        if(cartPrice){
            if(cartPrice<0){
                return "$0.00"
            }
            return `$${cartPrice.toFixed(2)}`;
        }else{
            return "$0.00";
        }
    }

    return(
        <a onClick={handleClick} className={styles.cart}>
            <div className={styles.cartChild}>
                <img src={`${process.env.PUBLIC_URL}/images/header-cart.svg`}></img>
                <span className={styles.cartCount}>{cartCount}</span>
            </div>
            <div className={styles.cartText}>
                <span className={styles.cartSpan}>My Cart</span>
                <span className={styles.cartSpan2}>
                {
                    renderCartPrice()
                }
                </span>
            </div>
        </a>
    )
}

export {Cart};