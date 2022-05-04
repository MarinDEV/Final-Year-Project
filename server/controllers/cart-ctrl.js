const express = require("express");
const dbo = require("../db/conn");
const stripe = require("stripe")(process.env.STRIPE_SECRET)

// Convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

addCart = async (req, res) => {
    let db_connect = dbo.getDb();
    await db_connect.collection("cart").findOne({userId: new ObjectId(req.user)}).then((user) => {
        let arr = [];
        if(user){
            arr = user.cart;
        }
        arr.push({
            cartId: new ObjectId(), 
            productId: new ObjectId(req.body.id), 
            quantity: req.body.quantity, 
            seller: new ObjectId(req.body.seller),
            unitDimensions: Math.round( parseFloat(req.body.unitDimensions) * 1e4 ) / 1e4, 
            unitPrice: Math.round( parseFloat(req.body.unitPrice) * 1e4 ) / 1e4,
            status: "Ordered"
        })
        db_connect.collection("cart").deleteMany({userId: new ObjectId(req.user)}).then(() => {
            db_connect.collection("cart").insertOne({userId: new ObjectId(req.user), cart: arr});
        });
    });
    
    return res.status(200).json({});
}

getCartItems = async (req, res) => {
    let db_connect = dbo.getDb();
    let cartItems = [];
    let products = [];
    await db_connect.collection("cart").findOne({userId: new ObjectId(req.user)}).then((user) => {
        if(user){
            cartItems = user.cart;
        }else{
            cartItems = []
        }
    });

    await db_connect.collection("products").find().forEach((product) => {
        cartItems.forEach((el) => {
            if(product._id.equals(el.productId)){
                let product2 = {...product, quantity: el.quantity, cartId: el.cartId};
                products.push(product2);
            }
        });
    }).then(() => {
        res.json({cart: products});
    })
}

removeCart = async (req,res) => {
    const userId = req.user;
    const cartId = req.body.cartId
    let arr = [];
    let db_connect = dbo.getDb();
    await db_connect.collection("cart").findOne({userId: new ObjectId(userId)}).then((user) => {
        if(user){
            arr = user.cart;
            const arr2 = arr.filter(function (el) {
                return !el.cartId.equals(new ObjectId(cartId));
            })
            db_connect.collection("cart").deleteMany({userId: new ObjectId(userId)}).then(() => {
                if(arr2 != []){
                    db_connect.collection("cart").insertOne({userId: new ObjectId(userId), cart: arr2});
                }
            });
            res.json({});
        }
    })

}

placeOrder = async (req,res) => {
    const userId = req.user;
    let db_connect = dbo.getDb();
    let cartItems = [];
    let address = req.body.address;
    let price = req.body.amount;
    let phone = req.body.phone;
    let paymentMethod = req.body.method;
    let tokenizedData = req.body.id;

    const {error, message} = await validateProducts(userId);
    if(error){
        return res.json({success: false, message});
    }

    await db_connect.collection("cart").findOne({userId: new ObjectId(userId)}).then((user) => {
        if(user){
            cartItems = user.cart;
        }
    }).catch((error) => {
        console.log(error);
        return res.json({success: false});
    });

    try {
        if(paymentMethod == "Card"){
            try {
                const paymentPrice = parseInt(price) * 100;
                const payment = await stripe.paymentIntents.create({
                    amount: paymentPrice,
                    currency: "USD",
                    description: "AL E-commerce",
                    payment_method: tokenizedData,
                    confirm: true
                });
            }catch (error) {
                res.json({
                    message: "Payment Failed",
                    success: false
                })
                throw error;
            }
        }

        const quantities = cartItems.map((item) => ({_id: item.productId, quantity: item.quantity}));
        await quantities.forEach(async (item) => {
            db_connect.collection("products").updateOne({_id: item._id}, {$inc: {stock: -parseInt(item.quantity)}});
        });

        let totalDimensions = 0;
        cartItems.forEach((item) => {
            totalDimensions+=(item.unitDimensions*item.quantity);
        });

        await db_connect.collection("orders").insertOne({
            userId: new ObjectId(userId), 
            cartItems: cartItems, 
            address: address, 
            price: Math.round(parseFloat(price) * 1e2 ) / 1e2,
            phone: phone,
            paymentMethod: paymentMethod,
            dimensions: Math.round( totalDimensions * 1e6) / 1e6,
            date: new Date()
        }).catch((error) => {
            res.json({
                message: "Database Error 2",
                success: false
            });
            throw error;
        });

        await db_connect.collection("cart").deleteMany({userId: new ObjectId(userId)});

        return res.status(200).json({succes: "true", message: "Placed Order"});

    }catch(error){
        throw error;
    }
}

// Check if products still available.
const validateProducts = async (userId) => {
    let db_connect = dbo.getDb();
    let cartItems = [];
    await db_connect.collection("cart").findOne({userId: new ObjectId(userId)}).then((user) => {
        if(user){
            cartItems = user.cart;
        }
        /*
            cartId: ObjectId,
            productId: ObjectId,
            quantity: Integer,
            seller: ObjectId,
            dimensions: double,
            status: "Ordered"
        */
    }).catch((error) => {
        console.log(error);
    });

    const productIds = cartItems.map((item) => item.productId); // The product ids of all cart items.
    let products = await db_connect.collection("products").find({_id: {$in: productIds}}).toArray(); // Get all products that are on the cart.
    products = products.map((product) => ({_id: product._id, name: product.name, stock: parseInt(product.stock), status: product.status, stockLeft: parseInt(product.stock)})); // Map products {product id, stock left, status}
    
    const invalidProducts = []
    cartItems.forEach((item) => {
        const correspondingProduct = products.find((product) => product._id.equals(item.productId));
        if(!correspondingProduct) return;
        if(correspondingProduct.status != "Active"){
            invalidProducts.push({name: correspondingProduct.name});
            return;
        }
        if(correspondingProduct.stock<item.quantity){
            invalidProducts.push({name: correspondingProduct.name, stock: correspondingProduct.stock, stockLeft: correspondingProduct.stockLeft});
            return;
        }else{
            const index = products.indexOf(correspondingProduct);
            let updatedProduct = {...products[index]};
            updatedProduct.stock -= item.quantity;
            products[index] = updatedProduct;
        }
    });
    
    let errorMessage = "";
    invalidProducts.forEach((product, index) => {
        errorMessage+= product.name.replace(/(.{30})..+/, "$1…") + ` (Quantity left: ${product.stockLeft || `0`})${ index != invalidProducts.length-1 ? ',' : `.`} `
    });

    if(invalidProducts.length == 0) {
        return {error: false} 
    }else{
         return {error: true, message: errorMessage}
    }
}

const getUserOrders = async (req,res) => {
     let db_connect = dbo.getDb();
    const orders = await db_connect.collection("orders").find({userId: new ObjectId(req.user)}).sort({date: 1}).toArray();
    return res.json({orders: orders.reverse()});
}

module.exports = {
    addCart,
    getCartItems,
    removeCart,
    placeOrder,
    getUserOrders
}