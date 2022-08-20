const { DB_NAME, SEQUENCE_COLLECTION_NAME } = require("../constants/database");

const AddMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

const getTime = () => {
   return new Date().getTime()
}
  
const subject_mail_verification = "OTP For Email Verification"
const subject_forget_password = "OTP For Password reset"

const mail_verification_message = (otp) =>{
    return `<html><body style=\"width: 620px;margin: 3em auto;border: 1px #ccc solid;\"><div><div style=\"background-color: #46B9E5;padding: 10px 0;margin-bottom: 10px;\"><center><img style=\"text-align: center;margin: 0;margin-bottom: 10px;\" src=\"${process.env.IMAGE_URL}\" width=\"90\"></center></div><div style=\"margin-left: 10px;\">Dear User,<br><br><div><div style=\"text-indent: 60px;line-height: 23px;font-style: italic;\"><strong style=\"color:#26374b\">${otp}</strong>  is the One Time Password (OTP) for your Email Verification to the Aviator Co2.OTP is valid for next <strong style=\"color:#26374b\">2</strong> minutes. Do not share the OTP with anyone for security reasons. <br><br><br> </div> </div><address>Regards,<br> <b>Aviator Co2</b><br><br><br><p style=\"color:gray;text-align: center;font-size:12px\">Note:This is system generated message you are requested not to reply this.</p> </address></div> </div></body></html>`
}
const forget_password_message = (otp) =>{
    return `<html><body style=\"width: 620px;margin: 3em auto;border: 1px #ccc solid;\"><div><div style=\"background-color: #46B9E5;padding: 10px 0;margin-bottom: 10px;\"><center><img style=\"text-align: center;margin: 0;margin-bottom: 10px;\" src=\"${process.env.IMAGE_URL}\" width=\"90\"></center></div><div style=\"margin-left: 10px;\">Dear User,<br><br><div><div style=\"text-indent: 60px;line-height: 23px;font-style: italic;\"><strong style=\"color:#26374b\">${otp}</strong>  is the One Time Password (OTP) for Password reset to the Aviator Co2 Account.OTP is valid for next <strong style=\"color:#26374b\">2</strong> minutes. Do not share the OTP with anyone for security reasons. <br><br><br> </div> </div><address>Regards,<br> <b>Aviator Co2</b><br><br><br><p style=\"color:gray;text-align: center;font-size:12px\">Note:This is system generated message you are requested not to reply this.</p> </address></div> </div></body></html>`
}

const generateRequestId = () => {
  return getTime() + "" + Math.floor(Math.random() * 1000 + 1);
};

// generates a new sequence number for the sequenceId
async function getNextSequence(client, sequenceId) {
  if (!sequenceId) {
    throw new Error("sequenceId is missing");
  }
  const result = await client
    .db(DB_NAME)
    .collection(SEQUENCE_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: sequenceId },
      { $inc: { currVal: 1 } },
      { returnNewDocument: true, upsert: true, returnOriginal: false }
    );
  return result.value.currVal;
}

const getEpochTime = () => {
  return Math.floor(new Date().getTime() / 1000);
};

module.exports = {
  AddMinutesToDate,
  subject_mail_verification,
  mail_verification_message,
  forget_password_message,
  subject_forget_password,
  generateRequestId,
  getTime,
  getNextSequence,
  getEpochTime,
};
