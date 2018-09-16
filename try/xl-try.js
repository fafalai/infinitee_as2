var xl = require('xlsx-template');
var fs = require('fs');

fs.readFile
(
  '/Users/iwu/Documents/WebStormProjects/as1/routes/uploads/invoicetemplates/template1.xlsx',
  function(err, data)
  {
    var sheetno = 1;
    var template = new xl(data);
    var blob = null;

    /*
    var values =
    {
      orderinvoiceno: 'ORD500-500',
      product:
      [
        {
          code: 'P-100',
          name: 'Brick cup',
          price: '20.00',
          gst: '2.00',
          qty: '54',
          subtotal: '100.00'
        },
        {
          code: 'P-110',
          name: 'Paper bowl',
          price: '2.50',
          gst: '0.25',
          qty: '7',
          subtotal: '50.60'
        }
      ]
    };
    */
    var values =
    {
      orderinvoiceno: 'INV-009',
      orderorderno: 'ORDER-009',
      orderpono: 'PO-009',
      orderinvoicedate: '2016-02-03',
      custname: 'Acme Pty',
      custaddress1: '526 Whitehorse Rd',
      custaddress2: null,
      custcity: null,
      custpostcode: '3132',
      custstate: 'VIC',
      custcountry: null,
      ordertotal: 95.45,
      product:
      [
        {
          code: 'P-100',
          name: 'Brick cup',
          price: '20.00',
          gst: '2.00',
          qty: '54',
          subtotal: '100.00'
        },
        {
          code: 'P-110',
          name: 'Paper bowl',
          price: '2.50',
          gst: '0.25',
          qty: '7',
          subtotal: '50.60'
        }
      ]
    };

    template.substitute(sheetno, values);
    blob = template.generate();
    fs.writeFile('out.xlsx', blob, 'binary');
  }
);
