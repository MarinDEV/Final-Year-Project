/*
    A Modal showing a list of products. 
*/
import React,{useEffect, useState} from 'react';
import api from "../api";
import {Modal,Row,Col,Figure} from 'react-bootstrap';

//Bootstrap react
const ProductModal = (props) => {
    
    const [products,setProducts] = useState([]);

    // Sets the products hook with products from the database
    useEffect(() => {
        if(!props.products) return;
        if(props.products.length == 0) return;
        setProducts([]);
        const arr = [];
        props.products.forEach((product) => {
            arr.push({
                product: product.productId,
                quantity: product.quantity, 
                status: product.status
            });
        });
        api.getProductsByIds(arr).then((res) => {
           setProducts(res.data.products);
        });
    },[props.show == true]);
    
    if(!products){
        return null
    }else{
        if(products.length == 0){
            return null;
        }
        return(
            <Modal
                show={props.show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                onHide={() => {
                    props.setShow(false);
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Order details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        products.map((product, index) =>(
                            <Row key={index}>
                                <Col md={3}>
                                    <Figure>
                                        <Figure.Image
                                            width={100}
                                            height={100}
                                            alt="product image"
                                            src={product.media[0]}
                                        />
                                    </Figure>
                                </Col>
                                <Col md={4}>
                                    <h6 style={{textAlign: 'justify'}}>{product.name}</h6>
                                </Col>
                                <Col>
                                    <h6>x<span>{product.quantity}</span></h6>
                                </Col>
                                <Col>
                                {
                                    product.status == "Delivered" ?
                                    <h6 style={{color: 'green'}}>{product.status}</h6>
                                    : product.status == "Requested Return" ?
                                    <h6 style={{color: 'orange'}}>{product.status}</h6>
                                    : product.status == "Ready For Pickup" ?
                                    <h6 style={{color: 'orange'}}>{product.status}</h6>
                                    : product.status == "Picked Up" ?
                                    <h6 style={{color: 'orange'}}>{product.status}</h6>
                                    :
                                    <h6>{product.status}</h6>
                                }
                                </Col>
                                <Col>
                                    <h6>$ <span>{product.price * product.quantity}</span></h6>
                                </Col>
                            </Row>
                        ))
                    }
                </Modal.Body>
            </Modal>
        );
    }
}

export default ProductModal;