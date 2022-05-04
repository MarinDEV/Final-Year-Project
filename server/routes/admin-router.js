const express = require('express')
const AdminCtrl = require('../controllers/admin-ctrl')
const adminRoutes = express.Router()

const { adminAuth, courierAuth } = require("../middleware/auth.js");

adminRoutes.get('/api/admin/users/get' ,adminAuth ,AdminCtrl.getUsers);
adminRoutes.post('/api/admin/users/setrole', adminAuth, AdminCtrl.setUserRole)
adminRoutes.delete('/api/admin/user/delete', adminAuth, AdminCtrl.deleteUser)
adminRoutes.get('/api/admin/products/get', adminAuth, AdminCtrl.getProducts)
adminRoutes.post('/api/admin/order/status/set', courierAuth, AdminCtrl.setOrderStatus)
adminRoutes.post('/api/admin/product/status/set', adminAuth, AdminCtrl.setStatus)
adminRoutes.delete('/api/admin/order/delete', adminAuth, AdminCtrl.deleteOrder)


module.exports = adminRoutes
