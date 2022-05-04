const express = require('express')
const SellerCtrl = require('../controllers/seller-ctrl')
const sellerRoutes = express.Router()

const { sellerAuth } = require("../middleware/auth.js");

sellerRoutes.get('/api/seller/categories/get', SellerCtrl.getCategories)
sellerRoutes.post('/api/seller/addproduct' ,sellerAuth, SellerCtrl.addProduct)
sellerRoutes.get('/api/seller/products/get' ,sellerAuth, SellerCtrl.getProducts)
sellerRoutes.post('/api/seller/product/modify', sellerAuth, SellerCtrl.modifyProduct)
sellerRoutes.get('/api/seller/orders/get', sellerAuth, SellerCtrl.getOrders)
sellerRoutes.post('/api/seller/product/disable', sellerAuth, SellerCtrl.disableProduct)
sellerRoutes.post('/api/products/ready', sellerAuth, SellerCtrl.readyItems)


module.exports = sellerRoutes
