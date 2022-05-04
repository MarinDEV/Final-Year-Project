const express = require("express");
const axios = require("axios");
const dbo = require("../db/conn");
const { request } = require("express");

const ObjectId = require("mongodb").ObjectId;

const getOrders = async (req,res) => {
    let db_connect = dbo.getDb();
    const orders = [];
    await db_connect.collection("orders").find().sort({date: -1}).forEach((order) => {
        orders.push(order);
    });
    return res.json({orders: orders});
}

const changeOrderStatus = async (req,res) => {
    let db_connect = dbo.getDb();
    const orderId = new ObjectId(req.body.orderId);
    const status = req.body.status;
    await db_connect.collection("orders").updateOne({_id: orderId}, {$set: {status: status}});
    res.json({message: "success"});
}

const createDelivery = async (req,res) => {
    let db_connect = dbo.getDb();
    let orders = []
    await db_connect.collection("orders").find().sort({date: 1}).forEach((order) => {
        let newCartItems = [];
        const cartItems = order.cartItems;
        // Filters for orders that have status = "Ordered"
        cartItems.forEach((cartItem) => {
            if(cartItem.status == "Ordered"){
                newCartItems.push(cartItem);
            }
        });
        if(newCartItems.length == 0){
            return;
        }
        order.cartItems = newCartItems;
        orders.push(order);
    });

    let remainingCapacity = 2.0; // Assuming has 2m^3 usable space.
    let deliveryOrders = [];
    orders.forEach((order) => {
        // Case 1: Full order (All cart items at specified quantities)
        if(remainingCapacity <= 0.1 || deliveryOrders.length == 10){ 
            return;
        }
        if(order.dimensions <= remainingCapacity){
            deliveryOrders.push(order);
            remainingCapacity-=order.dimensions;
        }else{
            // Case 2: Partial Order
            let newCartItems = [];
            let totalDimensions = 0;
            let totalPrice = 0;
            order.cartItems.forEach((item) => {
                const quantity = item.quantity;
                let newItem;
                for(let i = quantity; i>0; i--){
                    const itemDimensions = i*item.unitDimensions;
                    const itemPrice = i*item.unitPrice;
                    if(itemDimensions <= remainingCapacity){   
                        newItem = item;
                        newItem.quantity = i;
                        totalDimensions+=itemDimensions;
                        remainingCapacity-=itemDimensions;
                        totalPrice+=itemPrice;
                        break;
                    }
                }
                if(newItem){
                    newCartItems.push(newItem);
                }
            });
            if(newCartItems.length != 0){
                order.cartItems = newCartItems;
                order.dimensions = totalDimensions;
                order.price = totalPrice;
                deliveryOrders.push(order);
            }
        }
    });

    // let newDeliveryOrders = [...deliveryOrders];
    // newDeliveryOrders.forEach((order) => order.cartItems.forEach((item) => console.log(item.unitPrice, item.quantity)));
    // console.log('')
    // let removedItems = [];
    // newDeliveryOrders.forEach((order) => {
    //     let cartItems = order.cartItems;
    //     cartItems.forEach((item1) => {
    //         cartItems.forEach((item2) => {
    //             if(item1.cartId.equals(item2.cartId)){
    //                 return;
    //             }
    //             if(!item1.productId.equals(item2.productId)) return;
    //             const newQuantity = item1.quantity + item2.quantity;
    //             const item1Index = cartItems.indexOf(item1);
    //             const item2Index = cartItems.indexOf(item2);
    //             item1.quantity = newQuantity;
    //             // cartItems[item1Index] = item1;
    //             // removedItems.push(cartItems[item2Index]);
    //             cartItems.splice(item2Index,1);
    //         });
    //     });
        
    // });
    // newDeliveryOrders.forEach((order) => order.cartItems.forEach((item) => console.log(item.unitPrice, item.quantity)));
    // console.log('')
    // removedItems.forEach((item) => console.log(item.cartId));

    await deliveryOrders.forEach( async (order) => {
        const id = order._id;
        const cartItems = order.cartItems;
        await db_connect.collection("orders").findOne({_id: id}).then((databaseOrder) => {
            const newCartItems = [];
            databaseOrder.cartItems.forEach((databaseItem) => {
                const item = cartItems.find((item) => item.cartId.equals(databaseItem.cartId));
                if(item){  
                    let newItem = databaseItem;
                    newItem.quantity = databaseItem.quantity - item.quantity;
                    newItem.cartId = new ObjectId();
                    item.status = "Picked Up";
                    if(newItem.quantity>0){
                        newCartItems.push(newItem);
                    }
                    newCartItems.push(item);
                }else{
                    newCartItems.push(databaseItem);
                }
            });
            db_connect.collection("orders").updateOne({_id: id}, {$set: {cartItems: newCartItems}});
        });
    })

    if(deliveryOrders.length == 0){
        return res.json({success: false});
    }

    await db_connect.collection("deliveries").insertOne({
        courier: new ObjectId(req.user),
        orders: deliveryOrders
    }, function (error, response) {
        if(error){
            console.log(error);
            return res.json({deliveryId: null, success: false});
            
        }else{
            return res.json({deliveryId: response.insertedId, success: true});
        }
    });
}

const getDeliveryDetails = async (req,res) => {
    const db_connect = dbo.getDb();
    const deliveryId = req.query.id;
    await db_connect.collection("deliveries").findOne({_id: new ObjectId(deliveryId)}).then((delivery) => {
        res.json({delivery: delivery});
    }).catch((err) => {
        res.json({delivery: {}});
    });
}

const completeDelivery = async (req,res) => {
    try{
        const db_connect = dbo.getDb();
        const userId = new ObjectId(req.user);
        await db_connect.collection("deliveries").deleteOne({courier: userId});
        res.json({deleted: true});
    }catch(err){
        console.log(err);
        res.json({deleted: false});
    }  
}


const getActiveDelivery = async (req,res) => {
    const db_connect = dbo.getDb();
    await db_connect.collection("deliveries").findOne({courier: new ObjectId(req.user)}).then((delivery) => {
        if(delivery){
            res.json({delivery: delivery});
        }else{
            res.json({});
        }
    }).catch((err) => {
        res.json({});
    });
}


const nextLocation = async (req,res) => {
    const courierId = new ObjectId(req.user);
    const db_connect = dbo.getDb();
    const orderId = new ObjectId(req.body.orderId);
    let order;
    let newOrdersList;
    await db_connect.collection("deliveries").findOne({courier: courierId}).then((delivery) => {
        if(delivery){
            newOrdersList = delivery.orders;
            let cartItems = []
            order = newOrdersList.find((order) => order._id.equals(orderId));
            const i = newOrdersList.indexOf(order);
            let totalDimensions = 0;
            newOrdersList[i].cartItems.forEach((item, index) => {
                item.status = "Delivered";
                cartItems[index] = item;
                totalDimensions+=item.dimensions;
            });
            newOrdersList[i].cartItems = cartItems;
            newOrdersList[i].dimensions = newOrdersList[i].dimensions - totalDimensions;
        }
    });
    if(!order || !newOrdersList){
        return res.json({});
    }
    await db_connect.collection("deliveries").updateOne({courier: courierId},{$set: {orders: newOrdersList}});

    const or = newOrdersList.find((o) => o._id == order._id);

    await db_connect.collection("orders").findOne({_id: orderId}).then((order) => {
        const addedIds = []
        order.cartItems.forEach((item) => {
            or.cartItems.forEach((i) => {
                if(addedIds.includes(item.cartId) || addedIds.includes(i.cartId)){
                    return;
                }
                if(i.cartId.equals(item.cartId)){
                    const index = order.cartItems.indexOf(item);
                    order.cartItems[index] = i;
                }
            });
        });
        db_connect.collection("orders").updateOne({_id: orderId}, {$set: {
            cartItems: order.cartItems
        }});
    });

    res.json({success: true})

}

const getMatrix = (req,res) => {
    url = req.query.url;
    var config = {
    method: 'get',
    url: url,
    headers: {}
    };
    // console.log(url);

    axios(config).then(function (response) {
        res.json(response.data);
    })
    .catch(function (error) {
    console.log(error);
    res.json({})
    });
}

module.exports = {
    getOrders,
    changeOrderStatus,
    createDelivery,
    getDeliveryDetails,
    getActiveDelivery,
    nextLocation,
    completeDelivery,
    getMatrix
}