import React from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";

// The testing mode public key
const PUBLIC_KEY = "pk_test_51Ko8ohFvsFi6wWRH0vILV3hW3e0S4fpyrUX7IEynK7ooWVyXqPQ2Gf2l875a3gSoOmwSayLaspIfuLjmq08hUC7N00Y8arKPkO";
const stripePromise = loadStripe(PUBLIC_KEY); 

const StripeContainer = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm data={props}/>
        </Elements>
    )
}

export default StripeContainer;