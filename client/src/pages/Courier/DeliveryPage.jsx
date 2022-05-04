import {Button, Accordion, Table, Form} from 'react-bootstrap';
import api from '../../api';
import {useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState, useContext} from 'react';
import {AuthContext} from "../../context/Context";
import DeliveryMap from '../../components/DeliveryMap';
import ProductModal from '../../components/ProductModal.jsx'
import AddressModal from '../../components/seller/AddressModal.jsx'

const DeliveryPage = () => {
    const navigate = useNavigate();
    const {deliveryId} = useParams(); // Get the deliveryId from url parameters.
    const [orders, setOrders] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const {role, loaded} = useContext(AuthContext);

    useEffect(() => {
        if(role != "Courier" && loaded){
            navigate(`${process.env.PUBLIC_URL}/`)
        }
    }, [role, loaded]);
    
    useEffect(() => {
        api.getDeliveryDetails({deliveryId}).then((res) => {
            try{
                const filteredOrders = filterOrders(res.data.delivery.orders);
                if(filteredOrders.length == 0){
                    navigate(`${process.env.PUBLIC_URL}/courier/startdelivery`);
                }
            }catch(err){
                navigate(`${process.env.PUBLIC_URL}/courier/startdelivery`);
            }
        });
    }, [deliveryId]);

    const filterOrders = (currentOrders) => {
         const updatedOrders = [];
         currentOrders.forEach((order) => {
            const _id = order._id;
            const coordinates = order.address.coordinates;
            let isDelivered = true;
            order.cartItems.forEach((cartItem) => {
                if(cartItem.status != 'Delivered'){ 
                    isDelivered = false; 
                }
            });
            if(!isDelivered){
                updatedOrders.push(order);
            }
        });
        setOrders(updatedOrders);
        return updatedOrders;
    }

    const reorder = (reordered) => {
        const updatedOrders = [];
        reordered.forEach((mapOrder) => {
            const order = orders.find((order) => order._id == mapOrder.orderId);
            updatedOrders[parseInt(mapOrder.order)] = order;
        });
        setOrders(updatedOrders);
    }

    const removeOrder = (orderId) => {
        const order = orders.find((order) => order._id == orderId);
        const index = orders.indexOf(order);
        const updatedOrders = [...orders];
        updatedOrders.splice(index, 1);
        setOrders(updatedOrders);
    }

    if(orders.length == 0) return null;

    if(role == "Courier"){
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
                <Accordion defaultActiveKey="0">
                {   
                    orders.map((order, index) => (
                            <Accordion.Item eventKey={index}>
                                <Accordion.Header>
                                    <span>
                                        Order {index}
                                    </span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                            <th>#</th>
                                            <th>Product ID</th>
                                            <th>Quantity</th>
                                            <th>Total Price</th>
                                            <th>Payment Method</th>
                                            <th><Button variant="secondary" onClick={
                                                () => {
                                                    setSelectedOrder(order);
                                                    setShow(true);
                                                }
                                            }>View Products</Button></th>
                                            {/* <th><Button variant="secondary" onClick={
                                                () => {
                                                    setSelectedOrder(order);
                                                    setShow2(true);
                                                }
                                            }>View Address</Button></th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                order.cartItems.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{i}</td>
                                                        <td>{item.productId}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.unitPrice * item.quantity}</td>
                                                        <td>{order.paymentMethod}</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </Accordion.Body>
                            </Accordion.Item> 
                    ))
                }
                </Accordion>
                <DeliveryMap
                    allowClicks={false} 
                    center={{lat: 41.32071385631274, lng: 19.805243783277295}}
                    orders={orders}
                    reorder={reorder}
                    filterOrders={filterOrders}
                    removeOrder={removeOrder}
                    // removeFirstOrder={removeFirstOrder}
                />
            </div>
        )
    }else{
        return null;
    }
}

export default DeliveryPage;