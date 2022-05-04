import React, {useEffect, useContext, useState} from "react";
import api from "../api";
import { AuthContext } from '../context/Context';
import styles from "../style/pages/searchPage.module.css";
import {Button, Alert} from 'react-bootstrap';
import {FooterComponent} from '../components/FooterComponent';
import {
    useNavigate
 } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();
  const { user, cartCount } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  // Gets a list of featured products from the database (products with featured = true)
  useEffect(async () => {
    let arr = await api.getFeaturedProducts().then((res) => {
      setProducts(res.data.products);
    });
  },[]);

  // Called when user clicks on one of the products
  const handleClick = (e, productId) => {
      e.preventDefault();
      navigate(`${process.env.PUBLIC_URL}/product/${productId}`);
  }

  return (
    <div>
      <img style={{width: '100%'}} src={`${process.env.PUBLIC_URL}/images/slideshow.png`}/>
      <h1 style={{fontSize: '30px', fontWeight: 400, paddingTop: '20px', marginTop: '20px'}}>Featured Products</h1>
      <section className={styles.mainDiv}>
            {products.map((product, index) => (
                <article key={index} className={styles.card}>
                    <a href="" onClick={(e) => handleClick(e, product._id)} className={styles.imageRow}>
                        <img src={product.media[0]}/>
                    </a>
                    <article className={styles.content}>
                        <div className={styles.titleRow}>
                            <h5>{product.name.replace(/(.{50})..+/, "$1…")}</h5>
                        </div>
                        <div className={styles.priceRow}>
                            <h6><b>$</b>{product.price}</h6>
                        </div>
                        <div className={styles.buttonRow}>
                            <Button className={styles.button} onClick={(e) => handleClick(e, product._id)}>View</Button>
                        </div>
                    </article>
                </article>
            ))}
        </section>
        <FooterComponent />
    </div>
  );
}

export default MainPage;