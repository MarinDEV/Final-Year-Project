const express = require("express");
const dbo = require("../db/conn");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { request } = require("express");


// Convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// Registers a new user and returns user details as response
createUser = (req, res) => {

  if(!isValidSignup(req.body)){
    return res.status(400).json({});
  }
  
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 'Default'
  };

  let db_connect = dbo.getDb();
  db_connect.collection("users").findOne({email: newUser.email}).then((user) => {
    if (!user) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          db_connect.collection("users").insertOne(newUser).then((result) => {

            // sign the token
            const token = jwt.sign(
              {userId: result.insertedId},
              process.env.JWT_SECRET,
              {expiresIn: 10000}
            );
            
            // send token in cookie
            var date = new Date()
            date.setTime(date.getTime() + 1 * 1000 * 10000);

            res.cookie("token", token, {
              httpOnly: true,
              expires: date,
            });

            const userDetails = {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              role: 'Default'
            }
            
            return res.json({
              success: true,
              message: "Successfully registered user!",
              user: userDetails, 
              expiration: date
            });

          }).catch(error => {
            throw error;
      });});});
    }else{
      return res.json({ 
        success: false,
        message: "Email already exists!" 
      });
    }
  });
}

// Logs in the user and returns user details on the response
loginUser = (req, res) => {
  // If user is already logged in
  if(req.cookies.token) {
    return res.json({
      success: false, 
      redirect: true
    });
  }
  if(!isValidLogin(req.body)){
    return res.json({
      success: false,
      message: "Wrong username or password!"
    });
  }
  let db_connect = dbo.getDb();
  db_connect.collection("users").findOne({email: req.body.email}).then((user) => {
    if(!user){
      // Could also say: wrong email
      return res.json({
        success: false, 
        message: "Wrong username or password!"
      });
    }else{
      bcrypt.compare(req.body.password, user.password, function(error, response) {
        if (error) {
          throw error;
          return res.json({
            success: false,
            message: "Wrong username or password!"
          });
        }
        if (response){
          // Sign the Token
          const token = jwt.sign(
            {
              userId: user._id
            },
            process.env.JWT_SECRET,
            {expiresIn: 10000} // 10000 seconds (2.8 hours)
          );
          // Send request to set the cookie with the Token
          let date = new Date();
          date.setTime(date.getTime() + 1000 * 10000); // 10000 seconds (2.8 hours)
          res.cookie("token", token, {
            httpOnly: true, // Only accessed by http (client-side scripts cannot access)
            expires: date,
          });
          const userDetails = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          return res.json({
            success: true,
            message: "Successfully logged in!",
            user: userDetails, 
            expiration: date
          });
        } else {
          return res.json({
            success: false, 
            message: "Wrong username or password!"
          });
        }
});}});}

logoutUser = (req, res) => {

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  }).send();

  // let db_connect = dbo.getDb();
  // db_connect.collection("cart").deleteMany({userId: req.user});
  

}

getUser = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);
    decoded = jwt.verify(token, process.env.JWT_SECRET); // Token data
    const decodedId = ObjectId(decoded.userId);
    const expiration = new Date(decoded.exp * 1000);
    let db_connect = dbo.getDb();
    db_connect.collection("users").findOne({_id: decodedId}).then((user) => {
      if(!user){
        return res.json({user: false});
      }else{
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        };
        return res.json({user: userData, expiration: expiration});
      }
    });
  } catch (err) {
      return res.json({user: false});
  }
}

const returnOrder = async (req, res) => {
  const order= req.body.order;
  const user = req.user;
  const checkedProducts = req.body.checkedProducts;
  let db_connect = dbo.getDb();

  if(order.userId != user){
    return res.json({success: false});
  }

  const checkedCartIds = checkedProducts.map((checkedProduct) => checkedProduct.cartId);
  const newCartItems = [];
  order.cartItems.forEach((item) => {
    if(checkedCartIds.includes(item.cartId)){
      newCartItems.push({
        cartId: new ObjectId(item.cartId), 
        productId: new ObjectId(item.productId), 
        quantity: item.quantity, 
        seller: new ObjectId(item.seller),
        status: "Requested Return",
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






// VALIDATIONS


const validateEmail = (email) => {
  return String(email).toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

isValidSignup = (data) => {
  const {name, email, password, confirmPassword} = data;
  if(!name || !email || !password || !confirmPassword 
    || password != confirmPassword){
    return false;
  }
  if(!validateEmail(email)){
    return false;
  }
  return true;
}

isValidLogin = (data) => {
  const {email,password} = data;
  if(!email || !password){
    return false;
  }
  if(!validateEmail(email)){
    return false;
  }
  return true;
}

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUser,
    returnOrder
}