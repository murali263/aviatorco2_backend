const express = require('express');
var router = express.Router();
//define all routes here the entry point prefix will be "api/"
const userRoute = require('../routes/userRoutes');
const tokenRoute = require('../routes/getToken');

router.use('/', userRoute);

router.use('/', tokenRoute);

module.exports = router;