/*
    A Modal showing a list of products. 
*/
import React,{useEffect, useState} from 'react';
import api from "../../api";
import {Modal,Row,Col,Figure, Form, Button} from 'react-bootstrap';

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
                status: product.status,
                cartId: product.cartId,
                seller: product.seller
            });
        });
        api.getProductsByIds(arr).then((res) => {
           setProducts(res.data.products);
        });
    },[props.show == true]);

    const changeProductStatus = (e, product) => {
        let arr = [...products];
        const index = arr.indexOf(product);
        product.status = e.target.value;
        arr[index] = product;
        setProducts(arr);
    }

    const handleStatusChange = () => {
        api.updateOrderStatus({order: props.order, products}).then((res) => {
            props.setOrderItems(props.order,res.data.cartItems);
        });
        props.setShow(false);
    }
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
                                <Col md={1}>
                                    <h6>x<span>{product.quantity}</span></h6>
                                </Col>
                                <Col>
                                    <Form.Select defaultValue={product.status} onChange={(e) => changeProductStatus(e,product)}>
                                        <option value={"Ordered"}>Ordered</option>
                                        <option value={"Picked Up"}>Picked Up</option>
                                        <option value={"Delivered"}>Delivered</option>
                                        <option value={"Requested Return"}>Requested Return</option>
                                        {/* <option value={"Ready For Pickup"}>Ready For Pickup</option> */}
                                        <option value={"Returned"}>Returned</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        ))
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick={() => handleStatusChange()}> Change </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default ProductModal;