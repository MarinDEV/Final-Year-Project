import React,{useEffect, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/Context";
import api from "../../api";
import {Table, Button} from 'react-bootstrap';
import EditProductModal from '../../components/seller/EditProductModal';
import ProductModal from '../../components/ProductModal.jsx';
import AddressModal from '../../components/seller/AddressModal';
import ChangeStatusModal from '../../components/admin/ChangeStatusModal';
import DeleteOrderModal from '../../components/admin/DeleteOrderModal';


const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const {role, loaded} = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [show3, setShow3] = useState(false);
    const [show4, setShow4] = useState(false);

    // Redirects to main page if user is not an Admin or Courier
    useEffect(() => {
        if(role != "Admin" && role != "Courier" && loaded){
            navigate(`${process.env.PUBLIC_URL}/`)
        }
    }, [role, loaded]);

    // Gets all the orders
    useEffect(() => {
        api.getOrders().then((res) => {
            setOrders(res.data.orders);
        });
    }, []);

    // Shows order products
    const handleClick = (order) => {
        setSelectedOrder(order); 
        setShow(true)
    }

    // Shows order address
    const handleClick2 = (order) => {
        setSelectedOrder(order); 
        setShow2(true)
    }

    const handleClick3 = (order) => {
        setSelectedOrder(order); 
        setShow3(true)
    }

    const handleClick4 = (order) => {
        setSelectedOrder(order); 
        setShow4(true)
    }

    const setOrderItems = (order, items) => {
        const index = orders.indexOf(order);
        const arr = [...orders];
        order.cartItems = items;
        arr[index] = order;
        setOrders(arr);
    }   

    const removeOrder = (order) => {
        const arr = orders.filter((o) => o != order);
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


    if(role == "Admin" || role == "Courier"){
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
                    showmap={'true'}
                />
                <ChangeStatusModal 
                    products={selectedOrder.cartItems}
                    show={show3}
                    setShow={setShow3}
                    order={selectedOrder}
                    setOrderItems={setOrderItems}
                />
                <DeleteOrderModal
                    show={show4}
                    order={selectedOrder}
                    setShow={setShow4}
                    removeOrder={removeOrder}
                />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Items</th>
                            <th>Address</th>
                            <th>Order Reference</th>
                            <th>Date</th>
                            <th>Phone</th>
                            <th>Payment Method</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        orders.map((order, index) => (
                            <tr key={index} style={{ backgroundColor: checkAnyStatus(order.cartItems, "Requested Return") ? '#ffedad' : checkAnyStatus(order.cartItems, "Returned") ? '#ffa3a3' : checkAllStatus(order.cartItems, "Delivered") ? '#73ba73'  : null}}>
                                <td>{index}</td>
                                <td><Button variant="secondary" onClick={() => handleClick(order)} >View</Button></td>
                                <td><Button variant="secondary" onClick={() => handleClick2(order)}>View</Button></td>
                                <td>{order._id}</td>
                                <td>{new Date(order.date).toLocaleDateString("en-GB") + " " + new Date(order.date).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</td>
                                <td>{order.phone}</td>
                                <td>{order.paymentMethod}</td>
                                <td>
                                    <Button style={{marginLeft: 5, marginRight: 5}} variant="warning" onClick={() => handleClick3(order)}>Change Status</Button>
                                    {
                                    role == "Admin" ?
                                        <Button style={{marginLeft: 5, marginRight: 5}} variant="danger" onClick={() => handleClick4(order)}>Delete</Button>
                                    :
                                    null
                                    }
                                </td>
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

export default AdminOrdersPage;