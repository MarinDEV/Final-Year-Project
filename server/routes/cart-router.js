const express = require('express')
const CartCtrl = require('../controllers/cart-ctrl')
const cartRoutes = express.Router()
const { userAuth, adminAuth } = require("../middleware/auth.js");

cartRoutes.post('/api/cart/add',userAuth, CartCtrl.addCart)
cartRoutes.get('/api/cart/get', userAuth, CartCtrl.getCartItems)
cartRoutes.post('/api/cart/remove', userAuth, CartCtrl.removeCart)
cartRoutes.post('/api/cart/order', userAuth, CartCtrl.placeOrder)
cartRoutes.get('/api/orders/get', userAuth, CartCtrl.getUserOrders)


module.exports = cartRoutes;
