import React,{useEffect, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/Context";
import api from "../../api";
import {Table, Button} from 'react-bootstrap';
import EditProductModal from '../../components/seller/EditProductModal';
import ProductModal from '../../components/ProductModal.jsx';
import AddressModal from '../../components/seller/AddressModal';
import PrepareItemModal from '../../components/PrepareItemModal';


const SellerOrdersPage = () => {
    const navigate = useNavigate();
    const {role, loaded} = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [selectedOrder,setSelectedOrder] = useState({products: []});
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [show3, setShow3] = useState(false);

    // If role of user is not 'Seller' redirects to the login page.
    useEffect(() => {
        if(role != "Seller" && loaded){
            navigate(`${process.env.PUBLIC_URL}/login`)
        }
    }, [role, loaded]);

    // Gets the seller orders and sets the hook value.
    useEffect(() => {
        api.getSellerOrders().then((res) => {
            setOrders(res.data.orders);
        });
    }, []);

    // Shows the ProductModal (showing products of the order)
    const handleClick = (order) => {
        setSelectedOrder(order); 
        setShow(true)
        setShow2(false);
    }

    // Shows the AddressModal (showing address of the order)
    const handleClick2 = (order) => {
        setSelectedOrder(order); 
        setShow2(true)
        setShow(false);
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

    const handleClick3 =(e,order) => {
        setSelectedOrder(order); 
        setShow3(true);
    }


    const setOrderItems = (order, items) => {
        const index = orders.indexOf(order);
        const arr = [...orders];
        order.cartItems = items;
        arr[index] = order;
        setOrders(arr);
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


    if(role == "Seller"){
        return (
            <div>
                <ProductModal 
                    products={selectedOrder.cartItems}
                    show={show}
                    setShow={setShow}
                />
                <AddressModal 
                    address={selectedOrder.address}
                    show={show2}
                    setShow={setShow2}
                />
                <PrepareItemModal
                    show={show3}
                    setShow={setShow3}
                    products={selectedOrder.cartItems}
                    order={selectedOrder}
                    setOrderItems={setOrderItems}
                />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Order Reference</th>
                        <th>Items</th>
                        <th>Address</th>
                        <th>Date</th>
                        <th>Phone</th>
                        <th>Price ($)</th>
                        <th>Payment Method</th>
                        {/* <th>Actions</th> */}
                        </tr>
                    </thead>
                    <tbody>
                    {
                        orders.map((order, index) => (
                            <tr key={index} style={{ backgroundColor: checkAnyStatus(order.cartItems, "Requested Return") ? '#ffedad' : checkAnyStatus(order.cartItems, "Returned") ? '#ffa3a3' : checkAllStatus(order.cartItems, "Delivered") ? '#73ba73'  : null}}>
                                <td>{index}</td>
                                <td>{order._id}</td>
                                <td><Button variant="secondary" onClick={() => handleClick(order)} >View</Button></td>
                                <td><Button variant="secondary" onClick={() => handleClick2(order)}>View</Button></td>
                                <td>{new Date(order.date).toLocaleDateString("en-GB") + " " + new Date(order.date).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</td>
                                <td>{order.phone}</td>
                                <td>{order.price}</td>
                                <td>{order.paymentMethod}</td>
                                {/* <td>
                                    {
                                        checkAnyReturning(order.cartItems) ?  
                                        <Button variant="warning" value={index} onClick={(e) => handleClick3(e, order)}>Prepare Pick Up</Button>
                                        :
                                        <span>-</span>
                                    }
                                </td> */}
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
            </div>
        )
    }else{
        return(null);
    }
}

export default SellerOrdersPage;