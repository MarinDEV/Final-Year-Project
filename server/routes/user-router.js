const express = require('express')
const UserCtrl = require('../controllers/user-ctrl')
const userRoutes = express.Router()

const { userAuth } = require("../middleware/auth.js");

userRoutes.post('/api/user/register', UserCtrl.createUser)
userRoutes.post('/api/user/login', UserCtrl.loginUser)
userRoutes.post('/api/user/logout', userAuth, UserCtrl.logoutUser)
userRoutes.get('/api/user/get' ,UserCtrl.getUser)
userRoutes.post('/api/products/return', userAuth, UserCtrl.returnOrder)


module.exports = userRoutes


