//import mongo driver
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const dbConnection = () => {
    try {
        let client = null;
        let POOL_SIZE = process.env.POOL_SIZE || "10"
        let poolSize = parseInt(POOL_SIZE);

        //get client
        const getClient = async () => {
    
            // return if already client is connected
            if (client) {
                return client;
            }

            //throw an error if db url is not present
            if (!process.env.DB_URL) {
                throw new Error("DB URL not found");
            }

            client = await MongoClient.connect(process.env.DB_URL, {
                useNewUrlParser: true,
                poolSize,
                useUnifiedTopology: true
            });
            return client;
        }

        return { getClient }
    } catch (err) {
        console.log(err)
    }

}

module.exports = dbConnection();
