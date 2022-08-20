const { DB_NAME, USER_AUTH, USER_REFRESH_TOKENS } = require("../constants/database")
const database = require('../connection/dbConnection');
const config = require("../secret/client_secretKey");
const jwt = require('jsonwebtoken');

const getAccessToken = async (email) => {
    console.log("getAccessToken triggered")
    let client = await database.getClient();
    let user = await client.db(DB_NAME).collection(USER_AUTH).findOne({ email, isActive: true });

    let userMetaData = {
        user_Id: user._id,
        email: user.email
    }

    let secret = process.env.CLIENT_SECRET || config.clientSecretAccessKey;
    let token = await jwt.sign(userMetaData, secret, { expiresIn: '40s' });

    return token;
}

const getRefreshToken = async (email) => {
    console.log("getRefreshToken triggered")
    let client = await database.getClient();
    let user = await client.db(DB_NAME).collection(USER_AUTH).findOne({ email, isActive: true });

    let userMetaData = {
        user_Id: user._id,
        email: user.email
    }

    let secret = process.env.REFRESH_TOKEN || config.clientSecretRefreshKey;
    let token = await jwt.sign(userMetaData, secret);
    let timeStamp = new Date().getTime();

    //Insert in to collection 
    await client.db(DB_NAME).collection(USER_REFRESH_TOKENS).insertOne({ email:user.email,refreshToken:token,timeStamp:timeStamp});

    return token
}

const verifyToken = (req, res, next) => {
    try {
        console.log("verifyToken triggered")
        
        const authHeader = req.headers.authorization
        let token = authHeader.split(' ')[1];
        let secret = process.env.CLIENT_SECRET || config.clientSecretKey;
        if (token) {
            jwt.verify(token, secret, (err, decode) => {
                if (err) {
                    return res.status(403).send({ mesg: "token invalid" })
                }

                req.user = decode;
                next();
            })
        } else {
            res.status(401).send({ mesg: "Token not found" });
        }

    } catch (err) {
        console.log(err)
    }
}

module.exports = { getAccessToken, verifyToken, getRefreshToken }