import "dotenv/config";

import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const config: SMTPTransport | SMTPTransport.Options = {
  service: "gmail",
  auth: {
    user: process.env.GMAIL_APP_USER as string,
    pass: process.env.GMAIL_APP_PASSWORD as string,
  },
};

const transporter = nodemailer.createTransport(config);

export default transporter;
