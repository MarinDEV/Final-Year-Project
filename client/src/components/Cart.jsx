/*
    The cart component that shows all the cart elements for the user.
*/
import React from "react";
import { useEffect, useContext } from "react";
import styles from "../style/pages/cart.module.css";
import api from "../api";
import {Row,Col,Image, Container, Card, Button} from 'react-bootstrap';
import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { AuthContext } from '../context/Context';

const Cart = (props) => {
    
    const navigate = useNavigate();
    const [products, setProducts] = useState();
    const [totalPrice, setTotalPrice] = useState(0);

    const { user, loaded, cartCount, setCart, cartPrice, setCartPrice } = useContext(AuthContext);

    // Gets the cart elements from the database when the component loads
    useEffect(() => {
        api.getCartItems().then((res) => {
            setProducts(res.data.cart);
        });
    }, []);

    // Removes an item from the database and from the cart list
    const handleClick = (e) => {
        let arr2 = [...products];
        const arr3 = arr2.filter(function (el) {
            return el.cartId != e.target.value;
        })
        const prod = products.find((el) => el.cartId == e.target.value);

        api.removeCartItem({cartId: e.target.value}).then(() => {
            setCart(cartCount -1)
            setCartPrice(cartPrice - (prod.price * prod.quantity));
        });
        setProducts(arr3);
        props.handleProducts(arr3)
    };

    if(products == [] || products == null){
        return (null);
    }else{
        return (
            <div className={styles.container}>
                <section className={styles.mainDiv}>
                    {products.map((product, index) => (
                        <article key={index} className={styles.card}>
                            <a className={styles.imageRow}>
                                <img src={product.media[0]}/>
                            </a>
                            <article className={styles.content}>
                                <div className={styles.titleRow}>
                                    <h5>{product.name.replace(/(.{50})..+/, "$1…")}</h5>
                                </div>
                                <div className={styles.quantityRow}>
                                    <h6><b>Quantity:</b> {product.quantity}</h6>
                                </div>
                                <div className={styles.priceRow}>
                                    <h6><b>$</b>{(product.price * product.quantity).toFixed(2)}</h6>
                                </div>
                                <div className={styles.buttonRow}>
                                    <Button variant="danger" className={styles.button} value={product.cartId} onClick={(e) => handleClick(e)}>Remove</Button>
                                </div>
                            </article>
                        </article>
                    ))}
                </section>
            </div>
        )
    }
}

export default Cart;
