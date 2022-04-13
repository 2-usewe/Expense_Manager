const nodemailer = require("nodemailer");
const user = "eman.iron2022@gmail.com";
const pass= "Emaniron2022@";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: user,
    pass: pass,
  },
});
module.exports=transport;