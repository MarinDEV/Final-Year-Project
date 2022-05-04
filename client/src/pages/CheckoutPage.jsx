import React from "react";
import { useEffect, useContext, useState } from "react";
import {useNavigate} from "react-router-dom";
import {Row,Col, Container, Form, Button} from 'react-bootstrap';
import styles from '../style/pages/checkout.module.css'
import api from "../api";
import Cart from "../components/Cart";
import Map from '../components/Map';
import {AuthContext} from '../context/Context';

import PaymentForm from "../components/stripe/PaymentForm";
import StripeContainer from "../components/stripe/StripeContainer";


const CheckoutPage = (props) => {

    const navigate = useNavigate();
    const [products, setProducts] = useState();
    const [totalPrice, setTotalPrice] = useState(0);
    const [addressOne, setAddressOne] = useState('');
    const [addressTwo, setAddressTwo] = useState('');
    const [city, setCity] = useState('Tirana');
    const [postcode, setPostcode] = useState('');
    const [phone, setPhone] = useState('');
    const [coordinates, setCoordinates] = useState(null);

    const { user, loaded } = useContext(AuthContext);

    const [addressOneStyle, setAddressOneStyle] = useState();
    const [addressTwoStyle, setAddressTwoStyle] = useState();
    const [cordsTextStyle, setCordsTextStyle] = useState({color: 'rgb(110,117,124)'});
    const [postcodeStyle, setPostcodeStyle] = useState();
    const [phoneStyle, setPhoneStyle] = useState();

    // Handles form style on validation (red borders for inputs that fail validation)
    const handleForm = () => {
        const  style = {
            border: '1px solid #ff6b6b',
        }

        if(!coordinates){
            setCordsTextStyle({color: 'red'})
        }else{
            setCordsTextStyle({color: 'rgb(110,117,124)'})
        }
        
        if(addressOne == ''){
            setAddressOneStyle(style);
        }else{
            setAddressOneStyle({});
        }

        if(addressTwo == ''){
            setAddressTwoStyle(style);
        }else{
            setAddressTwoStyle({})
        }

        if(postcode == ''){
            setPostcodeStyle(style)
        }else{
            setPostcodeStyle({})
        }

        if(phone == ''){
            setPhoneStyle(style)
        }else{
            setPhoneStyle({})
        }
    }
    
    // Redirects to the login page if the user is not logged in
    useEffect(() => {
        if(!user && loaded){
            navigate(`${process.env.PUBLIC_URL}/login`);
        }else if(user && loaded){
            api.getCartItems().then((res) => {
                if(res.data.cart.length == 0 ){
                    navigate(`${process.env.PUBLIC_URL}/cart`)
                }else{
                    setProducts(res.data.cart);
                }
            });
        }
    }, [user, loaded]);

    // Sets total price when the products are loaded.
    useEffect(() => {
        if(!products) return;
        let price = 0.00;
        products.forEach((product) => {
            price += product.price * product.quantity;
        });
        setTotalPrice(price.toFixed(2));
    },[products]);

    // Sets the coordinates
    const setPosition = (coord) => {
        setCoordinates(coord);
    }
    
    // Sets hooks values of the specific inputs
    
    const handleAddressOne = (e) => {
        setAddressOne(e.target.value);
    }
    const handleAddressTwo= (e) => {
        setAddressTwo(e.target.value);
    }
    const handlePostcode = (e) => {
        setPostcode(e.target.value);
    }

    const handleCity = (e) => {
        setCity(e.target.value);
    }

    const handlePhone = (e) => {
        setPhone(e.target.value);
    }


    if(user && products){
        if(products.length>0){
            return (
                <Form className={styles.containerDiv}>
                    <section className={styles.mainDiv}>
                        <Container className={styles.addressContainer}>
                            <h3>Delivery Address</h3>
                            <Form.Group>
                                <Form.Control 
                                    required 
                                    className={styles.addressLine} 
                                    type="text" 
                                    placeholder="Address Line 1" 
                                    value={addressOne}
                                    onChange={handleAddressOne}
                                    style={addressOneStyle}
                                /><br></br>
                                <Form.Control 
                                    required 
                                    className={styles.addressLine} 
                                    type="text" 
                                    placeholder="Address Line 2" 
                                    value={addressTwo}
                                    onChange={handleAddressTwo}
                                    style={addressTwoStyle}
                                /><br></br>
                                <Form.Select onChange={handleCity}>
                                    <option value="Tirana">Tirana</option>
                                </Form.Select>
                                <Form.Control 
                                    required 
                                    className={styles.postcode} 
                                    type="text" 
                                    placeholder="Postcode"
                                    value={postcode}
                                    onChange={handlePostcode}
                                    style={postcodeStyle}
                                /><br></br>
                                <Form.Control 
                                    required 
                                    className={styles.addressLine} 
                                    type="text" 
                                    placeholder="Phone Number" 
                                    value={phone}
                                    onChange={handlePhone}
                                    style={phoneStyle}
                                /><br></br>
                            </Form.Group>
                            <span style={cordsTextStyle}>Place a pin at your address</span>
                            <div style={{marginTop: 10}}>
                                <Map setPosition={setPosition}/>
                            </div>
                        </Container>
                        <Container className={styles.paymentContainer}>
                            <h3>Payment</h3>
                            <StripeContainer 
                                address = {{
                                    address1: addressOne,
                                    address2: addressTwo,
                                    city: city,
                                    postcode: postcode,
                                    coordinates: coordinates
                                }}
                                phone={phone}
                                totalPrice={totalPrice}
                                handleForm={handleForm}
                            />
                        </Container>
                    </section>
                </Form>
            )
        }else{
            return(null)
        }
    }else{
        return(null);
    }
}

export default CheckoutPage;