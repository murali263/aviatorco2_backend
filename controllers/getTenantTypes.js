const database = require('../connection/dbConnection');
const { GET_TENANTTYPES, DB_NAME } = require('../constants/database');
const res = require('express/lib/response');

exports.getTenantTypes = async (req, res) => {
 console.log("getTenantTypes API Triggered")

 try {

    let client = await database.getClient();

    let result = await client
    .db(DB_NAME)
    .collection(GET_TENANTTYPES)
    .find()
    .toArray()

    res.send(result);
    
 }catch (err){
    throw new Error(err.toString())
 }

}