const nodemailer = require("nodemailer");
const user = "eman.ironnon2022@gmail.com";
const pass= "xxxxxxxx";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: user,
    pass: pass,
  },
});
module.exports=transport;