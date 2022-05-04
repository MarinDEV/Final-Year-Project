/*
    This is the page of all the purchases that the user has made.
*/

import api from "../api";
import {useNavigate} from "react-router-dom";
import {Table, Button} from "react-bootstrap";
import { AuthContext } from '../context/Context';
import ProductModal from '../components/ProductModal';
import ReturnItemModal from '../components/ReturnItemModal';
import React,{useContext, useEffect, useState} from 'react';

const OrdersPage = () => {

    const navigate = useNavigate();
    const { user, loaded } = useContext(AuthContext);
    const [orders, setOrders] = useState([]); // List of users purchased orders
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [products,setProducts] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState();

    /* 
        If the context had loaded and the user is null redirect to login
        Otherwise the user orders are retrieved from the database
    */
    useEffect(() => {
        if(user && loaded){
            api.getUserOrders(user.id).then((res) => {
                setOrders(res.data.orders);
            });
        }else if(loaded && !user){
            navigate(`${process.env.PUBLIC_URL}/login`)
        }
    },[user, loaded])

    // Shows the ordered products when the 'View' button is clicked
    const handleClick = (e)  => {
        setProducts(orders[e.target.value].cartItems);
        setShow(true);
    }

    // Checks if any of the orders has been delivered
    const checkAnyDelivered = (cartItems) => {
        let value = false;
        cartItems.forEach((item) => {
            if(item.status == "Delivered"){
                value = true;
            }
        });
        return value;
    }

    const handleClick2 = (e, order)  => {
        setProducts(orders[e.target.value].cartItems);
        setShow2(true);
        setSelectedOrder(order);
    }

    const setOrderItems = (order, items) => {
        const index = orders.indexOf(order);
        const arr = [...orders];
        order.cartItems = items;
        arr[index] = order;
        setOrders(arr);
    }   

    const checkAnyStatus = (cartItems, status) => {
        let value = false;
        cartItems.forEach((item) => {
            if(item.status == status){
                value = true;
            }
        });
        return value;
    }

    const checkAllStatus = (cartItems, status) => {
        let value = true;
        cartItems.forEach((item) => {
            if(item.status != status){
                value = false;
            }
        });
        return value;
    }

    const getDaysSince = (date) => {
        const differenceMilliseconds = new Date() - date;
        const days = Math.floor(differenceMilliseconds/(1000 * 60 * 60 * 24));
        return days<=30;
    }

    if(!user || !loaded) {
        return null
    }else{
        return (
            <div>
                <ProductModal
                    show={show}
                    setShow={setShow}
                    products={products}
                />
                <ReturnItemModal
                    show={show2}
                    setShow={setShow2}
                    products={products}
                    order={selectedOrder}
                    setOrderItems={setOrderItems}
                />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Order Reference</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Price</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr style={{ backgroundColor: checkAnyStatus(order.cartItems, "Requested Return") ? '#ffedad' : checkAnyStatus(order.cartItems, "Returned") ? '#ffa3a3' : checkAllStatus(order.cartItems, "Delivered") ? '#73ba73'  : null}}>
                                <td>{index}</td>
                                <td>{order._id}</td>
                                <td><Button variant="secondary" value={index} onClick={(e) => handleClick(e)}>View</Button></td>
                                <td>
                                {new Date(order.date).toLocaleDateString("en-GB") + " " + new Date(order.date).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                                </td>
                                <td>{`$${order.price}`}</td>
                                <td>
                                    {
                                        checkAnyDelivered(order.cartItems) && getDaysSince(new Date(order.date))?  
                                        <Button variant="warning" value={index} onClick={(e) => handleClick2(e, order)}>Return Item</Button>
                                        :
                                        <span>-</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default OrdersPage