// const jwt = require('jsonwebtoken');
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'


dotenv.config()
const JWT_SECRET = process.env.JWTSECRET;
// console.log(JWT_SECRET)

export const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    console.log("token is :", token)
    if (!token) {
        res.status(401).json({ success: false, data: {}, message: "Please authenticate using a valid token! No Valid token found" });
        return
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);

        console.log(data)
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ success: false, data: {}, message: "Please authenticate using a valid token" });
        return
    }
}