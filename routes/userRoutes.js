const express = require("express");
var router = express.Router();
const { masterDataLto } = require("../controllers/masterDataLto");
const { masterDataApu } = require("../controllers/masterDataApu");
const {masterDataWtOutTaxiLto} = require("../controllers/masterDataWtOutTaxiLto");
const { verifyToken } = require("../lib/token");

const { getUsers, addUser, signIn, generateOtp, verifyOtp, changePassword } = require('../controllers/userAuth');
const { saveAirData, getAirportData, updateAirData } = require('../controllers/airCraftData');
const { getCountries } = require('../controllers/getCountries');
const { getTenantTypes } = require('../controllers/getTenantTypes');
const { saveTenantData } = require('../controllers/tenantData');
const { masterFuel} = require('../controllers/masterFuel')
const { getCountry} = require('../controllers/getcountry')
const { getAciRegion}=require('../controllers/getAciRegion')
const {masterUnits}= require('../controllers/masterUnits')
const {masterTenant}= require('../controllers/masterTenant')


//metion all user routes here
router.get("/user", verifyToken, getUsers);

//metion all user routes here
// router.get("/user", getUsers);

router.post("/addUser", addUser);

router.post("/signIn", signIn);

router.post("/generateOtp", generateOtp);

router.post("/verifyOtp", verifyOtp);

router.get("/getAllCountries", getCountries);

router.post("/aircraftData", saveAirData);

router.post("/masterDataLto", masterDataLto);

router.post("/masterDataWtOtTaxiLto", masterDataWtOutTaxiLto);

router.post("/masterDataApu", masterDataApu);

router.get("/getAirportDAta", getAirportData);

router.post("/updateAircraftData", updateAirData);

router.get('/getTenantTypes', getTenantTypes)

router.post('/saveTenantData', saveTenantData)

router.post('/change-pwd', changePassword)

router.post('/masterFuel',masterFuel)

router.get('/country',getCountry)

router.get('/aciRegion',getAciRegion)

router.post('/masterUnits',masterUnits)

router.post('/masterTenant',masterTenant)

module.exports = router;
