import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import fs from 'node:fs';

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const input = fs.readFileSync('./emails/login.mjml', { encoding: 'utf8' });
const options = { filePath: './emails' };
const htmlOutput = mjml2html(input, options);

const mailOptions = {
  from: 'flo@rueberg.eu',
  to: 'florian@rueberg.eu',
  subject: 'Subject',
  html: htmlOutput.html,
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
    // do something useful
  }
});
