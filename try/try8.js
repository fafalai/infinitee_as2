var nodemailer = require('nodemailer');
var mailpoolconfig =
{
  pool: true,
  host: 'mail.adtalkserver.net',
  port: 25,
  secure: false,
  auth:
  {
    user: 'noreply@adtalk.services',
    pass: 'adtalk$$00'
  }
};
var transporter = nodemailer.createTransport(mailpoolconfig);
var mo =
{
  from: '"Fluir TimeTaps" <noreply@adtalk.services>',
  to: 'ian@thewufamily.com',
  subject: 'Fluir Time Data',
  html: 'TimeTaps data from <strong>Foobar</strong>'
};

transporter.sendMail
(
  mo,
  function(err, info)
  {
    console.log(err);
    console.log(info);
  }
);
