const express = require('express');
var router = express.Router();
const database = require('../connection/dbConnection');
const { DB_NAME, USER_REFRESH_TOKENS } = require('../constants/database');
const jwt = require('jsonwebtoken');
const { getAccessToken } = require('../lib/token');

router.post('/token', async (req, res) => {   
    console.log("token Api triggered");
    var refreshToken= req.body.refreshToken
    var email=req.body.email
    let secret = process.env.REFRESH_TOKEN;
    //If the token is not passed 
    if (!refreshToken) {
        return res.status(401).send({ mesg: "Token not found" })
    }

    try {
        let client = await database.getClient();

        let result = await client.db(DB_NAME).collection(USER_REFRESH_TOKENS).findOne({ email, refreshToken });

        //If the token is valid generate new access token
        if (result && (result.email == email && result.refreshToken == refreshToken)) {
            const user = await jwt.verify(refreshToken, secret)

            if (!user) {
                return res.status(403).send({ mesg: "Invalid Token" })
            }

            const accessToken = await getAccessToken(email);

            res.status(200).send({ accessToken, email });
        } else {
            return res.status(403).send({ mesg: "Invalid refresh token" })
        }


    } catch (err) {
        console.log(err)
    }
})
module.exports = router;