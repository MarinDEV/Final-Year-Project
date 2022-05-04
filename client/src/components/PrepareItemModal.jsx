/*
    
*/
import React,{useEffect, useState} from 'react';
import api from "../api";
import {Modal,Row,Col,Figure, Form, Button} from 'react-bootstrap';

//Bootstrap react
const PrepareItemModal = (props) => {
    
    const [products,setProducts] = useState([]);
    const [checkedProducts, setCheckedProducts] = useState([]);

    // Sets the products hook with products from the database
    useEffect(async () => {
        if(!props.products) return;
        if(props.products.length == 0) return;
        setProducts([]);
        const arr = [];
        props.products.forEach((product) => {
            arr.push({
                cartId: product.cartId,
                product: product.productId,
                quantity: product.quantity, 
                status: product.status
            });
        });
        await api.getProductsByIds(arr).then((res) => {
           setProducts(res.data.products);
        });
    },[props.show == true]);


    const handleCheck = (e,product) => {
        if(e.target.checked){
            const arr = [...checkedProducts];
            arr.push(product);
            setCheckedProducts(arr);
        }else{
            let arr = checkedProducts.filter((p) => p != product);
            setCheckedProducts(arr);
        }
    }

    const handleReadyItems = () => {
        api.readyItems({order: props.order, checkedProducts}).then((res) => {
            props.setOrderItems(props.order, res.data.cartItems);
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
                        products.filter((product) => (product.status == "Requested Return")).map((product, index) =>(
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
                                <Col md={5}>
                                    <h6 style={{textAlign: 'justify'}}>{product.name}</h6>
                                </Col>
                                <Col>
                                    <h6>x<span>{product.quantity}</span></h6>
                                </Col>
                                <Col>
                                {
                                    <Form.Check
                                        onClick={(e) => handleCheck(e, product)}
                                        style={{width: 20}} 
                                        type={'checkbox'}
                                    />
                                }
                                </Col>
                            </Row>
                        ))
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick = {() => handleReadyItems()}>Ready Items</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default PrepareItemModal;