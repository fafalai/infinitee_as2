var nm = require('nodemailer');

var poolconfig =
{
  pool: true,
  host: 'mail.adtalkserver.net',
  port: 25,
  secure: false,
  secureConnection: false,
  logger: true,
  debug: true,
  auth:
  {
    user: 'noreply@bigaccounting.com.au',
    pass: 'fiRe=$$=99'
  }
};

var transporter = nm.createTransport(poolconfig);

var mo =
{
  from: '"Fluir Invoice" <noreply@bigaccounting.com.au>',
  to: '"Ian Fluir Test" <ian@bigaccounting.com.au>',
  subject: 'Fluir Invoice Email Test',
  text: 'plain text version..',
  html: '<strong><h1>HTML</h1></strong> version<br />'
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

/*
var nm = require('nodemailer');
var smtp = require('nodemailer-smtp-transport');

createSMTPTransport = function()
{
  var transporter = nm.createTransport
  (
    smtp
    (
      {
        pool: true,
        secure: false,
        host: 'outbound.mailhop.org',
        port: 25,
        auth:
        {
          user: 'ecom88',
          pass: '5BrokegirlS'
        }
      }
    )
  );

  return transporter;
};

var transporter = createSMTPTransport();

transporter.sendMail
(
  {
    from: 'noreply@bigaccounting.com.au',
    to: 'ian@bigaccounting.com.au',
    subject: 'foo==',
    html: '<b>hello</b> world... =='
  },
  function(err, info)
  {
    console.log(info);
    console.log(err);
  }
);
*/