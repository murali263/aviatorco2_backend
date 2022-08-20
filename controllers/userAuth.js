const database = require('../connection/dbConnection');
const { DB_NAME, AIRPORT_USERS, USER_AUTH, USER_OTP, MAILVERIFICATION } = require('../constants/database')
const bcryptjs = require('bcryptjs');
const { getAccessToken, getRefreshToken } = require('../lib/token');
const res = require('express/lib/response');
const otpGenerator = require('otp-generator');
const nodemailer = require("nodemailer");
const { AddMinutesToDate, subject_mail_verification, mail_verification_message,forget_password_message,subject_forget_password } = require('../lib/utils');

const { v4: uuidv4 } = require('uuid');


exports.getUsers = async (req, res) => {
  
  try {
    console.log("getUsers api Triggered");
    let userEmail = req.query.email;
    let client = await database.getClient();
    let result = await client
      .db(DB_NAME)
      .collection(AIRPORT_USERS)
      .find({email: userEmail})
      .toArray();
      console.log("getUsers api Successfully executed");
    res.send(result);
  } catch (err) {
    throw new Error(err.toString());
  }
};

exports.addUser = async (req, res) => {
  try {
    console.log("addUser api Triggered");
    let config = req.body;   
    let client = await database.getClient();

    if (
      !config.hasOwnProperty("email") &&
      !config.hasOwnProperty("airport_Code")
    ) {
      res.send({ message: "All Paramaters required" });
      return;
    }

    let findUser = await client
      .db(DB_NAME)
      .collection(AIRPORT_USERS)
      .findOne({ email: config.email})


    if (!findUser) {
      let userObject = {
        fullName: config.fullName,
        email: config.email,
        mobile: config.mobile,
        airportName: config.airportName,
        airport_Code: config.airport_Code,
        countryName: config.countryName,
        regionName: config.regionName,
        roleName: config.countryId,
      };
      await client.db(DB_NAME).collection(AIRPORT_USERS).insertOne(userObject);
      let userAuthObject = {
        email: config.email,
        password: bcryptjs.hashSync(config.password, 7),
        isActive: true,
        isVerified: false,
        airport_Code: config.airport_Code,
      };

      let result = await client
        .db(DB_NAME)
        .collection(USER_AUTH)
        .insertOne(userAuthObject);
        console.log("addUser api successfully executed");
      res.status(200).send(result);
    } else {
      res.status(401).send({ message: "User Already Exists" });
    }
  } catch (err) {
    throw new Error(err.toString());
  }
};

exports.signIn = async (req, res) => {
  try {

    console.log("signIn api Triggered");
    const { email, password } = req.body;
    //validate required parameters
    if (!(email && password)) {
      return res.status(401).send("username or password is required");
    }

    let client = await database.getClient();
    let user = await client.db(DB_NAME).collection(USER_AUTH).findOne({
      isActive: true,
      email,
    });

    if (!user) {
      return res.status(404).send({ mesg: "User NOT found" });
    }
    

    let isPasswordValid = bcryptjs.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({
        accesToken: null,
        mesg: "username or password is invalid",
      });
    }

    let userExist = await client
      .db(DB_NAME)
      .collection(AIRPORT_USERS)
      .findOne({ email, airport_Code: user.airport_Code });

    if (!userExist) {
      return res.status(404).send({ mesg: "User Not found in system" });
    }

    // Generate access token
    let accesToken = await getAccessToken(email);

    // Generate refresh token 
    let refreshToken = await getRefreshToken(email);

    console.log("SignIn api successfully executed");


    return res.status(200).send({
      accesToken,
      email,
      mesg: "successfully logged in",
      refreshToken,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.log(err);
  }
};

exports.generateOtp = async (req, res) => {
  try {
    console.log("generateOtp api Triggered");

    const { email, type } = req.body;

    if (!email) {
      return res.status(401).send({ Success: false, msg: "email is required" });
    }

    if (!type) {
      return res.status(401).send(({ Success: false, msg: "type is required" }));
    }

    let client = await database.getClient();


    if (type == "FORGET") {

      let user = await client.db(DB_NAME).collection(USER_AUTH).findOne({
        isActive: true,
        email,
      });
      if (!user) {
        return res.status(404).send({ msg: "User NOT found" });
      }
    }

    //Generate OTP 
    const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 2);
    let otp_id = uuidv4();


    //Create OTP instance in DB
    const otp_instance = {
      otp_instance_id: otp_id,
      email: email,
      otp: otp,
      expiration_time: expiration_time,
      verified: false,
      createdOn: new Date().getTime()
    }

    let otpObj = await client
      .db(DB_NAME)
      .collection(USER_OTP)
      .insertOne(otp_instance);

    var details = {
      "timestamp": now,
      "email": email,
      "success": true,
      "message": "OTP sent to your email.Please Check your Email",
      "otp_id": otp_instance.otp_instance_id
    }


    if (type == "VERIFICATION") {
      email_message = mail_verification_message(otp)
      email_subject = subject_mail_verification
    }
    else  {
      email_message = forget_password_message(otp)
      email_subject = subject_forget_password
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'webmail.prospectatech.com',
      port: 587,
      secure: false,
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.EMAIL_PASSWORD}`
      },
      tls: { rejectUnauthorized: false }
    });

    const mailOptions = mailObj = {
      from: `"Aviator Co2"<${process.env.EMAIL_ADDRESS}>`,
      to: `${email}`,
      subject: email_subject,
      html: email_message,
    };

    mailObj.status = "pending";
    let resp = await client.db(DB_NAME).collection(MAILVERIFICATION).insertOne(mailObj);   

    await transporter.verify();


    //Send Email
    await transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        return res.status(400).send({ "Success": false, "msg": err });
      } else {

        let mailId = resp.ops[0]['_id'];
        let result = client.db(DB_NAME).collection(MAILVERIFICATION).findOneAndUpdate(
          { _id: mailId, status: "pending" },
          {
            $set: { status: "sent", }

          }
        );
        console.log("generate otp successfully executed");

        return res.send({ "Success": true, "data": details });

      }
    });



  } catch (error) {
    console.log(error);
    const response = { "Status": "Failure", "msg": error.message }
    return res.status(400).send(response)

  }
}

exports.verifyOtp = async (req, res) => {

  try {
    console.log("verifyOtp api Triggered");

    var currentdate = new Date().getTime();

    const { otp, email, otp_instance_id } = req.body;

    if (!otp) {
      const response = { "Status": "Failure", msg: "OTP not Provided" }
      return res.status(400).send(response)
    }
    if (!email) {
      const response = { "Status": "Failure", msg: "Email not Provided" }
      return res.status(400).send(response)
    }
    if (!otp_instance_id) {
      const response = { "Status": "Failure", msg: "otp_instance_id not Provided" }
      return res.status(400).send(response)
    }

    //Connecting to MongoDB using Mongo Client
    let client = await database.getClient();

    const otp_instance = await client.db(DB_NAME).collection(USER_OTP).findOne({ otp_instance_id, email });

    //Check if OTP is available in the DB
    if (otp_instance != null) {

      //Check if OTP is already used or not
      if (otp_instance.verified != true) {
        // console.log("otp", otp_instance.expiration_time.getTime(), "current", currentdate);

        //Check if OTP is expired or not
        if (currentdate <= otp_instance.expiration_time.getTime()) {

          //Check if OTP is valid or not
          if (otp == otp_instance.otp) {

            let verify = await client.db(DB_NAME).collection(USER_OTP).updateOne({ otp_instance_id }, { $set: { verified: true, updatedOn: new Date().getTime() } });
            if (verify) {
              let user = await client.db(DB_NAME).collection(USER_AUTH).findOneAndUpdate(
                { email: email },
                {
                  $set: { isVerified: true, }

                }
              );
            }
            // Generate access token
            let accesToken = await getAccessToken(email);

            // Generate refresh token 
            let refreshToken = await getRefreshToken(email);
            console.log("verifyOtp api successfully executed");
            return res.status(200).send({
              Success: true, msg: "Otp Verified Successfully",
              email, 
              accesToken,              
              refreshToken,
            })

          } else {
            const response = { "Success": false, msg: "OTP NOT Matched" }
            return res.status(400).send(response)
          }

        }
        else {
          const response = { Success: false, msg: "OTP Expired" }
          return res.status(400).send(response)
        }

      } else {
        const response = { Success: false, msg: "OTP Already Used" }
        return res.status(400).send(response)

      }
    } else {
      const response = { "Success": false, msg: " Invalid Otp instance " }
      return res.status(400).send(response)
    }


  } catch (error) {
    console.log(error);
    const response = { "Status": "API Failure", "Details": error.message }
    return res.status(400).send(response)

  }

}

exports.changePassword =async (req, res) => {

  try {

    console.log("change Password api Triggered");    
   
    let client = await database.getClient();
   let result = await client.db(DB_NAME).collection(USER_AUTH).findOneAndUpdate({email:req.body.email}, {$set:{  password: bcryptjs.hashSync(req.body.password, 7),}});
    if(result){
      return res.status(200).send({
        Success: true, msg: "Password changed Successfully",        
      })
    }else{

      const response = { "Success": false, msg: " Password change failed " }
      return res.status(400).send(response)

    }
  } catch (error) {
    const response = { "Status": "API Failure", "msg": error.message }
    return res.status(400).send(response)
    
  }
}
