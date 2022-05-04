const express = require('express')
const ProductsCtrl = require('../controllers/products-ctrl')
const productsRoutes = express.Router()

productsRoutes.get('/api/products/get' ,ProductsCtrl.getProducts)
productsRoutes.get('/api/product/get' ,ProductsCtrl.getProduct)
productsRoutes.get('/api/products/featured', ProductsCtrl.getFeaturedProducts)
productsRoutes.get('/api/products/getbyids', ProductsCtrl.getProductsByIds)


module.exports = productsRoutes
