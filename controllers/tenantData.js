const database = require('../connection/dbConnection');
const { TENANT_DATA, DB_NAME } = require('../constants/database');
const { generateRequestId, getTime } = require('.././lib/utils');
const res = require('express/lib/response');

exports.saveTenantData = async (req, res) => {
    console.log('Tenant API triggered')
    let payload = {};

    try{
        payload = req.body;
      
        let tenantId = await generateRequestId();
        let client = await database.getClient();
        payload["tenantId"] = tenantId;
        payload["createdTime"] = await getTime();

        let result = await client
        .db(DB_NAME)
        .collection(TENANT_DATA)
        .insert(payload)

        res.status(200).send(result);

    } catch (err){
        throw new Error(err.toString())
    }
}