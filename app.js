var dotEnv=require('dotenv');
dotEnv.config();
const port= process.env.PORT || 3000

const bodyParser = require('body-parser');
const express=require('express');
const cors = require('cors');
var app = express();
var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors());
var routeConfig = require('./routeConfig/route-config')

//routes initials
app.use('/api',routeConfig)

app.listen(port,()=> console.log(`server listning on port ${port}`))