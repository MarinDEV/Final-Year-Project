const express = require("express");
const dbo = require("../db/conn");
const { request } = require("express");


// Convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

const getCategories = async(req,res) => {
    let db_connect = dbo.getDb();
    
    let categories = []
    await db_connect.collection("categories").find().forEach((cat) => {
        categories.push(cat);
    });

    res.json({categories: categories})
}

const addProduct = async (req,res) => {
    let db_connect = dbo.getDb();
    const categories = req.body.categories.map((cat) => (cat.value));
    const seller = req.user;
    const name = req.body.name;
    const description = req.body.description;
    const sku = req.body.sku;
    const price = req.body.price;
    const stock = parseInt(req.body.quantity);
    const media = req.body.images;
    const status = "Pending";
    const dimensions = parseFloat(req.body.dimensions);
    try{
        await db_connect.collection("products").insertOne({
            seller,
            name,
            description,
            sku,
            price,
            stock,
            media,
            categories,
            status,
            dimensions
        }).then(() => {
            res.json({message: 'success'});
        });
    }catch(err){
        res.json({message: 'fail'});
    }
}

const disableProduct = async (req, res) => {
    let db_connect = dbo.getDb();
    try{
        const result = await db_connect.collection("products").updateOne({_id: new ObjectId(req.body.productId), seller: req.user}, {$set: {
            status: "Disabled"
        }});
        if(result.modifiedCount==1){
            return res.json({success: true});
        }else{
            return res.json({success: false});
        }
    }catch(err){
        console.log(err);
        return res.json({success: false});
    }
}

const getProducts = async (req,res) => {
    let db_connect = dbo.getDb();
    const sellerId = req.user;
    const products = [];
    await db_connect.collection("products").find({seller: sellerId}).forEach((product) => {
        products.push(product);
    });
    return res.json({products: products})
}

const modifyProduct = async (req,res) => {
    let db_connect = dbo.getDb();
    const productId = new ObjectId(req.body._id);
    try{
        const product = await db_connect.collection("products").findOne({_id: productId});
        let status = "Pending";
        {
            await db_connect.collection("products").updateOne({_id: productId}, {$set: {
                name: req.body.name,
                description: req.body.description,
                sku: req.body.sku,
                price: req.body.price,
                stock: parseInt(req.body.quantity),
                media: req.body.media,
                categories: req.body.categories,
                dimensions: req.body.dimensions,
                status: "Pending"
            }});
        }
        return res.json({message: "Success", status: status});
    }catch(err){
        return res.json({message: "Error"})
    }
}

const getOrders = async (req,res) => {
    let db_connect = dbo.getDb();
    const sellerId = req.user;
    const orders = [];
    await db_connect.collection("orders").find().sort({ date: -1 }).forEach((order) => {
        let isSeller = false;
        const cartItems = order.cartItems.filter((cartItem) => (new ObjectId(cartItem.seller).equals(new ObjectId(sellerId))));
        order.cartItems = cartItems;
        if(order.cartItems.length != 0) {
            orders.push(order);
        }
    });
    return res.json({orders: orders})
}

const readyItems = async (req, res) => {
    const order= req.body.order;
    const user = req.user;
    const checkedProducts = req.body.checkedProducts;
    let db_connect = dbo.getDb();

    const checkedCartIds = checkedProducts.map((checkedProduct) => checkedProduct.cartId);
    const newCartItems = [];
    order.cartItems.forEach((item) => {
        if(item.seller != user) return;
        if(checkedCartIds.includes(item.cartId)){
            newCartItems.push({
                cartId: new ObjectId(item.cartId), 
                productId: new ObjectId(item.productId), 
                quantity: parseInt(item.quantity), 
                seller: new ObjectId(item.seller),
                status: "Ready For Pickup",
            });
        }else{
            newCartItems.push(item);
        }
    })

    await db_connect.collection("orders").updateOne({_id: new ObjectId(order._id)}, {$set: {
        cartItems: newCartItems
    }});
    return res.json({success: true, cartItems: newCartItems});

}


module.exports = {
    getCategories,
    addProduct,
    getProducts,
    modifyProduct,
    getOrders,
    disableProduct,
    readyItems
}