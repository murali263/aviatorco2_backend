const database = require('../connection/dbConnection');
const { GET_COUNTRIES, DB_NAME } = require('../constants/database');
const res = require('express/lib/response');

exports.getCountries = async (req, res) =>{
console.log('countries API triggered');
    try{

        let client = await database.getClient();

        let result = await client
        .db(DB_NAME)
        .collection(GET_COUNTRIES)
        .find()
        .toArray()
        res.send(result);

    }catch (err){
        throw new Error(err.toString())
    }
}