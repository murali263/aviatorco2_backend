const database = require('../connection/dbConnection');
const { GET_COUNTRY, DB_NAME } = require('../constants/database');
const res = require('express/lib/response');

exports.getCountry = async (req, res) =>{
console.log('countries API triggered');
    try{

        let client = await database.getClient();

        let result = await client
        .db(DB_NAME)
        .collection(GET_COUNTRY)
        .find()
        .toArray()
        res.send(result);

    }catch (err){
        throw new Error(err.toString())
    }
}