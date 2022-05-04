import api from "../api";
import { AuthContext } from '../context/Context';
import { useParams, useNavigate } from "react-router-dom";
import styles from "../style/pages/productPage.module.css";
import React, { useEffect, useContext, useState } from "react";
import {Row,Col,Image, Container, Card, Button, Form, Popover, OverlayTrigger, Alert} from 'react-bootstrap';

function ProductPage() {

    const navigate = useNavigate();
    const { user, loaded, setCart, cartCount, setCartPrice, cartPrice} = useContext(AuthContext);
    const {id} = useParams(); // Product id extracted from url
    const [mainImage, setMainImage] = useState(); // Main product image
    const [product,setProduct] = useState(); // Product
    const [quantity,setQuantity] = useState(1); // Quantity of the product that the buyer chooses
    const [cartMax, setCartMax] = useState(null);

    // Gets product by id and updates the relevant hooks
    useEffect(async () => {
        await api.getProduct(id).then((res) => {
            if(!res.data.product){
                navigate(`${process.env.PUBLIC_URL}/`);
            }else{
                setProduct(res.data.product);
                setMainImage(res.data.product.media[0]);
            }
        });
    },[]);

    // The method run when the user clicks the add product button 
    const handleClick = () => {
        if(!user && loaded){
            navigate(`${process.env.PUBLIC_URL}/login`);
            return;
        }
        if(cartCount == 10){
            setCartMax(true);
            return;
        }
        setCartMax(false);
        api.addCart({id: id, quantity: quantity, seller: product.seller, unitDimensions: product.dimensions, unitPrice: product.price}).then((res) => {
            setCart(cartCount+1);
            setCartPrice(cartPrice + (product.price * quantity));
        }).catch((err) => {
            navigate(`${process.env.PUBLIC_URL}/login`);
        });
    }

    // Changes the main image to the selected image
    const changeImage = (e) => {
        setMainImage(e.target.src);
    }

    if(product){
        return (
        <section className={styles.mainDiv}>
            <article className={styles.card}>
                <img className={styles.mainImage} src={mainImage}/>
                <ul className={styles.allMedia}>
                    {product.media.filter((media) => media != null).map((img, index) => (
                        <li key={index}>
                            <img src={img} onClick={(e) => changeImage(e)}></img>
                        </li>
                    ))}
                </ul>
            </article>
            <article className={styles.card}>
                <div className={styles.titleRow}>
                    <h5>{product.name}</h5>
                </div>
                <div className={styles.descRow}>
                    <p>{product.description}</p>
                </div>
                <div className={styles.checkoutRow}>
                    {
                        cartMax == null ?
                        null
                        :
                        cartMax == false ?
                        <Alert>
                            <span>Cart updated:</span><a href="" onClick={ (e) =>{ e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/cart`)}}>View</a>
                        </Alert>
                        :
                        <Alert variant='danger'>
                            <span>Maximum Cart Size Reached</span><a href="" onClick={ (e) =>{ e.preventDefault(); navigate(`${process.env.PUBLIC_URL}/cart`)}}>View</a>
                        </Alert>
                    }
                    {
                        parseInt(product.stock)>0 ?
                        <>
                            <span><b>$</b>{(product.price * quantity).toFixed(2)}</span>
                            <Button variant="success" className={styles.button} onClick={(e) => handleClick(e, product._id)}>Add to Cart</Button>
                            <Form.Select name="quantity" className={styles.select} id="quantity" onChange={(e) => setQuantity(parseInt(e.target.value))}>
                                {   
                                    parseInt(product.stock)>0 ?
                                        Array.from(Array(parseInt(product.stock)).splice(0,10), (error, i) => {
                                            return(<option value={i+1}>{i+1}</option>)
                                        })
                                    : 
                                        Array.from(Array(parseInt(0)), (error, i) => {
                                            if(i == 0) return;
                                            return(<option value={i}>{i}</option>)
                                        })
                                }
                            </Form.Select>
                        </>
                        :
                        <>
                            <Button disabled variant='secondary'>Out of stock</Button>
                        </>
                    }
                </div>
            </article>
        </section>
        );
    }else{
        return null;
    }
  }
  
  export default ProductPage;