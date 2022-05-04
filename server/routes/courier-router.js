const express = require('express')
const CourierCtrl = require('../controllers/courier-ctrl')
const courierRoutes = express.Router()

const { courierAuth } = require("../middleware/auth.js");

courierRoutes.get('/api/courier/orders/get' ,courierAuth ,CourierCtrl.getOrders);
courierRoutes.post('/api/courier/status/set' ,courierAuth ,CourierCtrl.changeOrderStatus);
courierRoutes.get('/api/courier/new' ,courierAuth ,CourierCtrl.createDelivery);
courierRoutes.get('/api/courier/delivery/get' ,courierAuth ,CourierCtrl.getDeliveryDetails);
courierRoutes.get('/api/courier/delivery/active' ,courierAuth ,CourierCtrl.getActiveDelivery);
courierRoutes.post('/api/courier/delivery/next', courierAuth, CourierCtrl.nextLocation);
courierRoutes.post('/api/courier/delivery/complete', courierAuth, CourierCtrl.completeDelivery);
courierRoutes.get('/api/courier/delivery/matrix', courierAuth, CourierCtrl.getMatrix);


module.exports = courierRoutes
