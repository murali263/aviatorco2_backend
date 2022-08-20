const database = require('../connection/dbConnection');
const { AIRPORT_DATA, DB_NAME } = require('../constants/database');
const { generateRequestId, getTime } = require('.././lib/utils');
const res = require('express/lib/response');

exports.saveAirData = async (req, res) =>{
console.log('Aircraft Data API triggered')
let payload  = {};

    try{
        payload = req.body;
        param = req.body.email;
        let isEmailExist = await getAirData(param);
        
        if(isEmailExist.length > 0){
            res.status(200).send('email already exist')
            return 
        }

        let airportId = await generateRequestId();
        let client = await database.getClient();
        payload['airportId'] = airportId;
        payload['createdTime'] = await getTime();

        let result = await client
        .db(DB_NAME)
        .collection(AIRPORT_DATA)
        .insertOne(payload)

        res.status(200).send(result);

    }catch (err){
        throw new Error(err.toString())
    }
}

exports.getAirportData = async (req, res) =>{
    console.log('Get Airport Data triggered')

    try {
        let param = req.query.email;
        let result = await getAirData(param);

        res.status(200).send(result);

    }catch(err){
        throw new Error(err.toString());
    }
}

const getAirData = async ( param  ) => {

    try{
        let client = await database.getClient();

        let result = await client
        .db(DB_NAME)
        .collection(AIRPORT_DATA)
        .find({ email : param })
        .toArray()
        return result
    }catch(err){
        throw new Error(err.toString());
    }
}


exports.updateAirData = async (req, res) =>{
    console.log('Update Aircraft Data API triggered')
    let findBy  = {};
    let obj = {};
    
        try{
           
            findBy['airportId'] = req.body.airportId;
            obj = req.body;
            delete obj.airportId;
        
            let client = await database.getClient();
            obj['updatedTime'] = await getTime();
   
            let result = await client
            .db(DB_NAME)
            .collection(AIRPORT_DATA)
            .findOneAndUpdate(
                findBy,
                {
                    $set : obj
                },
                { returnNewDocument: true, returnOriginal: false }
            )
    
            res.status(200).send(result);
    
        }catch (err){
            throw new Error(err.toString())
        }
    }