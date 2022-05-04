const jwt = require("jsonwebtoken");
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

userAuth = (req, res, next) => {
    try{
        const token = req.cookies.token;
        if (!token) {
            return res.json({user: false});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified.userId;
        next();
    } catch (error) {
        res.json({user: false});
    }
}

adminAuth = async (req, res, next) => {
    try {   
        const token = req.cookies.token;
        if(!token) {
            return res.json({message: "Authentication failed"});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified.userId;
        let db_connect = dbo.getDb();
        await db_connect.collection("users").findOne({_id: new ObjectId(verified.userId)}).then((user) => {
            if(user.role == "Admin"){
                next();
            }else{
                res.json({message: "Authentication failed!"});
            }
        });
    } catch (error) {
        res.json({message: "Authentication failed!"});
    }
}

sellerAuth = async (req, res, next) => {
    try {   
        const token = req.cookies.token;
        if(!token) {
            return res.json({message: "Authentication failed"});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified.userId;
        let db_connect = dbo.getDb();
        await db_connect.collection("users").findOne({_id: new ObjectId(verified.userId)}).then((user) => {
            if(user.role == "Seller" || user.role == "Admin"){
                next();
            }else{
                res.json({message: "Authentication failed!"});
            }
        });
    } catch (error) {
        res.json({message: "Authentication failed!"});
    }
}

courierAuth = async (req, res, next) => {
    try {   
        const token = req.cookies.token;
        if(!token) {
            return res.json({message: "Authentication failed!"});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified.userId;
        let db_connect = dbo.getDb();
        await db_connect.collection("users").findOne({_id: new ObjectId(verified.userId)}).then((user) => {
            if(user.role == "Courier" || user.role == "Admin"){
                next();
            }else{
                res.json({message: "Authentication failed!"});
            }
        });
    } catch (error) {
        res.json({message: "Authentication failed!"});
    }
}

module.exports = { userAuth, adminAuth, sellerAuth, courierAuth }