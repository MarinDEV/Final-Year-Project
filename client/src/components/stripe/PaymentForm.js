
import {Elements, CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import React,{useState, useContext} from 'react';
import {Row,Col, Container, Form, Button, Alert, Modal} from 'react-bootstrap';
import styles from '../../style/pages/checkout.module.css';
import {useNavigate} from "react-router-dom";
import {AuthContext} from '../../context/Context';

import api from "../../api";

const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {}
    }
}

const PaymentForm = (props) => {

    const {setCart,setCartPrice} = useContext(AuthContext);

    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("Card");
    const [show,setShow] = useState(false);
    const [alertText, setAlertText] = useState('');
    const [show2,setShow2] = useState(false);
    const [alertText2, setAlertText2] = useState('');

    const [success, setSuccess] = useState();
    const [submitted, setSubmitted] = useState();
    const stripe = useStripe();
    const elements = useElements();

    // Handles paying and adding an order 
    const handleSubmit = async (e) => {
        e.preventDefault()

        const validCart = props.data.handleForm(); // Changes the form style if fields are unvalidated (handleform found on CheckoutPage.jsx)
        
        // Checks for card payment method
        if(paymentMethod == "Card"){
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: "card",
                card: elements.getElement(CardElement)
            })

            if(error) {
                setShow(true);
                setAlertText('Your card details are invalid!')
                return;
            }else{
                setShow(false);
            }

            if(props.data.address.address1 == '' 
                || props.data.address.address2 == '' 
                || props.data.address.postcode == '' 
                || props.data.phone == '' 
                || props.data.address.coordinates == null) {
                    return;
            }
            
            // Checks for errors on inputs
            if(!error) {
                setSubmitted(true);
                try {
                    const {id} = paymentMethod
                    const response = api.placeOrder({
                        amount: props.data.totalPrice, 
                        id, 
                        address: props.data.address, 
                        phone: props.data.phone,
                        method: "Card"
                    }).then((res) => {
                        setShow(false);
                        if(res.data.success == false) {
                            setAlertText2(res.data.message);
                            setShow2(true);
                            return;
                        }
                        setSuccess(true);
                        setCart(0);
                        setCartPrice(0);
                        const logoutTimer = setTimeout(() => {navigate("../orders")},1500);
                    });
                }catch (error) {
                    setSubmitted(false);
                    setSuccess(false);
                    setShow(true);
                    setAlertText('There was a problem with your payment method!')
                }
            }else{
                setSubmitted(false);
                setSuccess(false);
                setShow(true);
                setAlertText('Your card details are invalid!')
            }
        }else{ // Cash

            if(props.data.address.address1 == '' 
                || props.data.address.address2 == '' 
                || props.data.address.postcode == '' 
                || props.data.phone == '' 
                || props.data.address.coordinates == null) {
                    return;
            }
            setSubmitted(true);
            
            await api.placeOrder({
                amount: props.data.totalPrice, 
                address: props.data.address, 
                phone: props.data.phone,
                method: "Cash"
            }).then((res) => {
                console.log(res.data.success);
                if(res.data.success == false) {
                    setAlertText2(res.data.message);
                    setShow2(true);
                    return;
                }
                setSuccess(true);
                setCart(0);
                setCartPrice(0);
                const logoutTimer = setTimeout(() => {navigate("../orders")},1500);
            })
        }
    }

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
        if(e.target.value == "Cash"){
            setShow(false);
        }
    }


    return (
        <>
            <Modal show={show2} onHide={() => setShow2(false)}>
                <Modal.Header>
                    <Modal.Title>Items no longer available</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{textAlign: 'left'}}>
                    {alertText2}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShow2(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {!success ?
            <div className={styles.paymentForm}>
                {show ?
                    <Alert style={{height: '50px', padding: '12px' }} variant="danger" onClose={() => setShow(false)}>
                        <p>{alertText}</p>
                    </Alert>
                : null
                }
                <Form.Select size="sm" className={styles.paymentSelect} onChange={(e) => handlePaymentChange(e)}>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                </Form.Select>
                <>
                    {(paymentMethod == "Card") ?
                    <CardElement required options={CARD_OPTIONS} className={styles.paymentCard}/>
                    : <div></div>
}
                </>
                <Button disabled={submitted} onClick={handleSubmit} className={styles.paymentButton}>Pay & Order</Button>
            </div>
            :
            <div>
                <h5>Your order was placed! Redirecting...</h5>
            </div>
            }
        </>
    )
}

export default PaymentForm;