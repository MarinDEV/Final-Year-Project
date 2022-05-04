import api from "../api";
import React from "react";
import { useState, useEffect } from "react";
import styles from "../style/pages/searchPage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import {Row,Col,Image, Container, Card, Button} from 'react-bootstrap';

function SearchPage() {
    const navigate = useNavigate(); 
    const {term,category} = useParams(); // Get the term and category from url parameters.
    const [products,setProducts] = useState([]); // List of the products to be displayed.

    /*
        This hook is run when the term or category are loaded.
        The api.getProducts method extracts from the database the products 
        whose name match the term and are in the selected category.
    */
    useEffect(() => {
        api.getProducts(term, category).then((res)=>{
            setProducts(res.data.products);
        });
    },[term,category]);

    /* Navigates the user to the specific product page when that product is clicked */
    const handleClick = (e, productId) => {
        e.preventDefault();
        navigate(`${process.env.PUBLIC_URL}/product/${productId}`);
    }

    return (
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
    );
  }
  
  export default SearchPage;