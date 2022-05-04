import React from "react";
import { useEffect, useContext, useState } from "react";
import styles from "../style/pages/cart.module.css";
import api from "../api";
import {Row,Col,Image, Container, Card, Button} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";
import Cart from "../components/Cart";
import {AuthContext} from "../context/Context";

const CartPage = () => {
    
    const navigate = useNavigate();
    const [products, setProducts] = useState();
    const [totalPrice, setTotalPrice] = useState(0);

    const { user, loaded } = useContext(AuthContext);

    // Redirects to login page if the user is not logged in
    useEffect(() => {
        if(!user && loaded){
            navigate(`${process.env.PUBLIC_URL}/login`);
        }
    }, [user, loaded]);

    // When the page renders, gets all the cart items and stores them in the products variable
    useEffect(() => {
        api.getCartItems().then((res) => {
            setProducts(res.data.cart);
        });
    }, []);
    
    // Updates total price of the cart when an item is removed.
    useEffect(() => {
        if(!products) return;
        let price = 0.00;
        products.forEach((product) => {
            price += product.price * product.quantity;
        });
        setTotalPrice(price.toFixed(2));
    },[products]);

    // Method used by the Cart child component
    const handleProducts = (products) => {
        setProducts(products);
    }

    // Navigate to checkout page
    const checkOut = () => {
        navigate(`${process.env.PUBLIC_URL}/checkout`)
    }

    if(products){
        if(products.length == 0){
            return(
                <div style={{width: 300, margin: 'auto'}}>
                    <section className={styles.topDiv} style={{textAlign: 'center'}}>
                        <span style={{margin: 'auto', width: '100%'}}>Your cart is empty</span>
                    </section>
                </div>
            )
        }else{
            return (
                <div className={styles.container}>
                    <section className={styles.topDiv}>
                        <span><b>Total Price:</b> ${totalPrice}</span>
                        <Button variant="success" className={styles.a} onClick={checkOut}>Checkout</Button>
                    </section>
                    <Cart handleProducts={handleProducts}></Cart>
                </div>
            )
        }
    }else{
        return (null);
    }
}

export default CartPage;
