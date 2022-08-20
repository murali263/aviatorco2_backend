const database = require('../connection/dbConnection');
const { GET_ACIREGION, DB_NAME } = require('../constants/database');
const res = require('express/lib/response');

exports.getAciRegion = async (req, res) =>{
console.log('AciRegion API triggered');
    try{

        let client = await database.getClient();

        let result = await client
        .db(DB_NAME)
        .collection(GET_ACIREGION)
        .find()
        .toArray()
        res.send(result);

    }catch (err){
        throw new Error(err.toString())
    }
}