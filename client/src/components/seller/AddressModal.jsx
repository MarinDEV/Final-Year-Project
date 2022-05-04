/*
    A popup Modal that displays an address
 */
import React,{useEffect, useState} from 'react';
import api from "../../api";
import {Modal,Row,Col,Figure} from 'react-bootstrap';
import Map from '../../components/Map';

//Bootstrap react
const AddressModal = (props) => {
    
    const [address,setAddress] = useState({
        address1: '',
        address2: '',
        city: 'Tirana',
        phone: ''
    });

    // Sets the address hook to the one passed by parent
    useEffect(() => {
        if(!props.address) return;
        setAddress(props.address);
    },[props.show]);

    
    if(!props.address){return null}else{
            return(
        <Modal
            show={props.show}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            onHide={() => props.setShow(false)}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Order details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><b>Address Line 1:</b> {address.address1}</p>
                <p><b>Address Line 2:</b> {address.address2}</p>
                <p><b>City:</b> {address.city}</p>
                {
                    props.showmap  == 'true' && props.address.coordinates ? 
                    <Map allowClicks={false} center={{lat: props.address.coordinates.lat, lng: props.address.coordinates.lng}}/>
                    :
                    <></>
                }
            </Modal.Body>
        </Modal>
    );
    }
}

export default AddressModal;