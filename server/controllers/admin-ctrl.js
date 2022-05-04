const express = require("express");
const dbo = require("../db/conn");
const { request } = require("express");

const ObjectId = require("mongodb").ObjectId;

const getUsers = async (req,res) => {
    let db_connect = dbo.getDb();
    const admin = req.user;
    let users = []
    await db_connect.collection("users").find().forEach((user) => {
        if(!user._id.equals(new ObjectId(admin))){
            users.push(user);
        }
    });
    res.json({users: users});
}

const setUserRole = async (req,res) => {
    let db_connect = dbo.getDb();
    const role = req.body.role;
    const userId = new ObjectId(req.body.id);

    try{
        await db_connect.collection("users").updateOne({_id: userId},{ $set: {role: role}}, () => {
            return res.json({message: 'success'});
        });
    }catch(err){
        return res.json({message: 'fail'});
    }
}

const deleteUser = async (req,res) => {
    let db_connect = dbo.getDb();
    const userId = new ObjectId(req.query.id);
    try{
        await db_connect.collection("users").deleteOne({_id: userId}, () => {
            return res.json({message: 'success'});
        });
    }catch(err){
        return res.json({message: 'fail'});
    }
}

const getProducts = async (req,res) => {
    let db_connect = dbo.getDb();
    try {
        let arr = []
        await db_connect.collection("products").find().forEach((product) => {
            arr.push(product);
        });
        res.json({products: arr});
    }catch(err){
        res.json({products: []});
    }
}

const setOrderStatus = async (req,res) => {
    const order = req.body.order;
    const user = req.user;
    const updatedProducts = req.body.products;
    let db_connect = dbo.getDb();

    const newCartItems = [];
    const updatedIds = []
    order.cartItems.forEach((item) => {
        updatedProducts.forEach((product) => {
            if(updatedIds.includes(item.cartId)) return;
            if(item.cartId == product.cartId){
                newCartItems.push({
                    cartId: new ObjectId(item.cartId), 
                    productId: new ObjectId(item.productId), 
                    quantity: item.quantity, 
                    seller: new ObjectId(item.seller),
                    unitDimensions: item.unitDimensions,
                    unitPrice: item.unitPrice,
                    status: product.status
                })
                updatedIds.push(item.cartId);
            }
        });
    });
    await db_connect.collection("orders").updateOne({_id: new ObjectId(order._id)}, {$set: {
        cartItems: newCartItems
    }});
    return res.json({success: true, cartItems: newCartItems});
}

const deleteOrder = async (req,res) => {
    let db_connect = dbo.getDb();
    const orderId = new ObjectId(req.query.id);
    try{
        await db_connect.collection("orders").deleteOne({_id: orderId}, () => {
            return res.json({message: 'success'});
        });
    }catch(err){
        return res.json({message: 'fail'});
    }
}

const setStatus = async (req,res) => {
    let db_connect = dbo.getDb();
    const productId = new ObjectId(req.body.productId);
    const status = req.body.status;
    await db_connect.collection("products").updateOne({_id: productId}, {$set: {status: status}});
    res.json({message: 'success'});
}

module.exports = {
    getUsers,
    setUserRole,
    deleteUser,
    getProducts,
    setOrderStatus,
    deleteOrder,
    setStatus
}