// *******************************************************************************************************************************************************************************************
// Modules used locally only...
var https = require('https');
var http = require('http');
var bunyan = require('bunyan');
var uuidv4 = require('uuid/v4');
var primus = require('primus');
var prrooms = require('primus-redis-rooms');
var pe = require('primus-emit');
var prop = require('properties');
var ekg = require('ekg');
var redis = require('redis');
var express = require('express');
var connect = require('connect');
var os = require('os-utils');
var cors = require('cors');
var multipart = require('connect-multiparty');
var cronjob = require('cron').CronJob;

// *******************************************************************************************************************************************************************************************
// Globally avail vars...
global.pg = require('pg');
global.pgtx = require('pg-transaction');
global.json3 = require('json3');
global.bignumber = require('decimal.js');
global.rsvp = require('rsvp');
global.moment = require('moment');
global.validator = require('validator');
global.httpget = require('simple-get');
global.concat = require('concat-stream');
global.mailer = require('nodemailer');
global.smtptransport = require('nodemailer-smtp-transport');
global.humanize = require('humanize');
global.deepcopy = require('deepcopy');
global.jssha = require('jssha');
global.hat = require('hat');
global.accounting = require('accounting');
global.async = require('async');
global.fs = require('fs');
global.path = require('path');
global.xlwriter = require('xlsx-template');
global.xlreader = require('node-xlsx');
global.exceljs = require('exceljs');
global.exceljs.config.setValue('promise', require('bluebird'));
global.oxr = require('open-exchange-rates');
global.fx = require('money');
global.diceware = require('diceware-password-generator');
global._geocoder = require('node-geocoder');
//
global.users = redis.createClient();
global.customers = redis.createClient();
global.rtaps = redis.createClient();

// *******************************************************************************************************************************************************************************************
// Our own modules... prefix with "mod" so we can tell...
global.modcounters = require('./modules/counters');
global.modauth = require('./modules/auth');
global.modaccounts = require('./modules/accounts');
global.modjournals = require('./modules/journals');
global.modclients = require('./modules/clients');
global.modsuppliers = require('./modules/suppliers');
global.modemployees = require('./modules/employees');
global.modlocations = require('./modules/locations');
global.modproducts = require('./modules/products');
global.modinventory = require('./modules/inventory');
global.modorders = require('./modules/orders');
global.modporders = require('./modules/porders');
global.modinvoices = require('./modules/invoices');
global.modmsg = require('./modules/msg');
global.modmdm = require('./modules/mdm');
global.modalerts = require('./modules/alerts');
global.modxr = require('./modules/xr');
global.modconfig = require('./modules/config');
global.modipad = require('./modules/ipad');
global.modhelpers = require('./modules/helpers');
global.modimport = require('./modules/import');
global.modprinting = require('./modules/printing');
global.modreports = require('./modules/reports');
global.modpayroll = require('./modules/payroll');
global.modscripts = require('./modules/scripts');
global.modpos = require('./modules/pos');
global.modgov = require('./modules/gov');
// Custom implementations
global.modtpcc = require('./modules/tpcc');

// *******************************************************************************************************************************************************************************************
// Reusable text...
global.eventerror = 'eventerror';
global.custchannelprefix = 'custchannel.';
//
global.text_performingquery = 'Performing query...';
global.text_success = 'Success...';
global.text_generalexception = 'General exception...';
global.text_dbexception = 'Database exception...';
global.text_invalidparams = 'Invalid params...';
global.text_missingparams = 'Missing params...';
global.text_nodbconnection = 'Unable to acquire db connection...';
global.text_notxstart = 'Unable to start transaction...';
global.text_notloggedin = 'Not logged in...';
global.text_sessionexpired = 'Session has expired...';
global.text_commsproblem = 'Comms problem...';
global.text_insertingrow = 'Inserting row...';
global.text_fileio = 'File I/O...';
global.text_tx = 'Transaction error...';
global.text_nodata = 'No data...';
global.text_invalidsession = 'Invalid session...';
global.text_invalidclient = 'Invalid client...';
global.text_unablerestoresession = 'Unable to restore session...';
global.text_invalidlogin = 'Invalid login...';
global.text_committx = 'Unable to committing transaction...';
global.text_unableparsejson = 'Unable to parse json string...';
global.text_emptyjson = 'Undefined, null or empty JSON string...';
global.text_unablestringifyjson = 'Undefined, null or empty object...';
global.text_userexists = 'User already exists...';
global.text_useralreadyregistered = 'User is already registered...';
global.text_usernotregistered = 'User is not registered...';
global.text_unablecreatenewuser = 'Unable to create new user...';
global.text_unableloginuser = "Unable to login user...";
global.text_unablesaveclient = "Unable to save client...";
global.text_unablesaveemployee = "Unable to save employee...";
global.text_unablenewlocation = "Unable to add new location...";
global.text_unablenewproduct = "Unable to add new product...";
global.text_unablesaveproductprice = "Unable to save product price...";
global.text_unablesaveproducttemplate = "Unable to save product template...";
global.text_unablesaveproducttemplatedetails = "Unable to save product template details...";
global.text_unablesaveprodcat = "Unable to save product category...";
global.text_unablesaveinventory = "Unable to save inventory...";
global.text_unablenewtaxcode = "Unable to add new tax code...";
global.text_unablesavetaxcode = "Unable to save tax code...";
global.text_unablenewaccount = "Unable to add new account...";
global.text_unablenewclient = "Unable to add new client...";
global.text_unableneworderdetail = "Unable to add new order product";
global.text_unableneworderstatus = "Unable to add new corder status...";
global.text_unablenewproductprice = "Unable to add new product price...";
global.text_unablenewproductcategory = "Unable to add new product category...";
global.text_unablenewproducttemplate = "Unable to add new product template...";
global.text_unablenewproducttemplatedetail = "Unable to add new product to template...";
global.text_unablenewbuildtemplatedetail = "Unable to add new product to build template...";
global.text_unablenewbuildttemplate = "Unable to add new build template...";
global.text_unablenewbuildtemplatedetail = "Unable to add new product to build template...";
global.text_unablenewbuildheader = "Unable to build inventory...";
global.text_unableneworder = "Unable to add new order...";
global.text_unablenewlistpricecode = "Unable to add new list price code...";
global.text_unablenewdiscountcode = "Unable to add new discount code...";
global.text_unablesavenotes = "Unable to save notes...";
global.text_unablegetuserauthdetails = "Unable to get user auth details...";
global.text_unablegetuseruuid = "Unable to get user\' uuid...";
global.text_unablegetidfromuuid = "Unable to get id from uuid...";
global.text_unabledeleteentry = "Unable to delete this entry...";
global.text_unablesaveorder = "Unable to save order...";
global.text_unablesaveorderdetail = "Unable to save order detail...";
global.text_unablegetorderversion = "Unable retrieve current order version...";
global.text_unablefetchorderdetail = "Unable to fetch order detail...";
global.text_unablefetchorderAttachment = "Unable to fetch order attachment...";
global.text_unablenextorderno = "Unable to fetch next order number...";
global.text_unablenextporderno = "Unable to fetch next purchase order number...";
global.text_unablenextjournalno = "Unable to fetch next journal number...";
global.text_unablenextclientno = "Unable to fetch next client number...";
global.text_unablenextsupplierno = "Unable to fetch next supplier number...";
global.text_unablenextempno = "Unable to fetch next employee number...";
global.text_unablenextjobsheetno = "Unable to fetch next job sheet number...";
global.text_unablenextbarcodeno = "Unable to fetch next barcode number...";
global.text_unableexpireprodcat = "Unable to expire product category...";
global.text_unableexpireproducttemplate = "Unable to expire product template...";
global.text_unableexpirebuildtemplate = "Unable to expire build template...";
global.text_unableexpireaccount = "Unable to expire account...";
global.text_unableexpirelocation = "Unable to expire location...";
global.text_unableexpireemployee = "Unable to expire employee...";
global.text_unableexpireclient = "Unable to expire client...";
global.text_unablenextinvoiceno = "Unable to fetch next invoice number...";
global.text_invalidfieldupdate = "Invalid field for update...";
global.text_invaliduser = "Invalid user or user not found...";
global.text_unableparseuser = "Unable to parse user info...";
global.text_unablegetbuildtemplateheader = "Unable to fetch build template definition...";
global.text_noordertemplate = "Unable to find an order template...";
global.text_noinvoicetemplate = "Unable to find an invoice template...";
global.text_noprinttemplate = "Unable to find system print template...";
global.text_nodeliverydockettemplate = "Unable to find a delivery docket template...";

//global.text_newcode = 'NEWCODE';
global.text_newcode = '';
global.text_newuid = 'userid';
global.text_nunablegetcommitstatuscode = 'Error retrieving commit status code...';
global.text_unablegetcustconfig = 'Unable to retrieve customer config...';
global.text_unableemail = 'Unable to send email...';
global.text_unableabnlookup = 'Unable to lookup ABN...';

// *******************************************************************************************************************************************************************************************
// Error codes
global.errcode_none = 0;
global.errcode_nodata = -1;
global.errcode_missingparams = -2;
global.errcode_fatal = -3;
global.errcode_notloggedin = -4;
global.errcode_sessionexpired = -5;
global.errcode_resourceunavail = -6;
global.errcode_dbunavail = -7;
global.errcode_userexists = -8;
global.errcode_dberr = -9;
global.errcode_fileerr = -10;
global.errcode_usernotregistered = -11;
global.errcode_passwdhash = -12;
global.errcode_invalidconnection = -13;
global.errcode_invalidlogin = -14;
global.errcode_missingurl = -15;
global.errcode_smserror = -16;
global.errcode_invalidsession = -17;
global.errcode_invalidclient = -18;
global.errcode_unablerestoresession = -19;
global.errcode_committx = -20;
global.errcode_jsonparse = -21;
global.errcode_jsonstringify = -22;
global.errcode_unablecreatenewuser = -23;
global.errcode_unableloginuser = -24;
global.errcode_unablesaveclient = -25;
global.errcode_unablesaveproduct = -26;
global.errcode_insufficientqty = -27;
global.errcode_invaliduser = -28;
global.errcode_unableoarseuser = -29;
global.errcode_unablegetcommitstatuscode = -30;
global.errcode_unablegetcustconfig = -31;

// *******************************************************************************************************************************************************************************************
// iTypes...
global.itype_inventory_xfer = 1;
global.itype_inventory_adjust = 2;
global.itype_inventory_order = 3;
global.itype_inventory_stock = 4;
global.itype_inventory_build = 5;
global.itype_inventory_porder = 6;

global.itype_journal_sales = 1;
global.itype_journal_purchases = 2;
global.itype_journal_payroll = 3;
global.itype_journal_cashreceipts = 4;
global.itype_journal_cashdisbursements = 5;
global.itype_journal_general = 6;
global.itype_journal_inventory_purchase = 7;
global.itype_journal_inventory_sale = 8;
global.itype_journal_adjustment = 99;

global.itype_account_asset = 1;
global.itype_account_expense = 2;
global.itype_account_liability = 3;
global.itype_account_equity = 4;
global.itype_account_income = 5;
global.itype_account_costofgoodssold = 6;
global.itype_account_otherincome = 7;
global.itype_account_otherexpenses = 8;
global.itype_account_bank = 99;

// Order statuses
global.itype_os_comment = 0;
global.itype_os_quote = 1;
global.itype_os_order = 2;
global.itype_os_invoiced = 3;
global.itype_os_poreceived = 4;
global.itype_os_depositpaid = 5;
global.itype_os_paid = 6;

global.itype_os_approved = 100;
global.itype_os_pending = 101;
global.itype_os_onhold = 102;
global.itype_os_completed = 103;
global.itype_os_backorder = 104;
global.itype_os_orderprocessed = 105;

global.itype_os_manufacturing = 200;
global.itype_os_picking = 201;
global.itype_os_readyfordespatch = 202;
global.itype_os_shipped = 203;

global.itype_os_artworkapproved = 300;
global.itype_os_platesordered = 301;
global.itype_os_platesreceived = 302;
global.itype_os_printing = 303;
global.itype_os_printingcompleteed = 304;
global.itype_os_cutting = 305;
global.itype_os_cuttingcompleted = 306;
global.itype_os_forming = 307;
global.itype_os_productbuilt = 308;
//
global.itype_os_jobsheet = 8000;

// Jobsheet detail statuses
global.itype_js_printer = 1;
global.itype_js_printer_complete = 2;
global.itype_js_cutter = 3;
global.itype_js_cutter_complete = 4;
global.itype_js_build = 5;
global.itype_js_build_complete = 6;

//
global.itype_pr_deposit = 1;
global.itype_pr_order = 2;
global.itype_pr_other = 99;
//
global.itype_bc_codabar = 0;
global.itype_bc_code11 = 1;
global.itype_bccode29 = 2;
global.itype_bc_code93 = 3;
global.itype_bc_code128 = 4;
global.itype_bc_ean8 = 5;
global.itype_bc_ean13 = 6;
global.itype_bc_std25 = 7;
global.itype_bcint25 = 8;
global.itype_bc_msi = 9;
global.itype_bc_datamatrix = 10;
//
global.itype_at_assets = 1;
global.itype_at_expenses = 1;
global.itype_at_liabilities = 1;
global.itype_at_equities = 1;
global.itype_at_revenues = 1;
global.itype_at_costgoodssold = 1;
global.itype_at_otherrevenue = 1;
global.itype_at_otherexpenses = 1;
//
global.itype_ims_chat = 1;
//
global.itype_employmentstatus_employed = 1;
global.itype_employmentstatus_suspended = 2;
global.itype_employmentstatus_onleave = 3;
//
global.itype_order_order = 1;
global.itype_order_invoice = 2;
global.itype_order_quote = 3;
global.itype_order_deliverydocket = 4;
//
global.itype_payfrequency_weekly = 1;
global.itype_payfrequency_fortnightly = 2;
global.itype_payfrequency_monthly = 3;
//
global.employmenttype_fulltime = 1;
global.employmenttype_parttime = 2;
global.employmenttype_casual = 3;
global.employmenttype_fixedterm = 4;
global.employmenttype_contract = 5;
global.employmenttype_apprentice = 6;
//
global.itype_taxtable_taxfreethreshold = 1;
global.itype_taxtable_notaxfreethreshold = 2;
//
global.itype_paymenttype_cc = 1;
global.itype_paymenttype_cheque = 2;
global.itype_paymenttype_eft = 3;
global.itype_paymenttype_cash = 4;
global.itype_paymenttype_other = 99;
//
global.itype_paymentreason_deposit = 1;
global.itype_paymentreason_order = 2;
global.itype_paymentreason_pos = 3;
global.itype_paymentreason_other = 99;
//
global.bignumber.config({precision: 10, rounding: global.bignumber.ROUND_HALF_UP});
//
global.transporter = null;
//
global.avatars = '';
//
global.tzoffset_server = global.moment().toDate().getTimezoneOffset();

// *******************************************************************************************************************************************************************************************
// Underscore stuff...
__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());

__.mixin
(
  {
    serverToLocalTime: function(d, tzoffset_client)
    {
      var dt = moment(d);

      dt.add(global.tzoffset_server, 'minutes').subtract(tzoffset_client, 'minutes');

      return dt;
    }
  }
);

__.mixin
(
  {
    removeSpaces: function(s)
    {
      return s.replace(/ /g, '');
    }
  }
);

__.mixin
(
  {
    toType: function(obj)
    {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
  }
);

__.mixin
(
  {
    decodeURIFromPHP: function(u)
    {
      return decodeURIComponent((u + '').replace(/\+/g, '%20'));
    }
  }
);

__.mixin
(
  {
    // Using for/swap method - way way way faster than array.reverse on all browsers, especially Google V8...
    reverseArray: function(a)
    {
      var len = a.length;
      var left = null;
      var right = null;
      for (left = 0, right = len - 1; left < right; left += 1, right -= 1)
      {
        var t = a[left];
        a[left] = a[right];
        a[right] = t;
      }
      return a;
    }
  }
);

__.mixin
(
  {
    toBigNum: function(n)
    {
      if (__.isUndefined(n) || __.isNull(n) || isNaN(n) || __.isBlank(n) || (n == 0))
        return new global.bignumber(0.0);

      if (n instanceof global.bignumber)
        return n;

      return new global.bignumber(n);
    }
  }
);

__.mixin
(
  {
    sanitiseAsBool: function(b)
    {
      if (typeof b == 'string')
      {
        if ((b == 'true') || (b == '1'))
          return 1;
        return 0;
      }

      if (!__.isUndefined(b) && !__.isNull(b) && !isNaN(b) && !__.isBlank(b) && ((b == 1) || (b === true)))
        return 1;

      return 0;
    }
  }
);

__.mixin
(
  {
    sanitiseAsBigInt: function(n, nulliszero)
    {
      if (__.isUndefined(n) || __.isNull(n) || isNaN(n) || __.isBlank(n))
        return __.isUndefined(nulliszero) || (nulliszero == false) ? null : 0.0;

      if (isNaN(parseFloat(n)) || !isFinite(n))
        return __.isUndefined(nulliszero) || (nulliszero == false) ? null : 0.0;

      if (!(n instanceof global.bignumber))
        n = new global.bignumber(n);

      return n.toFixed(0);
    }
  }
);

__.mixin
(
  {
    sanitiseAsPrice: function(p, decimals)
    {
      var n = global.accounting.unformat(p);
      return __.formatnumber(n, decimals, false);
    }
  }
);

__.mixin
(
  {
    notNullNumeric: function(n, decimals)
    {
      if (__.isUndefined(n) || __.isNull(n) || isNaN(n) || __.isBlank(n))
        return 0.0000;

      var bn = new global.bignumber(n);
      return bn.toFixed(__.isUndefined(decimals) ? 4 : decimals);
    }
  }
);

__.mixin
(
  {
    formatuomsize: function(n)
    {
      if (__.isUndefined(n) || __.isNull(n) || isNaN(n) || __.isBlank(n) || (n == 0))
        return 1.0;

      var bn = new global.bignumber(n);
      return bn.toFixed(4);
    }
  }
);

__.mixin
(
  {
    formatnumber: function(n, decimals, zeroisnull)
    {
      if (__.isUndefined(n) || __.isNull(n) || isNaN(n) || __.isBlank(n) || (n == 0))
      {
        if (!__.isUndefined(zeroisnull) && (zeroisnull === true))
          return null;
        return 0.0;
      }

      var bn = new global.bignumber(n);
      return bn.toFixed(__.isUndefined(decimals) ? 4 : decimals);
    }
  }
);

__.mixin
(
  {
    niceformatnumber: function(n, decimals, zeroasblank)
    {
      if (__.isUndefined(n) || __.isNull(n) || isNaN(n) || __.isBlank(n) || (n == 0))
        return __.isUndefined(zeroasblank) || (zeroasblank == true) ? '' : 0.0;

      var d = __.isUndefined(decimals) ? 4 : decimals;

      if (!(n instanceof global.bignumber))
        n = global.bignumber(n);

      return global.accounting.formatNumber(n.toFixed(d), d, ',');
    }
  }
);

__.mixin
(
  {
    sanitiseAsTrimString: function(s, maxlen)
    {
      if (!__.isUndefined(s) && !__.isNull(s) && !__.isBlank(s))
      {
        if (!__.isString(s))
          s = s.toString();

        var m = (__.isUndefined(maxlen) || __.isNull(maxlen)) ? 2000 : maxlen;
        // Alternative __.prune(s, m) but may add extra '...' characters to overall length
        return s.trim().substr(0, m);
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsString: function(s, maxlen)
    {
      if (!__.isUndefined(s) && !__.isNull(s) && !__.isBlank(s))
      {
        if (!__.isString(s))
          s = s.toString();

        var m = (__.isUndefined(maxlen) || __.isNull(maxlen)) ? 2000 : maxlen;
        // Alternative __.prune(s, m) but may add extra '...' characters to overall length
        return s.substr(0, m);
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsComment: function(c, maxlen)
    {
      if (!__.isUndefined(c) && !__.isNull(c) && !__.isBlank(c))
        return __.sanitiseAsString(__.escapeHTML(c));

      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsDate: function(d)
    {
      if (!__.isUndefined(d) && !__.isNull(d) && !__.isBlank(d))
      {
        if (__.isString(d))
          return new global.moment(d).format('YYYY-MM-DD HH:mm:ss');
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsDateOnly: function(d)
    {
      if (!__.isUndefined(d) && !__.isNull(d) && !__.isBlank(d))
      {
        if (__.isString(d))
          return new global.moment(d).format('YYYY-MM-DD');
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsFriendlyDate: function(d)
    {
      if (!__.isUndefined(d) && !__.isNull(d) && !__.isBlank(d))
          return new global.moment(d).format('MMMM Do YYYY, h:mm a');
      return '';
    }
  }
);

__.mixin
(
  {
    stripnonnumeric: function(s)
    {
      s += '';
      var rgx = /^\d|\.|-$/;
      var out = '';

      for (var i = 0; i < s.length; i++)
      {
        if (rgx.test(s.charAt(i)))
        {
          if (!(((s.charAt(i) == '.') && (out.indexOf('.') != -1)) || ((s.charAt(i) == '-') && (out.length != 0))))
            out += s.charAt(i);
        }
      }
      return out;
    }
  }
);

__.mixin
(
  {
    incString: function(input)
    {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz';
      var length = alphabet.length;
      var result = input;
      var i = input.length;

      while (i >= 0)
      {
        var last = input.charAt(--i);
        var next = '';
        var carry = false;

        if (isNaN(last))
        {
          index = alphabet.indexOf(last.toLowerCase());

          if (index === -1)
          {
            next = last;
            carry = true;
          }
          else
          {
            var isUpperCase = last === last.toUpperCase();

            next = alphabet.charAt((index + 1) % length);
            if (isUpperCase)
              next = next.toUpperCase();

            carry = index + 1 >= length;

            if (carry && (i === 0))
            {
              var added = isUpperCase ? 'A' : 'a';

              result = added + next + result.slice(1);
              break;
            }
          }
        }
        else
        {
          next = +last + 1;
          if (next > 9)
          {
            next = 0;
            carry = true;
          }

          if (carry && (i === 0))
          {
            result = '1' + next + result.slice(1);
            break;
          }
        }

        result = result.slice(0, i) + next + result.slice(i + 1);
        if (!carry)
          break;
      }
      return result;
    }
  }
);

__.mixin
(
  {
    hasstring: function(s1, s2)
    {
      return s1.indexOf(s2) > -1;
    }
  }
);

__.mixin
(
  {
    makeaddress: function(a)
    {
      var nice = __.isUndefined(a.nice) || __.isNull(a.nice) ? false : a.nice;
      var address1 = __.isUndefined(a.address1) || __.isNull(a.address1) ? '' : __.titleize(a.address1);
      var city = __.isUndefined(a.city) || __.isNull(a.city) ? '' : __.titleize(a.city);
      var state = __.isUndefined(a.state) || __.isNull(a.state) ? '' : __.titleize(a.state);
      var postcode = __.isUndefined(a.postcode) || __.isNull(a.postcode) ? '' : a.postcode;
      var country = __.isUndefined(a.country) || __.isNull(a.country) ? '' : __.titleize(a.country);
      var address = address1;

      if (city != '')
      {
        if (address == '')
          address = city;
        else
        {
          if (nice)
            address = address + ',<br/>' + city;
          else
            address = address + ', ' + city;
        }
      }

      if (state != '')
      {
        if (address == '')
          address = state;
        else
        {
          if (nice)
            address = address + ',<br/>' + state;
          else
            address = address + ', ' + state;
        }
      }

      if (postcode != '')
      {
        if (address == '')
          address = postcode;
        else
          address = address + ' ' + postcode;
      }

      if (country != '')
      {
        if (address == '')
          address = country;
        else
        {
          if (nice)
            address = address + ',<br/>' + country;
          else
            address = address + ', ' + country;
        }
      }

      return address;
    }
  }
);

__.mixin
(
  {
    humaniseTimeInMinutes: function(m)
    {
      var txt = '';
      var hours = Math.floor(m / 60);
      var minutes = m - (hours * 60);

      if (hours > 0)
      {
        // var txt = '';
        txt = '';

        if (hours == 1)
          txt = '1 hour';
        else
          txt = hours + ' hours';

        if (minutes > 0)
        {
          if (minutes == 1)
            txt += ', 1 minute';
          else
            txt += ', ' + minutes + ' minutes';
        }
      }
      else
      {
        if (minutes > 0)
        {
          if (minutes == 1)
            txt = 'A minute';
          else
            txt = minutes + ' minutes';
        }
      }
      return txt;
    }
  }
);

__.mixin
(
  {
    makeisomobile: function(m)
    {
      // Strip all non-numeric characters - so hopefully end up with something like 0433123456
      // Then strip out the leading zero and replace with +61
      var n = __.stripnonnumeric(m);

      if (n.substring(0, 1) == '0')
        n = '+' + global.config.defaults.defaultmobilecountryprefix + n.substring(1);

      return n;
    }
  }
);

__.mixin
(
  {
    isUNB: function(d)
    {
      return __.isUndefined(d) || __.isNull(d) || __.isBlank(d);
    }
  }
);

__.mixin
(
  {
    isUN: function(d)
    {
      return __.isUndefined(d) || __.isNull(d);
    }
  }
);

// *******************************************************************************************************************************************************************************************
// Global helper functions...
global.ConsoleLog = function(txt)
{
  if (global.config.env.debug)
    console.log(txt);
};

global.fileExists = function(f)
{
  // global.ConsoleLog("file exists function");
  // global.ConsoleLog(global.config.env.localfs);
  // global.ConsoleLog(global.config.env.localfs + f);
  // if (global.fs.existsSync(global.config.env.localfs + f))
  //   return true;
  // return false;
  if (global.fs.existsSync(f))
    return true;
  return false;
};

global.ensureFolderExists = function(path, mask, cb)
{
  // Allow the `mask` parameter to be optional
  if (typeof mask == 'function')
  {
    cb = mask;
    mask = 0777;
  }

  global.fs.mkdir
  (
    path,
    mask,
    function(err)
    {
      if (!err)
        cb(null);
      else
      {
        // Ignore the error if the folder already exists
        if (err.code == 'EEXIST')
          cb(null);
        else
          cb(err);
      }
    }
  );
};

global.doAttachmentImageURL = function(orderid, attachmentid, attachmentname, mimetype)
{
  var image = '';

  if (global.isMimeTypeImage(mimetype))
    image = global.config.folders.orderattachments + attachmentid + '_' + orderid + '_' + attachmentname;

  return image;
};

global.doJobSheetImageURL = function(jobsheetid, imagename, mimetype)
{
  var image = '';

  if (global.isMimeTypeImage(mimetype))
    image = global.config.folders.jobsheetimages + jobsheetid + '_' + imagename;

  return image;
};

global.StringArrayToString = function(a)
{
  var s = '';

  if (a.length > 0)
  {
    s = '\'' + a[0] + '\'';
    for (var i = 1; i < a.length; i++)
      s += ',\'' + a[i] + '\'';
  }

  return s;
};

global.safejsonstringify = function(obj, callback)
{
  try
  {
    if (!__.isUndefined(obj) && !__.isNull(obj) && !__.isEmpty(obj))
      return callback(null, global.json3.stringify(obj));
    return callback({message: global.text_unablestringifyjson}, null);
  }

  catch (err)
  {
    return callback(err, null);
  }
};

global.safejsonparse = function(json, callback)
{
  try
  {
    if (!__.isUndefined(json) && !__.isNull(json) && (json != ''))
      return callback(null, global.json3.parse(json));
    return callback({message: global.text_unableparsejson}, null);
  }

  catch (err)
  {
    return callback(err, null);
  }
};

// Example how to iterate through Redis hash keys...
global.userFromUid = function(uid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.users.keys
      (
        global.config.redis.prefix + '*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;

            if (keycount > 0)
            {
              uid = uid.toUpperCase();
              keys.some
              (
                function(k)
                {
                  global.users.get
                  (
                    list[k],
                    function(err, uuidobj)
                    {
                      if (!err)
                      {
                        global.safejsonparse
                        (
                          uuidobj,
                          function(err, uo)
                          {
                            if (!err)
                            {
                              if (uo.uid.toUpperCase() == uid)
                                resolve(uo);
                            }
                          }
                        );
                      }

                      // Finished searching - if haven't found it, reject(), if we had already found it, resolve() would have already been called...
                      if (--keycount == 0)
                        reject(undefined);
                    }
                  );
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.userFromUserid = function(userid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.users.keys
      (
        global.config.redis.prefix + '*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;

            if (keycount > 0)
            {
              userid = __.makeBigInt(userid);
              keys.some
              (
                function(k)
                {
                  global.users.get
                  (
                    list[k],
                    function(err, uuidobj)
                    {
                      if (!err)
                      {
                        global.safejsonparse
                        (
                          uuidobj,
                          function(err, uo)
                          {
                            if (!err)
                            {
                              if (userid.equals(__.makeBigInt(uo.userid)))
                                resolve(uo);
                            }
                          }
                        );
                      }

                      // Finished searching - if haven't found it, reject(), if we had already found it, resolve() would have already been called...
                      if (--keycount == 0)
                        reject(undefined);
                    }
                  );
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.usersLoggedIn = function()
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.users.keys
      (
        global.config.redis.prefix + '*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;
            var calls = [];

            if (keycount > 0)
            {
              keys.forEach
              (
                function(k)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      global.users.get
                      (
                        list[k],
                        function(err, uuidobj)
                        {
                          if (!err)
                          {
                            global.safejsonparse
                            (
                              uuidobj,
                              function(err, uo)
                              {
                                if (!err)
                                {
                                  if (!__.isNull(uo.sparkid) && !__.isNull(uo.session))
                                    callback(null, {uuid: uo.uuid, uname: uo.uname});
                                  else
                                    callback(null);
                                }
                                else
                                  callback(err);
                              }
                            );
                          }
                          else
                            callback(err);
                        }
                      );
                    }
                  );
                }
              );

              global.async.parallel
              (
                calls,
                function(err, results)
                {
                  if (!err)
                  {
                    var users = [];
                    results.forEach
                    (
                      function(u)
                      {
                        if (!__.isUndefined(u) && !__.isNull(u))
                          users.push(u);
                      }
                    );
                    resolve(users);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.getCustConfig = function(custid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.customers.get
      (
        global.config.redis.custconfig + custid,
        function(err, cfgobj)
        {
          if (!err)
          {
            global.safejsonparse
            (
              cfgobj,
              function(err, co)
              {
                if (!err && co)
                  resolve(co);
                else
                  reject(co);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.setCustConfig = function(custid, data)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.safejsonstringify
      (
        data,
        function(err, json)
        {
          if (!err)
          {
            global.customers.set(global.config.redis.custconfig + custid, json);
            resolve(null);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.isMimeTypeImage = function(mt)
{
  var isimage = false;

  if (!__.isUndefined(mt) && !__.isNull(mt) && !__.isBlank(mt))
  {
    if (__.hasstring(mt, 'image') || __.hasstring(mt, 'png') || __.hasstring(mt, 'jpg') || __.hasstring(mt, 'gif') || __.hasstring(mt, 'bmp') || __.hasstring(mt, 'jpeg'))
      isimage = true;
  }

  return isimage;
};

global.isMimeTypeDoc = function(mt)
{
  var isdoc = false;

  if (!__.isUndefined(mt) && !__.isNull(mt) && !__.isBlank(mt))
  {
    if (__.hasstring(mt, 'officedocument') || __.hasstring(mt, 'msword'))
    isdoc = true;
  }

  return isdoc;
};

global.isMimeTypeSheet = function(mt)
{
  var issheet = false;

  if (!__.isUndefined(mt) && !__.isNull(mt) && !__.isBlank(mt))
  {
    if (__.hasstring(mt, 'excel') || __.hasstring(m, 'spreadsheet'))
      issheet = true;
  }

  return issheet;
};

global.copyFile = function(source, target, cb)
{
  var cbCalled = false;
  var rd = global.fs.createReadStream(source);

  rd.on
  (
    'error',
    function(err)
    {
      done(err);
    }
  );

  var wr = fs.createWriteStream(target);

  wr.on
  (
    'error',
    function(err)
    {
      done(err);
    }
  );

  wr.on
  (
    'close',
    function(ex)
    {
      done();
    }
  );

  rd.pipe(wr);

  function done(err)
  {
    if (!cbCalled)
    {
      cb(err);
      cbCalled = true;
    }
  }
};

global.createSMTPTransport = function()
{
  if (__.isNull(global.transporter))
  {
    global.transporter = global.mailer.createTransport
    (
      global.smtptransport
      (
        {
          host: global.config.smtp.host,
          port: global.config.smtp.port,
          pool: global.config.smtp.pool,
          secure: global.config.smtp.secure,
          auth:
          {
            user: global.config.smtp.user,
            pass: global.config.smtp.pass
          }
        }
      )
    );
  }

  return global.transporter;
};

// http://web.archive.org/web/20130827210000/http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm/
global.NaturalSortNameObjArray = function(a, b)
{
  var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
  var sre = /(^[ ]*|[ ]*$)/g;
  var dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
  var hre = /^0x[0-9a-f]+$/i;
  var ore = /^0/;
  var i = function(s) {return global.NaturalSortNameObjArray.Insensitive && ('' + s).toLowerCase() || '' + s;};
  // Convert all to strings strip whitespace
  var x = i(a.name).replace(sre, '') || '';
  var y = i(b.name).replace(sre, '') || '';
  // Chunk/tokenize
  var xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  var yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  // Numeric, hex or date detection
  var xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x));
  var yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null;
  var oFxNcL, oFyNcL;
  // First try and sort Hex codes or Dates
  if (yD)
  {
    if (xD < yD) return -1;
    if (xD > yD) return 1;
  }
  // Natural sorting through split numeric strings and default strings
  for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++)
  {
    // Find floats not starting with '0', string or 0 if not defined (Clint Priest)
    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;

    // Handle numeric vs string comparison - number < string - (Kyle Adams)
    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {return (isNaN(oFxNcL)) ? 1 : -1;}

    // Rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
    if (typeof oFxNcL !== typeof oFyNcL)
    {
      oFxNcL += '';
      oFyNcL += '';
    }
    if (oFxNcL < oFyNcL) return -1;
    if (oFxNcL > oFyNcL) return 1;
  }
  return 0;
};

global.NaturalSortStringArray = function(a, b)
{
  var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
  var sre = /(^[ ]*|[ ]*$)/g;
  var dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
  var hre = /^0x[0-9a-f]+$/i;
  var ore = /^0/;
  var i = function(s) {return global.NaturalSortStringArray.Insensitive && ('' + s).toLowerCase() || '' + s;};
  // Convert all to strings strip whitespace
  var x = i(a).replace(sre, '') || '';
  var y = i(b).replace(sre, '') || '';
  // Chunk/tokenize
  var xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  var yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  // Numeric, hex or date detection
  var xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x));
  var yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null;
  var oFxNcL, oFyNcL;
  // First try and sort Hex codes or Dates
  if (yD)
  {
    if (xD < yD) return -1;
    if (xD > yD) return 1;
  }
  // Natural sorting through split numeric strings and default strings
  for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++)
  {
    // Find floats not starting with '0', string or 0 if not defined (Clint Priest)
    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;

    // Handle numeric vs string comparison - number < string - (Kyle Adams)
    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {return (isNaN(oFxNcL)) ? 1 : -1;}

    // Rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
    if (typeof oFxNcL !== typeof oFyNcL)
    {
      oFxNcL += '';
      oFyNcL += '';
    }
    if (oFxNcL < oFyNcL) return -1;
    if (oFxNcL > oFyNcL) return 1;
  }
  return 0;
};

// *******************************************************************************************************************************************************************************************
// Local helper functions...
function readConfig()
{
  var configfile = global.fs.readFileSync('./config.ini', {encoding: 'utf-8'});
  var options =
  {
    sections: true,
    comments: '#',
    separators: '=',
    strict: true
  };

  global.config = prop.parse
  (
    configfile,
    options
  );

  // Read in all avatar files/images...
  fs.readdir
  (
    global.path.join(__dirname, global.config.folders.avatars),
    function(err, items)
    {
      global.avatars = '';

      if (!err)
      {
        var idx = 0;

        // Sort nicely otherwise we get a1, a10, a100, a11.... instead of a1, a2, a3...
        items = items.sort(global.NaturalSortStringArray);

        items.forEach
        (
          function(f)
          {
            if (f.indexOf('.DS_Store') == -1)
            {
              var name = f.split('.');

              if (idx++ > 0)
                global.avatars += ',';

              // Build array of avatar objects ready for HTML combo later...
              global.avatars += '{name: \'' + name[0] + '\', image: \'' + f + '\'}';
            }
          }
        );
      }
    }
  );
}

function makeWorld(spark, eventname, data)
{
  var funcargs = [];

  // Capture function arguments here - won't be available afterwards...
  for (var a = 3; a < arguments.length; a++)
    funcargs.push(arguments[a]);

  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!__.isUndefined(data.fguid))
      {
        var argname = '';
        var ismandatory = false;
        var nummandatory = 0;
        var mandatoryfound = 0;
        var argsfound = 0;

        // fguid, uuid and session vars always mandatory with every request except login...

        if (__.isUndefined(data.uuid) || __.isBlank(data.uuid) || __.isUndefined(data.session))
        {
          if (__.isUndefined(data.uuid) || __.isBlank(data.uuid))
            spark.emit(global.eventerror, {rc: global.errcode_notloggedin, msg: global.text_notloggedin, eventname: eventname, pdata: data.pdata});
          else
            spark.emit(global.eventerror, {rc: global.errcode_invalidsession, msg: global.text_invalidsession, eventname: eventname, pdata: data.pdata});
          reject({rc: global.text_missingparams});
        }
        else
        {
          global.ConsoleLog('========== makeWorld: eventname: ' + eventname + ', fguid: ' + data.fguid + ', uuid: ' + data.uuid + ', session: ' + data.session);

          // Find user in cache...
          global.users.get
          (
            global.config.redis.prefix + data.uuid,
            function(err, uuidobj)
            {
              if (!err)
              {
                // Found user in cache, check session matches etc...
                //if (uuidobj.session == data.session)
                if (true)
                {
                  global.safejsonparse
                  (
                    uuidobj,
                    function(err, uo)
                    {
                      if (!err)
                      {
                        var world = {};
                        // Just update the really dynamic stuff....
                        uo.fguid = data.fguid;
                        uo.sparkid = spark.id;

                        spark.myUuid = data.uuid;

                        // While we're here, get config object for this customer, saves individual functions looking for it later...
                        global.customers.get
                        (
                          global.config.redis.custconfig + uo.custid,
                          function(err, configobj)
                          {
                            if (!err)
                            {
                              global.safejsonparse
                              (
                                configobj,
                                function(err, co)
                                {
                                  if (!err)
                                  {
                                    world.custconfig = co;

                                    // Now check for existence of params...
                                    funcargs.forEach
                                    (
                                      function(argname)
                                      {
                                        // If argument name starts with asterisk, it's mandatory and we need to find it...
                                        if (__.startsWith(argname, '*'))
                                        {
                                          argname = __.ltrim(argname, '*');
                                          ismandatory = true;
                                          nummandatory++;
                                        }
                                        else
                                          ismandatory = false;
                                        //
                                        if (!__.isUndefined(data[argname]))
                                        {
                                          world[argname] = data[argname];
                                          argsfound++;
                                          // Mandatory argument and we found it...
                                          if (ismandatory)
                                            mandatoryfound++;
                                        }
                                      }
                                    );
                                    // Get all the mandatory arguments we're looking for?
                                    // If not, then we need at least one?
                                    if ((mandatoryfound < nummandatory) || ((argsfound == 0) && (nummandatory > 0)))
                                    {
                                      spark.emit(global.eventerror, {rc: global.errcode_missingparams, msg: global.text_missingparams, eventname: eventname, pdata: data.pdata});
                                      reject({rc: global.errcode_missingparams});
                                    }
                                    else
                                    {
                                      // Params for this request...
                                      world.uuid = data.uuid;
                                      world.session = data.session;
                                      world.fguid = data.fguid;
                                      world.spark = spark;
                                      world.eventname = eventname;
                                      world.pdata = data.pdata;
                                      world.cn = uo;
                                      resolve(world);
                                    }
                                  }
                                }
                              );
                            }
                            else
                            {
                              // Can't get to customer config for some reason...
                              global.log.error({as1: true}, '[makeworld] ' + global.text_unablegetcustconfig + ' ' + configobj + ', for uuid: ' + data.uuid);
                              spark.emit(global.eventerror, {rc: global.errcode_unablegetcustconfig, msg: global.text_unablegetcustconfig, eventname: eventname, pdata: data.pdata});
                              reject({rc: global.errcode_unablegetcustconfig});
                            }
                          }
                        );
                      }
                      else
                      {
                        // Most likely this user's UUID has changed - so their cached version is no longer valid...
                        global.log.error({as1: true}, '[makeworld] ' + global.text_unableparsejson + ' ' + uuidobj + ', for uuid: ' + data.uuid);
                        spark.emit(global.eventerror, {rc: global.errcode_sessionexpired, msg: global.text_sessionexpired, eventname: eventname, pdata: data.pdata});
                        reject({rc: global.errcode_sessionexpired});
                      }
                    }
                  );
                }
                else
                {
                  spark.emit(global.eventerror, {rc: global.errcode_sessionexpired, msg: global.text_sessionexpired, eventname: eventname, pdata: data.pdata});
                  reject({rc: global.errcode_sessionexpired});
                }
              }
              else
              {
                spark.emit(global.eventerror, {rc: global.errcode_unablerestoresession, msg: global.text_unablerestoresession, eventname: eventname, pdata: data.pdata});
                reject({rc: global.errcode_unablerestoresession});
              }
            }
          );
        }
      }
      else
      {
        spark.emit(global.eventerror, {rc: global.errcode_invalidclient, msg: global.text_invalidclient, eventname: eventname, pdata: data.pdata});
        reject({rc: global.errcode_invalidclient});
      }
    }
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Begin code execution...
var server = null;
var app = express();

readConfig();

global.log = bunyan.createLogger
(
  {
    name: global.config.log.name,
    streams:
    [
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'info',
        path: global.config.log.info
      },
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'warn',
        path: global.config.log.warn
      },
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'error',
        path: global.config.log.error
      },
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'debug',
        path: global.config.log.debug
      }
    ]
  }
);

process.on
(
  'uncaughtException',
  function(err)
  {
    global.log.error({as1: true}, '[worker] Uncaught exception, stack trace: ' + err.stack);

    if (global.config.env.debug)
      console.log('[worker] Uncaught exception, stack trace: ' + err.stack);
  }
);

global.cs = 'postgres://' + global.config.dbmain.user + ':' + global.config.dbmain.password + '@' + global.config.dbmain.host + '/' + global.config.dbmain.db;
global.geocoder = global._geocoder({provider: global.config.geocoder.provider, httpAdapter: global.config.geocoder.httpadapter, apiKey: global.config.google.webkey});

// *******************************************************************************************************************************************************************************************
// CRON jobs...
var jobRTapReport = new cronjob
(
  {
    cronTime: global.config.cron.rtapreport,
    onTick: function()
    {
      //global.log.error({cron_rtapreport: true}, 'CRON [rtapreport] Started: ' + global.moment().format('YYYY-MM-DD hh:mm:ss'));
      console.log('CRON [rtapreport] Started');
      //global.log.error({cron_rtapreport: true}, 'CRON [rtapreport] Completed: ' + global.moment().format('YYYY-MM-DD hh:mm:ss'));
      global.modprinting.EmailRfidTaps();
    },
    start: true
  }
);

// *******************************************************************************************************************************************************************************************
// Web stuff...
if (!global.config.env.secure)
{
  server = http.createServer(app);
  main();
}
else
{
  var key = global.fs.readFileSync(global.config.env.ssl_priv.toString());
  var crt = global.fs.readFileSync(global.config.env.ssl_cert.toString());

  server = https.createServer
  (
    {
      key: key,
      cert: crt,
      requestCert: true,
      rejectUnauthorised: false
    },
    app
  );

  main();
}

function main()
{
  var notifications = require('./routes/notifications');
  var dropclientattachments = require('./routes/dropclientattachment');
  var dropsupplierattachments = require('./routes/dropsupplierattachment');
  var droporderattachments = require('./routes/droporderattachment');
  var dropprinttemplates = require('./routes/dropprinttemplate');
  var dropdataimport = require('./routes/dropdataimport');

  var dropjobsheet = require('./routes/dropjobsheet');

  var throwclientattachments = require('./routes/throwclientattachment');
  var throwsupplierattachments = require('./routes/throwsupplierattachment');
  var throworderattachments = require('./routes/throworderattachment');
  var throwprinttemplates = require('./routes/throwprinttemplate');
  var rtap = require('./routes/rtap');

  //app.use(connect.json());
  app.use(connect.urlencoded());
  app.use(cors());

  app.post
  (
    '/notifications',
    function(req, res)
    {
      notifications.notificationsPost(req, res);
    }
  );

  app.post
  (
    '/dropclientattachment',
    multipart(),
    function(req, res)
    {
      dropclientattachments.dropClientAttachmentPost(req, res);
    }
  );

  app.post
  (
    '/dropsupplierattachment',
    multipart(),
    function(req, res)
    {
      dropsupplierattachments.dropSupplierAttachmentPost(req, res);
    }
  );

  app.post
  (
    '/droporderattachment',
    multipart(),
    function(req, res)
    {
      droporderattachments.dropOrderAttachmentPost(req, res);
    }
  );

  app.post
  (
    '/dropprinttemplate',
    multipart(),
    function(req, res)
    {
      dropprinttemplates.dropPrintTemplatePost(req, res);
    }
  );

  app.post
  (
    '/dropjobsheet',
    multipart(),
    function(req, res)
    {
      dropjobsheet.dropJobSheetPost(req, res);
    }
  );

  // Data imports...
  app.post
  (
    '/dataimportproducts',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportProductsPost(req, res);
    }
  );

  app.post
  (
    '/dataimportclients',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportClientsPost(req, res);
    }
  );

  app.post
  (
    '/dataimportsuppliers',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportSuppliersPost(req, res);
    }
  );

  app.post
  (
    '/dataimportemployees',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportEmployeesPost(req, res);
    }
  );

  app.post
  (
    '/dataimportaccounts',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportAccountsPost(req, res);
    }
  );

  // Remedy Tap...
  app.post
  (
    '/rtap',
    function(req, res)
    {
      rtap.RfidTap(req, res);
    }
  );

  // Download rtaps
  app.get
  (
    '/gettaps',
    function(req, res)
    {
      global.modprinting.GetRfidTaps(req, res);
    }
  );

  app.get
  (
    '/gettapperiod',
    function(req, res)
    {
      global.modprinting.GetRfidTapPeriod(req, res);
    }
  );

  // Download specified order/invoice
  app.get
  (
    '/di',
    function(req, res)
    {
      global.ConsoleLog('send invoice');
      global.modprinting.SendInvoice(req, res);
    }
  );

  app.get
  (
    '/do',
    function(req, res)
    {
      global.modprinting.SendOrder(req, res);
    }
  );

  app.get
  (
    '/js',
    function(req, res)
    {
      global.modprinting.SendJobSheet(req, res);
    }
  );

  app.get
  (
    '/pos',
    function(req, res)
    {
      var posobj = global.fs.readFileSync(global.path.join(__dirname, 'routes/pos.html'));
      var poshtml = posobj.toString();

      poshtml = poshtml.replace(/XXX_LOGO1/g, global.config.pos.logo);

      poshtml = poshtml.replace(/XXX_APPTITLE/g, global.config.about.title);
      poshtml = poshtml.replace(/XXX_MENUTITLE/g, global.config.about.menutitle);
      poshtml = poshtml.replace(/XXX_MENUSUBTITLE/g, global.config.about.menusubtitle);
      poshtml = poshtml.replace(/XXX_COPYRIGHT/g, global.config.about.copyright);
      poshtml = poshtml.replace(/XXX_OWNER/g, global.config.about.owner);
      poshtml = poshtml.replace(/XXX_MENUICON/g, global.config.about.menuicon);
      poshtml = poshtml.replace(/XXX_BUILDNO/g, global.config.env.version);

      poshtml = poshtml.replace(/XXX_DEFAULTCOUNTRY/g, global.config.defaults.defaultcountry);

      poshtml = poshtml.replace(/XXX_FAVICO16/g, global.config.env.favico16);
      poshtml = poshtml.replace(/XXX_FAVICO32/g, global.config.env.favico32);

      poshtml = poshtml.replace(/XXX_META_TITLE/g, global.config.meta.title);
      poshtml = poshtml.replace(/XXX_META_DESCRIPTION/g, global.config.meta.description);
      poshtml = poshtml.replace(/XXX_META_KEYWORDS/g, global.config.meta.keywords);
      poshtml = poshtml.replace(/XXX_META_REPLYTO/g, global.config.meta.replyto);
      poshtml = poshtml.replace(/XXX_META_COPYRIGHT/g, global.config.meta.copyright);

      poshtml = poshtml.replace(/XXX_GOOGLEWEBKEY/g, global.config.google.webkey);
      poshtml = poshtml.replace(/XXX_GOOGLEDEFAULTREGION/g, global.config.google.defaultregion);

      poshtml = poshtml.replace(/XXX_ERRCODE_NONE/g, global.config.errorcodes.errcode_none);
      poshtml = poshtml.replace(/XXX_ERRCODE_NODATA/g, global.config.errorcodes.errcode_nodata);
      poshtml = poshtml.replace(/XXX_ERRCODE_MISSINGPARAMS/g, global.config.errorcodes.errcode_missingparams);
      poshtml = poshtml.replace(/XXX_ERRCODE_FATAL/g, global.config.errorcodes.errcode_fatal);
      poshtml = poshtml.replace(/XXX_ERRCODE_NOTLOGGEDIN/g, global.config.errorcodes.errcode_notloggedin);
      poshtml = poshtml.replace(/XXX_ERRCODE_SESSIONEXPIRED/g, global.config.errorcodes.errcode_sessionexpired);
      poshtml = poshtml.replace(/XXX_ERRCODE_RESOURCEUNAVAIL/g, global.config.errorcodes.errcode_resourceunavail);
      poshtml = poshtml.replace(/XXX_ERRCODE_DBUNAVAIL/g, global.config.errorcodes.errcode_dbunavail);
      poshtml = poshtml.replace(/XXX_ERRCODE_USEREXISTS/g, global.config.errorcodes.errcode_userexists);
      poshtml = poshtml.replace(/XXX_ERRCODE_DBERR/g, global.config.errorcodes.errcode_dberr);
      poshtml = poshtml.replace(/XXX_ERRCODE_FILEERR/g, global.config.errorcodes.errcode_fileerr);
      poshtml = poshtml.replace(/XXX_ERRCODE_USERNOTREGISTERED/g, global.config.errorcodes.errcode_usernotregistered);
      poshtml = poshtml.replace(/XXX_ERRCODE_PASSWDHASH/g, global.config.errorcodes.errcode_passwdhash);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDCONNECTION/g, global.config.errorcodes.errcode_invalidconnection);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDLOGIN/g, global.config.errorcodes.errcode_invalidlogin);
      poshtml = poshtml.replace(/XXX_ERRCODE_MISSINGURL/g, global.config.errorcodes.errcode_missingurl);
      poshtml = poshtml.replace(/XXX_ERRCODE_SMSERROR/g, global.config.errorcodes.errcode_smserror);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDSESSION/g, global.config.errorcodes.errcode_invalidsession);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDCLIENT/g, global.config.errorcodes.errcode_invalidclient);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLERESTORESESSION/g, global.config.errorcodes.errcode_unablerestoresession);
      poshtml = poshtml.replace(/XXX_ERRCODE_COMMITTX/g, global.config.errorcodes.errcode_committx);
      poshtml = poshtml.replace(/XXX_ERRCODE_JSONPARSE/g, global.config.errorcodes.errcode_jsonparse);
      poshtml = poshtml.replace(/XXX_ERRCODE_JSONSTRINGIFY/g, global.config.errorcodes.errcode_jsonstringify);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLECREATENEWUSER/g, global.config.errorcodes.errcode_unablecreatenewuser);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLELOGINUSER/g, global.config.errorcodes.errcode_unableloginuser);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLESAVECLIENT/g, global.config.errorcodes.errcode_unablesaveclient);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLESAVEPRODUCT/g, global.config.errorcodes.errcode_unablesaveproduct);
      poshtml = poshtml.replace(/XXX_ERRCODE_INSUFFICIENTQTY/g, global.config.errorcodes.errcode_insufficientqty);

      poshtml = poshtml.replace(/XXX_BARCODE_FORMAT/g, global.config.barcodes.format);
      poshtml = poshtml.replace(/XXX_BARCODE_LENGTH/g, global.config.barcodes.length);
      poshtml = poshtml.replace(/XXX_BARCODE_PREFIX_LENGTH/g, global.config.barcodes.prefixlength);

      poshtml = poshtml.replace(/XXX_POSPRINTERIP/g, global.config.pos.printerip);
      poshtml = poshtml.replace(/XXX_POSPRINTERPORT/g, global.config.pos.printerport);
      poshtml = poshtml.replace(/XXX_POSPRINTERID/g, global.config.pos.printerid);

      poshtml = poshtml.replace(/XXX_POSABN/g, global.config.pos.abn);
      poshtml = poshtml.replace(/XXX_POSPHONE/g, global.config.pos.phone);
      poshtml = poshtml.replace(/XXX_POSADDRESS1/g, global.config.pos.address1);
      poshtml = poshtml.replace(/XXX_POSADDRESS1/g, global.config.pos.address2);

      poshtml = poshtml.replace(/XXX_POSPOLICY1/g, global.config.pos.policy1);
      poshtml = poshtml.replace(/XXX_POSPOLICY2/g, global.config.pos.policy2);
      poshtml = poshtml.replace(/XXX_POSFOOTER1/g, global.config.pos.footer1);

      poshtml = poshtml.replace(/XXX_ABNLOOKUP/g, global.config.gov.abnlookup);

      res.send(poshtml);
    }
  );

  app.get
  (
    '/',
    function(req, res)
    {
      var indexobj = global.fs.readFileSync(global.path.join(__dirname, 'routes/index.html'));
      var indexhtml = indexobj.toString();

      indexhtml = indexhtml.replace(/XXX_APPTITLE/g, global.config.about.title);
      indexhtml = indexhtml.replace(/XXX_MENUTITLE/g, global.config.about.menutitle);
      indexhtml = indexhtml.replace(/XXX_MENUSUBTITLE/g, global.config.about.menusubtitle);
      indexhtml = indexhtml.replace(/XXX_COPYRIGHT/g, global.config.about.copyright);
      indexhtml = indexhtml.replace(/XXX_OWNER/g, global.config.about.owner);
      indexhtml = indexhtml.replace(/XXX_MENUICON/g, global.config.about.menuicon);
      indexhtml = indexhtml.replace(/XXX_BUILDNO/g, global.config.env.version);

      indexhtml = indexhtml.replace(/XXX_POSONLY/g, global.config.env.posonly);

      indexhtml = indexhtml.replace(/XXX_FAVICO16/g, global.config.env.favico16);
      indexhtml = indexhtml.replace(/XXX_FAVICO32/g, global.config.env.favico32);

      indexhtml = indexhtml.replace(/XXX_META_TITLE/g, global.config.meta.title);
      indexhtml = indexhtml.replace(/XXX_META_DESCRIPTION/g, global.config.meta.description);
      indexhtml = indexhtml.replace(/XXX_META_KEYWORDS/g, global.config.meta.keywords);
      indexhtml = indexhtml.replace(/XXX_META_REPLYTO/g, global.config.meta.replyto);
      indexhtml = indexhtml.replace(/XXX_META_COPYRIGHT/g, global.config.meta.copyright);

      indexhtml = indexhtml.replace(/XXX_GOOGLEWEBKEY/g, global.config.google.webkey);
      indexhtml = indexhtml.replace(/XXX_GOOGLEDEFAULTREGION/g, global.config.google.defaultregion);

      indexhtml = indexhtml.replace(/XXX_PAYDAYOFWEEK/g, global.config.defaults.defaultpaydow);
      indexhtml = indexhtml.replace(/XXX_DEFAULTCOUNTRY/g, global.config.defaults.defaultcountry);
      indexhtml = indexhtml.replace(/XXX_DEFAULTMAXHISTORY/g, global.config.defaults.defaultmaxhistory);

      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_ORDER/g, global.config.defaults.itype_order_order);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_INVOICE/g, global.config.defaults.itype_order_invoice);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_QUOTE/g, global.config.defaults.itype_order_quote);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_DELIVERYDOCKET/g, global.config.defaults.itype_order_deliverydocket);

      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_XFER/g, global.config.defaults.itype_inventory_xfer);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_ADJUST/g, global.config.defaults.itype_inventory_adjust);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_ORDER/g, global.config.defaults.itype_inventory_order);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_STOCK/g, global.config.defaults.itype_inventory_stock);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_BUILD/g, global.config.defaults.itype_inventory_build);

      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_ASSET/g, global.config.defaults.itype_account_asset);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_EXPENSE/g, global.config.defaults.itype_account_expense);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_LIABILITY/g, global.config.defaults.itype_account_liability);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_EQUITY/g, global.config.defaults.itype_account_equity);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_REVENUE/g, global.config.defaults.itype_account_revenue);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_COSTOFGOODSSOLD/g, global.config.defaults.itype_account_costofgoodssold);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_OTHERREVENUE/g, global.config.defaults.itype_account_otherrevenue);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_OTHEREXPENSES/g, global.config.defaults.itype_account_otherexpenses);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_BANK/g, global.config.defaults.itype_account_bank);

      indexhtml = indexhtml.replace(/XXX_ERRCODE_NONE/g, global.config.errorcodes.errcode_none);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_NODATA/g, global.config.errorcodes.errcode_nodata);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_MISSINGPARAMS/g, global.config.errorcodes.errcode_missingparams);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_FATAL/g, global.config.errorcodes.errcode_fatal);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_NOTLOGGEDIN/g, global.config.errorcodes.errcode_notloggedin);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_SESSIONEXPIRED/g, global.config.errorcodes.errcode_sessionexpired);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_RESOURCEUNAVAIL/g, global.config.errorcodes.errcode_resourceunavail);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_DBUNAVAIL/g, global.config.errorcodes.errcode_dbunavail);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_USEREXISTS/g, global.config.errorcodes.errcode_userexists);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_DBERR/g, global.config.errorcodes.errcode_dberr);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_FILEERR/g, global.config.errorcodes.errcode_fileerr);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_USERNOTREGISTERED/g, global.config.errorcodes.errcode_usernotregistered);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_PASSWDHASH/g, global.config.errorcodes.errcode_passwdhash);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDCONNECTION/g, global.config.errorcodes.errcode_invalidconnection);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDLOGIN/g, global.config.errorcodes.errcode_invalidlogin);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_MISSINGURL/g, global.config.errorcodes.errcode_missingurl);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_SMSERROR/g, global.config.errorcodes.errcode_smserror);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDSESSION/g, global.config.errorcodes.errcode_invalidsession);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDCLIENT/g, global.config.errorcodes.errcode_invalidclient);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLERESTORESESSION/g, global.config.errorcodes.errcode_unablerestoresession);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_COMMITTX/g, global.config.errorcodes.errcode_committx);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_JSONPARSE/g, global.config.errorcodes.errcode_jsonparse);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_JSONSTRINGIFY/g, global.config.errorcodes.errcode_jsonstringify);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLECREATENEWUSER/g, global.config.errorcodes.errcode_unablecreatenewuser);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLELOGINUSER/g, global.config.errorcodes.errcode_unableloginuser);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLESAVECLIENT/g, global.config.errorcodes.errcode_unablesaveclient);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLESAVEPRODUCT/g, global.config.errorcodes.errcode_unablesaveproduct);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INSUFFICIENTQTY/g, global.config.errorcodes.errcode_insufficientqty);

      indexhtml = indexhtml.replace(/XXX_BARCODE_FORMAT/g, global.config.barcodes.format);
      indexhtml = indexhtml.replace(/XXX_BARCODE_LENGTH/g, global.config.barcodes.length);
      indexhtml = indexhtml.replace(/XXX_BARCODE_PREFIX_LENGTH/g, global.config.barcodes.prefixlength);

      indexhtml = indexhtml.replace(/XXX_AVATARS/g, avatars);

      indexhtml = indexhtml.replace(/XXX_ABNLOOKUP/g, global.config.gov.abnlookup);

      indexhtml = indexhtml.replace(/XXX_VOICEPREFIXNAME/g, global.config.voice.prefixname);

      res.send(indexhtml);
    }
  );

  app.get
  (
    '/voices.js',
    function(req, res)
    {
      var jsobj = global.fs.readFileSync(global.path.join(__dirname, 'routes/voices.js'));
      var js = jsobj.toString();

      js = js.replace(/XXX_VOICEPREFIXNAME/g, global.config.voice.prefixname);

      res.send(js);
    }
  );

  // Fetch attachments...
  app.get
  (
    '/throworderattachment',
    function(req, res)
    {
      throworderattachments.throwOrderAttachmentGet(req, res);
    }
  );

  app.get
  (
    '/throwclientattachment',
    function(req, res)
    {
      throwclientattachments.throwClientAttachmentGet(req, res);
    }
  );

  app.get
  (
    '/throwsupplierattachment',
    function(req, res)
    {
      throwsupplierattachments.throwSupplierAttachmentGet(req, res);
    }
  );

  app.get
  (
    '/throwprinttemplate',
    function(req, res)
    {
      throwprinttemplates.throwPrintTemplateGet(req, res);
    }
  );

  // This line is last for static files...
  app.use('/', express.static(__dirname + '/routes'));

  // Load connection cache (uuids)....
  global.modauth.InitConnectionCache();

  // *******************************************************************************************************************************************************************************************
  // Primus stuff...
  primus.prototype.sendToRoom = function(room, eventname, data)
  {
    // primus-emit doesn't extend to primus-redis-rooms, so we mimic it's internals (the emit) data format...
    this.room(room).write({emit: [eventname, data]});
  };

  primus.prototype.sendToRoomExcept = function(room, eventname, data, sparkid)
  {
    var r = this.room(room);

    r.sparks.forEach
    (
      function(s)
      {
        if (s.id != sparkid)
          s.emit(eventname, data);
      }
    );
  };

  primus.prototype.numConnections = function()
  {
    var count = 0;
    this.forEach
    (
      function(spark, id, connections)
      {
        count++;
      }
    );
    return count;
  };

  global.ConsoleLog('========== Primus server starting...');
  global.pr = new primus
  (
    server,
    {
      transformer: global.config.primus.transformer,
      pathname: global.config.primus.pathname,
      redis:
      {
        host: global.config.redis.rHost,
        port: global.config.redis.rPort,
        channel: global.config.redis.rChannel
      }
    }
  );

  global.pr.use('redis', prrooms);
  global.pr.use('emitter', pe);

  global.pr.on
  (
    'close',
    function()
    {
    }
  );

  global.pr.on
  (
    'connection',
    function(spark)
    {
      // Give client a unique (for this lifetime) fake GUID... (fake because we don't have access to a NIC)...
      // Client must pass this around on every query so we can target back responses...
      // var fguid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);});
      var fguid = uuidv4();

      spark.myUuid = '';
      // Automatically join them to the initial broadcast channel...
      spark.myChannels = [global.config.env.notificationschannel];
      spark.join(global.config.env.notificationschannel);

      global.log.info({as1: true}, '[connect] from: ' + spark.address.ip + ':' + spark.address.port);
      global.ConsoleLog('[connect] from: ' + spark.address.ip + ':' + spark.address.port);

      // *******************************************************************************************************************************************************************************************
      // Auth/connection events
      spark.on
      (
        'error',
        function(err)
        {
        }
      );

      spark.on
      (
        'end',
        function()
        {
          try
          {
            // Leave channels...
            spark.leaveAll();
            spark.myChannels = [];

            if (!__.isUndefined(spark.myUuid) && !__.isNull(spark.myUuid) && !__.isBlank(spark.myUuid))
            {
              // Find this user in redis and update status...
              global.users.get
              (
                global.config.redis.prefix + spark.myUuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          global.ConsoleLog('========== end: fguid: ' + uo.fguid + ', uuid: ' + spark.myUuid + ', session: ' + uo.session + ', name: ' + uo.uname);

                          global.safejsonstringify
                          (
                            uo,
                            function(err, json)
                            {
                              if (!err)
                                global.users.set(global.config.redis.prefix + spark.myUuid, json);
                            }
                          );

                          global.pr.sendToRoom(global.config.env.notificationschannel, 'useroffline', {uuid: spark.myUuid, uname: uo.uname});

                          uo.fguid = '';
                          uo.sparkid = null;
                        }
                        else
                          global.log.error({as1: true}, '[end] ' + err.message + ' ' + uuidobj);
                      }
                    );
                  }
                  else
                    global.log.info({as1: true}, '[end] ' + global.text_generalexception + ' unable to retrieve uuid [' + spark.uuid + '] for disconnection');
                }
              );
            }
            else
            {
              // Usually means user cancelled login - so we don't have a UUID yet for this spark... or user has explicitl logged out...
              //global.log.error({as1: true}, '[end] Unknown spark UUID...');
            }
          }

          catch (err)
          {
            global.log.error({as1: true}, '[end] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'login',
        function(data)
        {
          try
          {
            global.modauth.LoginUser(spark, 'login', data.fguid, data.uid, data.pwd, data.pdata);
          }

          catch (err)
          {
            global.log.error({as1: true}, '[login] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'logout',
        function(data)
        {
          try
          {
            global.modauth.LogoutUser(spark, 'logout', data.fguid, data.pdata);
          }

          catch (err)
          {
            global.log.error({as1: true}, '[logout] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'sessionhint',
        function(data)
        {
          try
          {
            makeWorld(spark, 'sessionhint', data).then
            (
              function(world)
              {
                // NOP - makeWorld has done all the work restoring and associating the user cache and spark...
                // but we need to return user's channels...

                // Find user in cache...
                global.users.get
                (
                  global.config.redis.prefix + data.uuid,
                  function(err, uuidobj)
                  {
                    if (!err)
                    {
                      global.safejsonparse
                      (
                        uuidobj,
                        function(err, uo)
                        {
                          if (!err)
                            spark.emit('sessionhint', {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, channels: uo.channels, pdata: world.pdata});
                        }
                      );
                    }
                  }
                );
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[restoresession] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'register',
        function(data)
        {
          try
          {
            makeWorld(spark, 'register', data, 'repcode', 'name', 'password', 'email', 'mobile').then
            (
              function(world)
              {
                global.modauth.RegisterRep(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[register] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'join',
        function(data)
        {
          try
          {
            if (!__.isUndefined(data.fguid) && !__.isUndefined(data.channel) && !__.isNull(data.channel))
            {
              if (spark.myChannels.indexOf(data.channel) == -1)
              {
                spark.join(data.channel);
                spark.myChannels.push(data.channel);
              }
              //
              spark.emit
              (
                'join',
                {
                  rc: global.errcode_none,
                  fguid: data.fguid,
                  channel: data.channel,
                  pdata: data.pdata
                }
              );
            }
          }

          catch (err)
          {
            global.log.error({as1: true}, '[join] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // *******************************************************************************************************************************************************************************************
      // ALL requests need at least:
      //   fguid - from initial connection which will be echoed...
      //   uuid - login credentials which will be echoed...
      //   session - session credentials...
      //   pdata - private data which will be echoed back - useful for clients to track...
      //   Whatever params as required by the request...
      // Returns:
      //   rc - 0 success -1 no data/results but otherwise fine, -2 missing params, -3 error
      //   msg - error message or any textual message with the return code
      // Optional returns:
      //   rs - array of result set...
      //   Whatever else specific to that request...

      // Account requests
      spark.on
      (
        'listaccounts',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listaccounts', data).then
            (
              function(world)
              {
                global.modaccounts.ListAccounts(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listaccounts] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadaccount',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadaccount', data, '*accountid').then
            (
              function(world)
              {
                global.modaccounts.LoadAccount(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadaccount] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newaccount',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newaccount', data, '*name', '*code', '*accounttype', '*parentid').then
            (
              function(world)
              {
                global.modaccounts.NewAccount(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newaccount] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveaccount',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveaccount', data, '*accountid', '*code', '*name', '*altcode', '*altname', '*accounttype').then
            (
              function(world)
              {
                global.modaccounts.SaveAccount(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveaccount] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeaccountparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeaccountparent', data, '*accountid', '*parentid').then
            (
              function(world)
              {
                global.modaccounts.ChangeAccountParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeaccountparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireaccount',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireaccount', data, '*accountid', '*cascade').then
            (
              function(world)
              {
                global.modaccounts.ExpireAccount(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireaccount] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkaccountcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkaccountcode', data, '*accountid', '*code').then
            (
              function(world)
              {
                global.modaccounts.CheckAccountCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkaccountcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Exchange rate requests
      spark.on
      (
        'listexchangerates',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listexchangerates', data).then
            (
              function(world)
              {
                global.modxr.ListExchangeRates(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listexchangerates] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newexchangerate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newexchangerate', data, '*name').then
            (
              function(world)
              {
                global.modxr.NewExchangeRate(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newexchangerate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveexchangerate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveexchangerate', data, '*exchangerateid', '*name', '*currency', '*rate', '*provider').then
            (
              function(world)
              {
                global.modxr.SaveExchangeRate(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveexchangerate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireexchangerate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireexchangerate', data, '*exchangerateid').then
            (
              function(world)
              {
                global.modxr.ExpireExchangeRate(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireexchangerate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );
      spark.on
      (
        'latestrates',
        function(data)
        {
          try
          {
            makeWorld(spark, 'latestrates', data).then
            (
              function(world)
              {
                global.modxr.LatestRates(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[latestrates] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Taxcode requests
      spark.on
      (
        'listtaxcodes',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listtaxcodes', data).then
            (
              function(world)
              {
                global.modaccounts.ListTaxCodes(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listtaxcodes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadtaxcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadtaxcode', data, '*taxcodeid').then
            (
              function(world)
              {
                global.modaccounts.LoadTaxCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadtaxcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newtaxcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newtaxcode', data, '*name', '*code', '*percent').then
            (
              function(world)
              {
                global.modaccounts.NewTaxCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newtaxcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savetaxcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savetaxcode', data, '*taxcodeid', '*code', '*name', '*percent').then
            (
              function(world)
              {
                global.modaccounts.SaveTaxCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savetaxcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expiretaxcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expiretaxcode', data, '*taxcodeid').then
            (
              function(world)
              {
                global.modaccounts.ExpireTaxCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expiretaxcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checktaxcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checktaxcode', data, '*taxcodeid', '*code').then
            (
              function(world)
              {
                global.modaccounts.CheckTaxCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checktaxcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Journal requests
      spark.on
      (
        'listjournals',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listjournals', data).then
            (
              function(world)
              {
                global.modjournals.ListJournals(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listjournals] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newjournal',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newjournal', data, '*type', '*entries', 'refno', 'comments').then
            (
              function(world)
              {
                global.modjournals.NewJournal(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[addjournal] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'testjournal',
        function(data)
        {
          try
          {
            makeWorld(spark, 'testjournal', data).then
            (
              function(world)
              {
                global.modjournals.TestJournal(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[testjournal] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Location requests
      spark.on
      (
        'listlocations',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listlocations', data).then
            (
              function(world)
              {
                global.modlocations.ListLocations(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listlocations] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadlocation',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadlocation', data, '*locationid').then
            (
              function(world)
              {
                global.modlocations.LoadLocation(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadlocation] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newlocation',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newlocation', data, '*parentid', '*code', '*name', 'gpslat', 'gpslon', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'attrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'bay', 'level', 'shelf').then
            (
              function(world)
              {
                global.modlocations.NewLocation(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newlocation] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savelocation',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savelocation', data, '*locationid', '*code', '*name', 'gpslat', 'gpslon', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'attrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'bay', 'level', 'shelf').then
            (
              function(world)
              {
                global.modlocations.SaveLocation(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savelocation] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changelocationparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changelocationparent', data, '*locationid', '*parentid').then
            (
              function(world)
              {
                global.modlocations.ChangeLocationParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changelocationparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expirelocation',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirelocation', data, '*locationid', '*cascade').then
            (
              function(world)
              {
                global.modlocations.ExpireLocation(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirelocation] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checklocationcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checklocationcode', data, '*locationid', '*code').then
            (
              function(world)
              {
                global.modlocations.CheckLocationCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checklocationcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Client requests
     spark.on
      (
        'listclients',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listclients', data, 'showinactive').then
            (
              function(world)
              {
                global.modclients.ListClients(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listclients] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadclient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadclient', data, '*clientid').then
            (
              function(world)
              {
                global.modclients.LoadClient(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadclient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newclient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveclient', data, '*parentid', '*name', 'code', 'email1', 'url1', 'phone1', 'fax1', 'contact1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'labeltemplateid', 'isactive', 'issupplier', 'isclient', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2','pricelevel').then
            (
              function(world)
              {
                global.modclients.NewClient(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newclient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveclient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveclient', data, '*clientid', '*parentid', '*name', 'code', 'email1', 'url1', 'phone1', 'fax1', 'contact1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'labeltemplateid', 'isactive', 'issupplier', 'isclient', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2','pricelevel').then
            (
              function(world)
              {
                global.modclients.SaveClient(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveclient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeclientparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeclientparent', data, '*clientid', '*parentid').then
            (
              function(world)
              {
                global.modclients.ChangeClientParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeclientparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireclient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireclient', data, '*clientid', '*cascade').then
            (
              function(world)
              {
                global.modclients.ExpireClient(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireclient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkclientcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkclientcode', data, '*clientid', '*code').then
            (
              function(world)
              {
                global.modclients.CheckClientCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkclientcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listemails',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listemails', data, '*clientid').then
            (
              function(world)
              {
                global.modclients.ListEmails(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listemails] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Client note requests
      spark.on
      (
        'listclientnotes',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listclientnotes', data, '*clientid').then
            (
              function(world)
              {
                global.modclients.ListClientNotes(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listclientnotes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'cleanClientnoteLocally',
        (data) => {
          try
          {
            makeWorld(spark, 'cleanOrdernoteLocally', data).then
            (
              function(world)
              {
                global.modclients.CleanNewClientNode();
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }
          catch (err) 
          {
            global.log.error({as1: true}, '[cleanClientnoteLocally] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newclientnote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newclientnote', data, '*clientid').then
            (
              function(world)
              {
                //global.modclients.NewClientNote(world);
                if(world.clientid == null)
                {
                  global.modclients.NewClientNote_noclientid(world);
                }
                else
                { 
                  global.modclients.NewClientNote(world);
                }
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newclientnote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveclientnote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveclientnote', data, '*clientnoteid', 'notes').then
            (
              function(world)
              {
                global.modclients.SaveClientNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveclientnote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveclientnote_newClient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveclientnote_newClient', data, '*clientnoteid', 'notes').then
            (
              function(world)
              {
                global.modclients.SaveClientNote_newClient(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }
           catch (err)
          {
            global.log.error({as1: true}, '[saveclientnote_newClient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'searchclientnote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listclientnotes', data, '*clientid', '*words').then
            (
              function(world)
              {
                global.modclients.SearchClientNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listclientnotes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Client attachment requests

      spark.on
      (
        'newfolderclientattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newfolderclientattachment', data, '*clientid','parentid').then
            (
              function(world)
              {
                global.modclients.NewFolderClientAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newfolderclientattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listclientattachments',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listclientattachments', data, '*clientid').then
            (
              function(world)
              {
                global.modclients.ListClientAttachments(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listclientattachments] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveclientattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveclientattachment', data, '*name','*clientattachmentid', '*description').then
            (
              function(world)
              {
                global.modclients.SaveClientAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveclientattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeclientattachmentparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeclientattachmentparent', data, '*clientattachmentid','*parentid').then
            (
              function(world)
              {
                global.modclients.ChangeClientAttachmentParent(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeclientattachmentparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireclientattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireclientattachment', data, '*clientattachmentid').then
            (
              function(world)
              {
                global.modclients.ExpireClientAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireclientattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Supplier requests
      spark.on
      (
        'listsuppliers',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listsuppliers', data, 'showinactive').then
            (
              function(world)
              {
                global.modsuppliers.ListSuppliers(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listsuppliers] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadsupplier',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadsupplier', data, '*supplierid').then
            (
              function(world)
              {
                global.modsuppliers.LoadSupplier(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadsupplier] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newsupplier',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newsupplier', data, '*parentid', '*name', 'code', 'url1', 'email1', 'phone1', 'fax1', 'contact1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'shipaddress1', 'shipaddress2', 'shipaddress3', 'shipaddress4', 'shipcity', 'shipstate', 'shippostcode', 'shipcountry', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'deliverydockettemplateid', 'labeltemplateid', 'isactive', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2', 'costofgoodsaccountid', 'incomeaccountid', 'expenseaccountid', 'assetaccountid').then
            (
              function(world)
              {
                global.modsuppliers.NewSupplier(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newsupplier] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savesupplier',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savesupplier', data, '*supplierid', '*name', 'code', 'url1', 'email1', 'phone1', 'fax1', 'contact1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'shipaddress1', 'shipaddress2', 'shipaddress3', 'shipaddress4', 'shipcity', 'shipstate', 'shippostcode', 'shipcountry', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'deliverydockettemplateid', 'labeltemplateid', 'isactive', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2', 'costofgoodsaccountid', 'incomeaccountid', 'expenseaccountid', 'assetaccountid').then
            (
              function(world)
              {
                global.modsuppliers.SaveSupplier(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savesupplier] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changesupplierparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changesupplierparent', data, '*supplierid', '*parentid').then
            (
              function(world)
              {
                global.modsuppliers.ChangeSupplierParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changesupplierparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expiresupplier',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expiresupplier', data, '*supplierid', '*cascade').then
            (
              function(world)
              {
                global.modsuppliers.ExpireSupplier(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expiresupplier] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checksuppliercode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checksuppliercode', data, '*supplierid', '*code').then
            (
              function(world)
              {
                global.modsuppliers.CheckSupplierCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checksuppliercode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Supplier note requests
      spark.on
      (
        'listsuppliernotes',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listsuppliernotes', data, '*supplierid').then
            (
              function(world)
              {
                global.modsuppliers.ListSupplierNotes(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listsuppliernotes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newsuppliernote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newsuppliernote', data, '*supplierid').then
            (
              function(world)
              {
                global.modsuppliers.NewSupplierNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newsuppliernote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savesuppliernote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savesuppliernote', data, '*suppliernoteid', 'notes').then
            (
              function(world)
              {
                global.modsuppliers.SaveSupplierNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savesuppliernote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Supplier attachment requests
      spark.on
      (
        'listsupplierattachments',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listsupplierattachments', data, '*supplierid').then
            (
              function(world)
              {
                global.modsuppliers.ListSupplierAttachments(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listsupplierattachments] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savesupplierattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savesupplierattachment', data, '*supplierattachmentid', '*description').then
            (
              function(world)
              {
                global.modsuppliers.SaveSupplierAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savesupplierattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expiresupplierattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expiresupplierattachment', data, '*supplierattachmentid').then
            (
              function(world)
              {
                global.modsuppliers.ExpireSupplierAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expiresupplierattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Employee requests
      spark.on
      (
        'listemployees',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listemployees', data).then
            (
              function(world)
              {
                global.modemployees.ListEmployees(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listemployees] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loademployee',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loademployee', data, '*employeeid').then
            (
              function(world)
              {
                global.modemployees.LoadEmployee(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loademployee] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newemployee',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newemployee', data, '*parentid', '*lastname', '*firstname', 'title', 'code', 'altcode', 'email1', 'phone1', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dob', 'startdate', 'enddate', 'payamount', 'payrate', 'payfrequency', 'paystdperiod', 'wageaccountid', 'superfundid', 'taxfileno', 'taxtable', 'employmenttype', 'employmentstatus', 'overtimeallowed', 'workhours', 'gender').then
            (
              function(world)
              {
                global.modemployees.NewEmployee(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newemployee] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveemployee',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveemployee', data, '*employeeid', '*lastname', '*firstname', 'title', 'code', 'altcode', 'email1', 'phone1', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dob', 'startdate', 'enddate', 'payamount', 'payrate', 'payfrequency', 'paystdperiod', 'wageaccountid', 'superfundid', 'taxfileno', 'taxtable', 'employmenttype', 'employmentstatus', 'overtimeallowed', 'workhours', 'gender').then
            (
              function(world)
              {
                global.modemployees.SaveEmployee(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveemployee] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeemployeeparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeemployeeparent', data, '*employeeid', '*parentid').then
            (
              function(world)
              {
                global.modemployees.ChangeEmployeeParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeemployeeparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireemployee',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireemployee', data, '*employeeid', '*cascade').then
            (
              function(world)
              {
                global.modemployees.ExpireEmployee(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireemployee] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkemployeecode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkemployeecode', data, '*employeeid', '*code').then
            (
              function(world)
              {
                global.modemployees.CheckEmployeeCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkemployeecode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'nextemployeecode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'nextemployeecode', data).then
            (
              function(world)
              {
                global.modemployees.NextEmployeeCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[nextemployeecode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // User requests
      spark.on
      (
        'newuser',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newuser', data, '*name', '*uid', '*pwd', '*clientid', '*email', '*mobile', '*avatar', '*isadmin', 'isclient').then
            (
              function(world)
              {
                global.modauth.NewUser(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newuser] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveuser',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveuser', data, '*useruuid', '*name', '*uid', '*clientid', '*email', '*mobile', '*isadmin', '*avatar', '*isclient', '*clientid').then
            (
              function(world)
              {
                global.modauth.SaveUser(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveuser] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireuser',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireuser', data, '*useruuid').then
            (
              function(world)
              {
                global.modauth.ExpireUser(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireuser] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkuseruid',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkuseruid', data, '*useruuid', '*uid').then
            (
              function(world)
              {
                global.modauth.CheckUserUid(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkuseruid] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changepassword',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changepassword', data, '*useruuid', '*pwd').then
            (
              function(world)
              {
                global.modauth.ChangePassword(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changepassword] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listusers',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listusers', data).then
            (
              function(world)
              {
                global.modauth.ListUsers(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listusers] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listconnectedusers',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listconnectedusers', data).then
            (
              function(world)
              {
                global.modauth.ListConnectedUsers(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listconnectedusers] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loaduser',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loaduser', data, '*useruuid').then
            (
              function(world)
              {
                global.modauth.LoadUser(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loaduser] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveuserpermissions',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveuserpermissions', data, '*useruuid', '*permissions').then
            (
              function(world)
              {
                global.modauth.SaveUserPermissions(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveuserpermissions] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Config requests
      spark.on
      (
        'listprinttemplates',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listprinttemplates', data).then
            (
              function(world)
              {
                global.modconfig.ListPrintTemplates(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listprinttemplates] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveprinttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveprinttemplate', data, '*printtemplateid', '*description').then
            (
              function(world)
              {
                global.modconfig.SavePrintTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveprinttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireprinttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireprinttemplate', data, '*printtemplateid').then
            (
              function(world)
              {
                global.modconfig.ExpirePrintTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireprinttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadconfig',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadconfig', data).then
            (
              function(world)
              {
                global.modconfig.LoadConfig(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadconfig] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveconfig',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveconfig', data, '*orderasquote', '*statusid', '*inventoryadjustaccountid', '*currentorderno', '*currentporderno', '*currentinvoiceno', '*currentjournalno', '*currentclientno', '*currentsupplierno', '*currentempno', '*currentjobsheetno', '*currentbarcodeno', '*inventoryusefifo', '*expressfee', '*defaultinventorylocationid', '*gstpaidaccountid', '*gstcollectedaccountid', '*invoiceprinttemplateid', '*orderprinttemplateid', '*quoteprinttemplateid', '*deliverydocketprinttemplateid', '*araccountid', '*apaccountid', '*fyearstart', '*fyearend', '*companyname', '*address1', '*address2', '*address3', '*address4', '*city', '*state', '*postcode', '*country', '*bankname', '*bankbsb', '*bankaccountno', '*bankaccountname', '*productcostofgoodsaccountid', '*productincomeaccountid', '*productassetaccountid', '*productbuytaxcodeid', '*productselltaxcodeid', '*autosyncbuildtemplates', '*posclientid').then
            (
              function(world)
              {
                global.modconfig.SaveConfig(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveconfig] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loademailtemplates',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loademailtemplates', data).then
            (
              function(world)
              {
                global.modconfig.LoadEmailTemplates(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loademailtemplates] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveemailtemplates',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveemailtemplates', data, '*emailordertemplate', '*emailinvoicetemplate', '*emailquotetemplate').then
            (
              function(world)
              {
                global.modconfig.SaveEmailTemplates(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveemailtemplates] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Superfund requests
      spark.on
      (
        'listsuperfunds',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listsuperfunds', data).then
            (
              function(world)
              {
                global.modaccounts.ListSuperfunds(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listsuperfunds] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newsuperfund',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newsuperfund', data, '*name').then
            (
              function(world)
              {
                global.modaccounts.NewSuperfund(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newsuperfund] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savesuperfund',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savesuperfund', data, '*superfundid', '*name').then
            (
              function(world)
              {
                global.modaccounts.SaveSuperfund(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savesuperfund] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expiresuperfund',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expiresuperfund', data, '*superfundid').then
            (
              function(world)
              {
                global.modaccounts.ExpireSuperfund(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expiresuperfund] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checksuperfundname',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checksuperfundname', data, '*name').then
            (
              function(world)
              {
                global.modaccounts.CheckSuperfundName(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checksuperfundname] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Product category requests
      spark.on
      (
        'listproductcategories',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductcategories', data).then
            (
              function(world)
              {
                global.modproducts.ListProductCategories(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductcategories] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadproductcategory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadproductcategory', data, '*productcategoryid').then
            (
              function(world)
              {
                global.modproducts.LoadProductCategory(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadproductcategory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newproductcategory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newproductcategory', data, '*code', '*name', '*parentid').then
            (
              function(world)
              {
                global.modproducts.NewProductCategory(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newproductcategory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveproductcategory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveproductcategory', data, '*productcategoryid', '*name', 'code').then
            (
              function(world)
              {
                global.modproducts.SaveProductCategory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveproductcategory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeproductcategoryparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeproductcategoryparent', data, '*productcategoryid', '*parentid').then
            (
              function(world)
              {
                global.modproducts.ChangeProductCategoryParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeproductcategoryparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireproductcategory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireproductcategory', data, '*productcategoryid', '*cascade').then
            (
              function(world)
              {
                global.modproducts.ExpireProductCategory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireproductcategory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkproductcategorycode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkproductcategorycode', data, '*productcategoryid', '*code').then
            (
              function(world)
              {
                global.modproducts.CheckProductCategoryCode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkproductcategorycode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Product requests
      spark.on
      (
        'listproducts',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproducts', data, 'showinactive').then
            (
              function(world)
              {
                global.modproducts.ListProducts(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproducts] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listproductsbycategory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductsbycategory', data, '*productcategoryid').then
            (
              function(world)
              {
                global.modproducts.ListProductsByCategory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductsbycategory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadproduct',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadproduct', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.LoadProduct(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadproduct] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newproduct',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newproduct', data, '*name', '*productcategoryid', '*code', '*name', 'altcode', 'barcode', 'costprice', 'uom', 'uomsize', 'clientid', 'isactive', 'buytaxcodeid', 'selltaxcodeid', 'costofgoodsaccountid', 'incomeaccountid', 'assetaccountid', 'buildtemplateid', 'minqty', 'warnqty', 'width', 'length', 'height', 'weight', 'price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10', 'price11', 'price12', 'atttrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'productaliasid', 'location1id', 'location2id','discountcodeid','listpricecodeid','saleuom','saleuomsize','price13','price14','price15').then
            (
              function(world)
              {
                global.modproducts.NewProduct(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newproduct] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveproduct',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveproduct', data, '*name', '*productid', '*code', '*name', 'altcode', 'barcode', 'costprice', 'uom', 'uomsize', 'clientid', 'isactive', 'buytaxcodeid', 'selltaxcodeid', 'costofgoodsaccountid', 'incomeaccountid', 'assetaccountid', 'buildtemplateid', 'minqty', 'warnqty', 'width', 'length', 'height', 'weight', 'price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10', 'price11', 'price12', 'price13', 'price14','price15', 'atttrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'productaliasid', 'location1id', 'location2id','discountcodeid','listcodeid','saleuom','saleuomsize').then
            (
              function(world)
              {
                global.modproducts.SaveProduct(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveproduct] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeproductcategory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeproductcategory', data, '*productid', '*productcategoryid').then
            (
              function(world)
              {
                global.modproducts.ChangeProductCategory(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeproductcategory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'duplicateproduct',
        function(data)
        {
          try
          {
            makeWorld(spark, 'duplicateproduct', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.DuplicateProduct(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[duplicateproduct] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkproductcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkproductcode', data, '*productid', '*code').then
            (
              function(world)
              {
                global.modproducts.CheckProductCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkproductcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireproduct',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireproduct', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.ExpireProduct(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireproduct] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'productsearch',
        function(data)
        {
          try
          {
            makeWorld(spark, 'productsearch', data, '*value').then
            (
              function(world)
              {
                global.modproducts.SearchProducts(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[productsearch] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Product code requests
      spark.on
      (
        'newproductcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newproductcode', data, '*productid', '*code', 'barcode', 'supplierid').then
            (
              function(world)
              {
                global.modproducts.NewProductCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newproductcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listproductcodes',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductcodes', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.ListProductCodes(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductcodes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireproductcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireproductcode', data, '*productcodeid').then
            (
              function(world)
              {
                global.modproducts.ExpireProductCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireproductcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Product pricing requests
      spark.on
      (
        'listproductpricing',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductpricing', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.ListProductPricing(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductpricing] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newproductpricing',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newproductpricing', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.NewProductPricing(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newproductpricing] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveproductpricing',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveproductpricing', data, '*priceid', '*productid', '*price', 'clientid', 'minqty', 'maxqty', 'price1', 'price2', 'price3', 'price4', 'price5','datefrom','dateto').then
            (
              function(world)
              {
                global.modproducts.SaveProductPricing(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveproductpricing] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireproductpricing',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireproductpricing', data, '*priceid').then
            (
              function(world)
              {
                global.modproducts.ExpireProductPricing(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireproductpricing] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listdiscountcode',
        function(data)
        {
          try
          {
            makeWorld(spark,'listdiscountcode',data).then
            (
              function(world)
              {
                global.modproducts.ListDiscountCode(world);
              }
            ).then
            (
              null,
              function(err)
              {

              }
            );
          }

          catch(err)
          {
            global.log.error({as1: true}, '[listdiscountcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newdiscountcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newdiscountcode', data).then
            (
              function(world)
              {
                global.modproducts.NewDiscountCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newdiscountcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savediscountcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savediscountcode', data, '*discountcodeid', 'fullname', 'shortname', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8','level9','level10','level11','level12','level13','level14','level15').then
            (
              function(world)
              {
                global.modproducts.SaveDiscountCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savediscountcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expirediscountcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirediscountcode', data, '*discountcodeid').then
            (
              function(world)
              {
                global.modproducts.ExpireDiscountCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirediscountcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listlistpricecode',
        function(data)
        {
          try
          {
            makeWorld(spark,'listlistpricecode',data).then
            (
              function(world)
              {
                global.modproducts.ListListPriceCode(world);
              }
            ).then
            (
              null,
              function(err)
              {

              }
            );
          }

          catch(err)
          {
            global.log.error({as1: true}, '[listdiscountcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newlistpricecode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newlistpricecode', data).then
            (
              function(world)
              {
                global.modproducts.NewListPriceCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newlistpricecode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savelistpricecode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savelistpricecode', data, '*listpricecodeid', 'fullname', 'shortname', 'parameter').then
            (
              function(world)
              {
                global.modproducts.SaveListPriceCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savelistpricecode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expirelistpricecode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirelistpricecode', data, '*listpricecodeid').then
            (
              function(world)
              {
                global.modproducts.ExpireListPriceCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirelistpricecode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Build template requests
      spark.on
      (
        'searchbuilttemplates_bycodeandname',
        function(data)
        {
          try
          {
            makeWorld(spark, 'searchbuilttemplates_bycodeandname', data, '*inputValue','*pageSize','*offset').then
            (
              function(world)
              {
                global.modproducts.SearchBuildTemplates_ByCodeAndName(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[searchbuilttemplates_bycodeandname] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listbuildtemplates_pagination',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listbuildtemplates_pagination', data, '*pageSize','*offset','pageNumber').then
            (
              function(world)
              {
                global.modproducts.ListBuildTemplates_Pagination(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listbuildtemplates_pagination] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'searchrootbuildtemplates_bycodeandname',
        function(data)
        {
          try
          {
            makeWorld(spark, 'searchrootbuildtemplates_bycodeandname', data, '*inputValue', '*pageSize', '*offset').then
            (
              function(world)
              {
                global.modproducts.SearchRootBuildTemplates_ByCodeAndName(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[searchrootbuildtemplates_bycodeandname] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listbuildtemplate_ByparentID',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listbuildtemplate_ByparentID', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.ListBuildTemplates_ByParentID(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listbuildtemplate_ByparentID] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'buildtemplategetchildren',
        function(data)
        {
          try
          {
            makeWorld(spark, 'buildtemplategetchildren', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.BuildTemplateGetChildren(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[buildtemplategetchildren] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'newbuildtemplate',
        function(data)
        {
          try
          {
            console.log(data);
            makeWorld(spark, 'newbuildtemplate', data, '*code', '*templates', 'clientid').then
            (
              function(world)
              {
                global.modproducts.NewBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newbuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'syncbuildtemplatefromproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'syncbuildtemplatefromproducttemplate', data, '*producttemplateid').then
            (
              function(world)
              {
                global.modproducts.SyncBuildTemplateFromProductTemplate(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[syncbuildtemplatefromproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'savebuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savebuildtemplate', data, '*buildtemplateid', '*name', 'code', 'clientid', 'taxcodeid', 'price', 'qty').then
            (
              function(world)
              {
                global.modproducts.SaveBuildTemplate(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savebuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changebuildtemplateparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changebuildtemplateparent', data, '*buildtemplateid', '*parentid','pageNumber').then
            (
              function(world)
              {
                global.modproducts.ChangeBuildTemplateParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changebuildtemplateparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'buildbuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'buildbuildtemplate', data, '*buildtemplateid', '*productid', '*qty').then
            (
              function(world)
              {
                global.modproducts.BuildBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[buildbuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'expirebuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirebuildtemplate', data, '*buildtemplateid', 'cascade').then
            (
              function(world)
              {
                global.modproducts.ExpireBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirebuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'duplicatebuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'duplicatebuildtemplate', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.DuplicateBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[duplicatebuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'syncbuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'syncbuildtemplate', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.SyncBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[syncbuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'syncbuildtemplatestomaster',
        function(data)
        {
          try
          {
            makeWorld(spark, 'syncbuildtemplatestomaster', data).then
            (
              function(world)
              {
                global.modproducts.SyncBuildTemplatesToMaster(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[syncbuildtemplatestomaster] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'buildtemplatesearch',
        function(data)
        {
          try
          {
            makeWorld(spark, 'buildtemplatesearch', data, '*value').then
            (
              function(world)
              {
                global.modproducts.SearchBuildTemplates(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[buildtemplatesearch] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'listbuildtemplateroots',
        function(data)
        {
          try
          {
            makeWorld(spark, 'buildtemplatesearch', data, '*value').then
            (
              function(world)
              {
                global.modproducts.SearchBuildTemplates(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[buildtemplatesearch] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      // Build template detail requests
      spark.on
      (
        'listproductsbybuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductsbybuildtemplate', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.ListProductsByBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductsbybuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listbuildproductsforbuild',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listbuildproductsforbuild', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.ListBuildProductsForBuild(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listbuildproductsforbuild] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'newbuildtemplatedetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newbuildtemplatedetail', data, '*buildtemplateid', '*productid', '*qty', '*price').then
            (
              function(world)
              {
                global.modproducts.NewBuildTemplateDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newbuildtemplatedetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'savebuildtemplatedetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savebuildtemplatedetail', data, '*buildtemplatedetailid', '*productid', 'price', 'qty', 'taxcodeid', 'pertemplateqty').then
            (
              function(world)
              {
                global.modproducts.SaveBuildTemplateDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savebuildtemplatedetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'expirebuildtemplatedetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirebuildtemplatedetail', data, '*buildtemplatedetailid').then
            (
              function(world)
              {
                global.modproducts.ExpireBuildTemplateDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirebuildtemplatedetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkbuildtemplatecode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkbuildtemplatecode', data, '*code').then
            (
              function(world)
              {
                global.modproducts.CheckBuildTemplateCode(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkbuildtemplatecode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Product template requests
      spark.on
      (
        'listproducttemplates',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproducttemplates', data).then
            (
              function(world)
              {
                global.modproducts.ListProductTemplates(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listprodlistproducttemplates] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'newproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newproducttemplate', data, '*name', '*parentid').then
            (
              function(world)
              {
                global.modproducts.NewProductTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'saveproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveproducttemplate', data, '*producttemplateid', '*name', 'code', 'clientid', 'taxcodeid', 'price', 'qty').then
            (
              function(world)
              {
                global.modproducts.SaveProductTemplate(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'changeproducttemplateparent',
        function(data)
        {
          try
          {
            makeWorld(spark, 'changeproducttemplateparent', data, '*producttemplateid', '*parentid').then
            (
              function(world)
              {
                global.modproducts.ChangeProductTemplateParent(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[changeproducttemplateparent] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'buildproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'buildproducttemplate', data, '*producttemplateid', '*productid', '*qty').then
            (
              function(world)
              {
                global.modproducts.BuildProductTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[buildproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireproducttemplate', data, '*producttemplateid', 'cascade').then
            (
              function(world)
              {
                global.modproducts.ExpireProductTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'duplicateproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'duplicateproducttemplate', data, '*producttemplateid').then
            (
              function(world)
              {
                global.modproducts.DuplicateProductTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[duplicateproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'syncproducttemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'syncproducttemplate', data, '*producttemplateid').then
            (
              function(world)
              {
                global.modproducts.SyncProductTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[syncproducttemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      // Product template detail requests
      spark.on
      (
        'listproductsbytemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductsbytemplate', data, '*producttemplateid').then
            (
              function(world)
              {
                global.modproducts.ListProductsByTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductsbytemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listproductsforbuild',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listproductsforbuild', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modproducts.ListProductsForBuild(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listproductsforbuild] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      spark.on
      (
        'newproducttemplatedetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newproducttemplatedetail', data, '*producttemplateid', '*productid', '*qty', '*price').then
            (
              function(world)
              {
                global.modproducts.NewProductTemplateDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newproducttemplatedetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveproducttemplatedetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveproducttemplatedetail', data, '*producttemplatedetailid', '*productid', 'price', 'qty', 'taxcodeid', 'pertemplateqty').then
            (
              function(world)
              {
                global.modproducts.SaveProductTemplateDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveproducttemplatedetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireproducttemplatedetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireproducttemplatedetail', data, '*producttemplatedetailid').then
            (
              function(world)
              {
                global.modproducts.ExpireProductTemplateDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireproducttemplatedetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );


      // Product pricing requests

      spark.on
      (
        'getproductprices',
        function(data)
        {
          try
          {
            makeWorld(spark, 'getproductprices', data, '*productid').then
            (
              function(world)
              {
                global.modproducts.GetProductPrices(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[getproductprices] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'getprice',
        function(data)
        {
          try
          {
            makeWorld(spark, 'getprice', data, '*productid', 'clientid', 'qty','pricelevel','discountcode').then
            (
              function(world)
              {
                global.modproducts.GetPrice(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[getprice] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Printing requests

      spark.on
      (
        'printinvoices',
        function(data)
        {
          try
          {
            makeWorld(spark, 'printinvoices', data, '*orders').then
            (
              function(world)
              {
                global.modprinting.PrintInvoices(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[printinvoices] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'printorders',
        function(data)
        {
          try
          {
            makeWorld(spark, 'printorders', data, '*orders').then
            (
              function(world)
              {
                global.modprinting.PrintOrders(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[printorders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'printdeliverydockets',
        function(data)
        {
          try
          {
            makeWorld(spark, 'printdeliverydockets', data, '*orders').then
            (
              function(world)
              {
                global.modprinting.PrintDeliveryDockets(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[printdeliverydockets] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'printquotes',
        function(data)
        {
          try
          {
            makeWorld(spark, 'printquotes', data, '*orders').then
            (
              function(world)
              {
                global.modprinting.PrintQuotes(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[printquotes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'emailorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'emailorder', data, '*orderid', '*recipients', '*subject', '*message').then
            (
              function(world)
              {
                global.modprinting.EmailOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[emailorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'emailinvoice',
        function(data)
        {
          try
          {
            makeWorld(spark, 'emailinvoice', data, '*orderid', '*recipients', '*subject', '*message').then
            (
              function(world)
              {
                global.modprinting.EmailInvoice(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[emailinvoice] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // POrder requests
      spark.on
      (
        'listporders',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listporders', data, 'maxhistory').then
            (
              function(world)
              {
                global.modporders.ListPOrders(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listporders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadporder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadporder', data, '*porderid').then
            (
              function(world)
              {
                global.modporders.LoadPOrder(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadporder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newpordersupplier',
        function(data)
        {
          try
          {
            // Note eventname is same as newporder so supplier gets same event generated....
            makeWorld(spark, 'newporder', data, '*name', '*supplierid', 'refno', 'invoiceno', 'invoicetoname', 'invoicetoaddress1', 'invoicetoaddress2', 'invoicetoaddress3', 'invoicetoaddress4', 'invoicetocity', 'invoicetostate', 'invoicetopostcode', 'invoicetocountry', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', '*products').then
            (
              function(world)
              {
                global.modporders.NewPOrderSupplier(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newpordersupplier] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savepordersupplier',
        function(data)
        {
          try
          {
            // Note eventname is same as newporder so supplier gets same event generated....
            makeWorld(spark, 'saveporder', data, '*porderid', '*name', '*supplierid', 'refno', 'invoiceno', 'invoicetoname', 'invoicetoaddress1', 'invoicetoaddress2', 'invoicetoaddress3', 'invoicetoaddress4', 'invoicetocity', 'invoicetostate', 'invoicetopostcode', 'invoicetocountry', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', '*products').then
            (
              function(world)
              {
                global.modporders.SavePOrderSupplier(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savepordersupplier] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'searchporders',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listporders', data, 'porderno', 'name', 'suppliers', 'postcode', 'city', 'country', 'state', 'datefrom', 'dateto', 'maxhistory').then
            (
              function(world)
              {
                global.modporders.SearchPOrders(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[searchporders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireporder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireporder', data, '*porderid').then
            (
              function(world)
              {
                global.modporders.ExpirePOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireporder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'completeporder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'completeporder', data, '*porderid').then
            (
              function(world)
              {
                global.modporders.CompletePOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[completeporder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // POrder detail requests
      spark.on
      (
        'listporderdetails',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listporderdetails', data, '*porderid').then
            (
              function(world)
              {
                global.modporders.ListPOrderDetails(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listporderdetails] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Order requests
      spark.on
      (
        'listorders',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listorders', data, 'maxhistory').then
            (
              function(world)
              {
                global.modorders.ListOrders(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listorders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadorder', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.LoadOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[loadorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'neworderclient',
        function(data)
        {
          try
          {
            // Note eventname is same as neworder so client gets same event generated....
            makeWorld(spark, 'neworder', data, '*clientid', '*name', '*products', 'pono', 'invoicetoname', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'shiptonote', 'quotetemplateid', 'ordertemplateid', 'invoicetemplateid', 'isrepeat', 'startdate', 'enddate', 'freightprice').then
            (
              function(world)
              {
                global.modorders.NewOrderClient(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[neworder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveorder', data, '*orderid', '*clientid', '*name', 'pono', 'activeversion', 'startdate', 'enddate', 'invoicetoname', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'shiptonote', 'quotetemplateid', 'ordertemplateid', 'invoicetemplateid', 'isrepeat', 'freightprice').then
            (
              function(world)
              {
                global.modorders.SaveOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'duplicateorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'duplicateorder', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.DuplicateOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[duplicateorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireorder', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.ExpireOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'checkorderpo',
        function(data)
        {
          try
          {
            makeWorld(spark, 'checkorderpo', data, '*orderid', '*pono').then
            (
              function(world)
              {
                global.modorders.CheckPONo(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[checkorderpo] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newversionorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newversionorder', data, '*orderid', '*version').then
            (
              function(world)
              {
                global.modorders.NewVersionOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newversionorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'searchorders',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listorders', data, 'orderno', 'pono', 'name', 'version', 'clients', 'shippostcode', 'shipcity', 'shipcountry', 'shipstate', 'datefrom', 'dateto', 'maxhistory').then
            (
              function(world)
              {
                global.modorders.SearchOrders(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[searchorders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'createinvoicefromorder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'createinvoicefromorder', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.CreateInvoice(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[createinvoicefromorder] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'orderpay',
        function(data)
        {
          try
          {
            makeWorld(spark, 'orderpay', data, '*orderid', '*amount').then
            (
              function(world)
              {
                global.modorders.OrderPay(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[orderpay] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Order note requests
      spark.on
      (
        'listordernotes',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listordernotes', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.ListOrderNotes(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listordernotes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'cleanOrdernoteLocally',
        (data) => {
          try
          {
            makeWorld(spark, 'cleanOrdernoteLocally', data).then
            (
              function(world)
              {
                global.modorders.CleanOrderNoteLocally();
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }
          catch (err) 
          {
            global.log.error({as1: true}, '[cleanOrdernoteLocally] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newordernote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newordernote', data, '*orderid').then
            (
              function(world)
              {
                //global.modorders.NewOrderNote(world);
                if(world.orderid == null){
                  global.modorders.NewOrderNote_NoOrderID(world);
                }
                else
                  global.modorders.NewOrderNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newordernote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveordernote_neworder',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveordernote_neworder', data, '*ordernoteid', 'notes').then
            (
              function(world)
              {
                global.modorders.SaveOrderNote_NewOrder(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }
           catch (err)
          {
            global.log.error({as1: true}, '[saveordernote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveordernote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveordernote', data, '*ordernoteid', 'notes').then
            (
              function(world)
              {
                global.modorders.SaveOrderNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveordernote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'searchordernote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listordernotes', data, '*orderid', '*words').then
            (
              function(world)
              {
                global.modorders.SearchOrderNote(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listordernotes] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Order status requests
      spark.on
      (
        'listorderstatuses',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listorderstatuses', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.ListOrderStatuses(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listorderstatuses] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'neworderstatus',
        function(data)
        {
          try
          {
            makeWorld(spark, 'neworderstatus', data, '*orderid', '*status', 'connote', 'carriername', 'comment', 'batchno').then
            (
              function(world)
              {
                global.modorders.NewOrderStatus(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[neworderstatus] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // TPCC specific requests
      spark.on
      (
        'tpccproductcategoryfrombuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccproductcategoryfrombuildtemplate', data, '*buildtemplateid').then
            (
              function(world)
              {
                global.modtpcc.TPCCProductCategoryFromBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccproductcategoryfrombuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccbuild',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccbuild', data, '*buildtemplateid', '*orderid', '*jobsheetid', '*itype', '*productid', 'numcartons', 'numcups').then
            (
              function(world)
              {
                global.modtpcc.TPCCBuildInventory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccbuild] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccorderbuilds',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccorderbuilds', data).then
            (
              function(world)
              {
                global.modtpcc.TPCCOrderBuilds(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccorderbuilds] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccprintjobsheet',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccprintjobsheet', data, '*jobsheetid').then
            (
              function(world)
              {
                global.modtpcc.TPCCPrintJobSheet(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccprintjobsheet] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccloadjobsheet',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccloadjobsheet', data, '*jobsheetid').then
            (
              function(world)
              {
                global.modtpcc.TPCCLoadJobSheet(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccloadjobsheet] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccsavejobsheet',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccsavejobsheet', data, '*jobsheetid', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 'num8', 'num9', 'num10', 'num11', 'num12', 'num13', 'txt1', 'txt2', 'txt3', 'txt4', 'txt5', 'txt6', 'comment', 'iswide').then
            (
              function(world)
              {
                global.modtpcc.TPCCSaveJobSheet(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccsavejobsheet] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccstartjobsheet',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccstartjobsheet', data, '*jobsheetid').then
            (
              function(world)
              {
                global.modtpcc.TPCCStartJobSheet(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccstartjobsheet] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccendjobsheet',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccendjobsheet', data, '*jobsheetid').then
            (
              function(world)
              {
                global.modtpcc.TPCCEndJobSheet(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccendjobsheet] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccjobsheetsort',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccjobsheetsort', data, '*jobs').then
            (
              function(world)
              {
                global.modtpcc.TPCCJobSheetSort(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccjobsheetsort] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccaddjobsheetdetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccaddjobsheetdetail', data, '*jobsheetid', '*itype', 'num1', 'num2', 'txt1', 'txt2', 'batchno', 'machineid', 'employeeid').then
            (
              function(world)
              {
                global.modtpcc.TPCCAddJobSheetDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpccaddjobsheetdetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpcclistjobsheetdetails',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpcclistjobsheetdetails', data, '*jobsheetid').then
            (
              function(world)
              {
                global.modtpcc.TPCCListJobSheetDetails(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpcclistjobsheetdetails] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpcccreateproductfrombuildtemplate',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpcccreateproductfrombuildtemplate', data, '*productcategoryid', '*clientid', '*code', '*name', '*buildtemplateid').then
            (
              function(world)
              {
                global.modtpcc.TPCCCreateProductFromBuildTemplate(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpcccreateproductfrombuildtemplate] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpcclistmachines',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpcclistmachines', data).then
            (
              function(world)
              {
                global.modtpcc.TPCCListMachines(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpcclistmachines] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpcclistcutters',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpcclistcutters', data).then
            (
              function(world)
              {
                global.modtpcc.TPCCListCutters(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[tpcclistcutters] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'tpccsearchjobsheets',
        function(data)
        {
          try
          {
            makeWorld(spark, 'tpccorderbuilds', data, 'jobsheetno', 'orderno', 'pono', 'name', 'clients', 'shippostcode', 'shipcity', 'shipcountry', 'shipstate', 'datefrom', 'dateto', 'maxhistory').then
            (
              function(world)
              {
                global.modtpcc.TPCCSearchJobSheets(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[searchorders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Order attachment requests
      spark.on
      (
        'listorderattachments',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listorderattachments', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.ListOrderAttachments(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listorderattachments] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveorderattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveorderattachment', data, '*orderattachmentid', '*description', '*isthumbnail').then
            (
              function(world)
              {
                global.modorders.SaveOrderAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveorderattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireorderattachment',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireorderattachment', data, '*orderattachmentid').then
            (
              function(world)
              {
                global.modorders.ExpireOrderAttachment(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireorderattachment] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'getorderthumbnail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'getorderthumbnail', data, '*orderid').then
            (
              function(world)
              {
                global.modorders.GetOrderThumbnail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[getorderthumbnail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Order detail requests
      spark.on
      (
        'listorderdetails',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listorderdetails', data, '*orderid', '*version').then
            (
              function(world)
              {
                global.modorders.ListOrderDetails(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listorderdetails] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'neworderdetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'neworderdetail', data, '*orderid', '*version', '*productid', '*qty', '*price', '*discount', '*expressfee').then
            (
              function(world)
              {
                global.modorders.NewOrderDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[neworderdetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'saveorderdetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'saveorderdetail', data, 'orderdetailid', '*productid', '*price', '*qty', '*discount', '*expressfee', '*version', 'isrepeat', 'isnewartwork').then
            (
              function(world)
              {
                global.modorders.SaveOrderDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[saveorderdetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expireorderdetail',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expireorderdetail', data, '*orderdetailid').then
            (
              function(world)
              {
                global.modorders.ExpireOrderDetail(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expireorderdetail] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Status alert requests
      spark.on
      (
        'liststatusalerts',
        function(data)
        {
          try
          {
            makeWorld(spark, 'liststatusalerts', data, 'maxhistory').then
            (
              function(world)
              {
                global.modalerts.ListStatusAlerts(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[liststatusalerts] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'loadstatusalert',
        function(data)
        {
          try
          {
            makeWorld(spark, 'loadstatusalert', data, '*orderstatusalertid').then
            (
              function(world)
              {
                global.modalerts.LoadStatusAlert(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[liststatusalerts] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'newstatusalert',
        function(data)
        {
          try
          {
            makeWorld(spark, 'newstatusalert', data, '*useruuid', '*statusalertid', 'email', 'mobile').then
            (
              function(world)
              {
                global.modalerts.NewStatusAlert(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[newstatusalert] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'savestatusalert',
        function(data)
        {
          try
          {
            makeWorld(spark, 'savestatusalert', data, '*orderstatusalertid', '*statusalertid', '*useruuid', 'email', 'mobile').then
            (
              function(world)
              {
                global.modalerts.SaveStatusAlert(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[savestatusalert] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expirestatusalert',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirestatusalert', data, '*statusalertid').then
            (
              function(world)
              {
                global.modalerts.ExpireStatusAlert(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirestatusalert] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Invoice requests
      spark.on
      (
        'listinvoices',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listinvoices', data, 'maxhistory').then
            (
              function(world)
              {
                global.modinvoices.ListInvoices(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listinvoices] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listunpaidordersbyclient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listunpaidordersbyclient', data, '*clientid').then
            (
              function(world)
              {
                global.modinvoices.ListUnpaidOrdersByClient(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listunpaidordersbyclient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listunpaidpordersbyclient',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listunpaidpordersbyclient', data, '*clientid').then
            (
              function(world)
              {
                global.modinvoices.ListUnpaidPOrdersByClient(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listunpaidpordersbyclient] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'searchinvoices',
        function(data)
        {
          try
          {
            makeWorld(spark, 'searchinvoices', data, 'invoiceno', 'orderno', 'pono', 'name', 'clients', 'datefrom', 'dateto', 'maxhistory').then
            (
              function(world)
              {
                global.modinvoices.SearchInvoices(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[searchinvoices] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'payinvoices',
        function(data)
        {
          try
          {
            makeWorld(spark, 'payinvoices', data, '*clientid', '*refno', '*type', '*reason', '*datepaid', '*invoices').then
            (
              function(world)
              {
                global.modinvoices.PayInvoices(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[payinvoices] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'paypurchaseorders',
        function(data)
        {
          try
          {
            makeWorld(spark, 'paypurchaseorders', data, '*clientid', '*refno', '*type', '*reason', '*datepaid', '*invoices').then
            (
              function(world)
              {
                global.modinvoices.PayPOrders(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[paypurchaseorders] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Inventory requests
      spark.on
      (
        'liststock',
        function(data)
        {
          try
          {
            makeWorld(spark, 'liststock', data, 'maxhistory').then
            (
              function(world)
              {
                global.modinventory.ListStock(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[liststock] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'addinventory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'addinventory', data, '*productid', 'locationid', '*qty', 'batchno', 'dateexpiry', 'dateproduction', '*type', 'comments').then
            (
              function(world)
              {
                global.modinventory.AddInventory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[addinventory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'transferinventory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'transferinventory', data, '*productid', '*srclocationid', '*dstlocationid', '*qty', 'batchno').then
            (
              function(world)
              {
                global.modinventory.TransferInventory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[transferinventory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'getinventoryproducttotals',
        function(data)
        {
          try
          {
            makeWorld(spark, 'getinventoryproducttotals', data, '*productid').then
            (
              function(world)
              {
                global.modinventory.GetInventoryProductTotals(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[getinventoryproducttotals] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'getinventoryproductlocationtotals',
        function(data)
        {
          try
          {
            makeWorld(spark, 'getinventoryproductlocationtotals', data, '*productid').then
            (
              function(world)
              {
                global.modinventory.GetInventoryProductLocationTotals(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[getinventoryproductlocationtotals] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'buildinventory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'buildinventory', data, '*buildtemplateid', '*orderid', '*productid', '*qty').then
            (
              function(world)
              {
                global.modinventory.BuildInventory(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[buildinventory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listbuilds',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listbuilds', data).then
            (
              function(world)
              {
                global.modinventory.ListBuilds(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listbuilds] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'expirebuild',
        function(data)
        {
          try
          {
            makeWorld(spark, 'expirebuild', data, '*buildid').then
            (
              function(world)
              {
                global.modinventory.ExpireBuild(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[expirebuild] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Order build requests
      spark.on
      (
        'listorderbuilds',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listorderbuilds', data, 'maxhistory').then
            (
              function(world)
              {
                global.modinventory.ListOrderBuilds(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listorderbuilds] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Payroll requests
      spark.on
      (
        'listrtaps',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listrtaps', data).then
            (
              function(world)
              {
                global.modpayroll.ListRTaps(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listrtaps] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'insertrtap',
        function(data)
        {
          try
          {
            makeWorld(spark, 'insertrtap', data, '*employeeid', '*datecreated').then
            (
              function(world)
              {
                global.modpayroll.InsertRTap(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[insertrtap] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Gov requests
      spark.on
      (
        'abnlookup',
        function(data)
        {
          try
          {
            makeWorld(spark, 'abnlookup', data, '*name').then
            (
              function(world)
              {
                global.modgov.ABNLookup(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[abnlookup] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // POS requests
      spark.on
      (
        'posgetproduct',
        function(data)
        {
          try
          {
            makeWorld(spark, 'posgetproduct', data, '*code').then
            (
              function(world)
              {
                global.modpos.POSGetProduct(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[posgetproduct] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'posgenbarcode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'posgenbarcode', data, '*type').then
            (
              function(world)
              {
                global.modpos.POSGenBarcode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[posgenbarcode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'posquote',
        function(data)
        {
          try
          {
            makeWorld(spark, 'posquote', data, '*products', '*total', '*cash', 'clientid', 'mobileno', 'email').then
            (
              function(world)
              {
                global.modpos.POSQuote(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[posquote] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'poscashsale',
        function(data)
        {
          try
          {
            makeWorld(spark, 'poscashsale', data, '*products', '*total', '*cash', 'clientid', 'mobileno', 'email').then
            (
              function(world)
              {
                global.modpos.POSCashSale(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[poscashsale] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'poscreditsale',
        function(data)
        {
          try
          {
            makeWorld(spark, 'poscreditsale', data, '*products', '*total', '*credit', 'clientid', 'mobileno', 'email').then
            (
              function(world)
              {
                global.modpos.POSCreditSale(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[poscreditsale] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'possplitsale',
        function(data)
        {
          try
          {
          makeWorld(spark, 'possplitsale', data, '*products', '*total', '*cash', '*credit', 'clientid', 'mobileno', 'email').then
            (
              function(world)
              {
                global.modpos.POSSplitSale(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[possplitsale] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'possearchsale',
        function(data)
        {
          try
          {
            makeWorld(spark, 'possearchsale', data, 'orderno', 'mobileno', 'email', 'datefrom', 'dateto').then
            (
              function(world)
              {
                global.modpos.POSSearchSale(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[possearchsale] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'posloadsale',
        function(data)
        {
          try
          {
            makeWorld(spark, 'posloadsale', data, '*orderno').then
            (
              function(world)
              {
                global.modpos.POSLoadSale(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[posloadsale] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'posnewcust',
        function(data)
        {
          try
          {
            makeWorld(spark, 'posnewcust', data, '*name', 'abn', 'address1', 'address2', 'city', 'state', 'postcode', 'contact', 'email', 'mobile').then
            (
              function(world)
              {
                global.modpos.POSNewCust(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[posnewcust] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'possalestotal',
        function(data)
        {
          try
          {
            makeWorld(spark, 'possalestotal', data, '*datefrom', '*dateto').then
            (
              function(world)
              {
                global.modpos.POSSalesTotal(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[possalestotal] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Mobile device requests
      spark.on
      (
        'syncipad',
        function(data)
        {
          try
          {
            makeWorld(spark, 'syncipad', data, '*lastsync').then
            (
              function(world)
              {
                global.modipad.Sync(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[syncipad] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Geolocation reqeusts
      spark.on
      (
        'geocode',
        function(data)
        {
          try
          {
            makeWorld(spark, 'geocode', data, '*address').then
            (
              function(world)
              {
                global.modlocations.Geocode(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[geocode] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // MDM requests
      spark.on
      (
        'lastuserpoll',
        function(data)
        {
          try
          {
            makeWorld(spark, 'lastuserpoll', data, '*useruuid').then
            (
              function(world)
              {
                global.modmdm.LastUserPoll(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[lastuserpoll] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // Message requests
      spark.on
      (
        'emailfeedback',
        function(data)
        {
          try
          {
            makeWorld(spark, 'emailfeedback', data, '*comments').then
            (
              function(world)
              {
                global.modmsg.EmailFeedback(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[emailfeedback] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listchatsforme',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listchatsforme', data, 'maxhistory').then
            (
              function(world)
              {
                global.modmsg.ListChatsForMe(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listchatsforme] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'listalertsforme',
        function(data)
        {
          try
          {
            makeWorld(spark, 'listalertsforme', data, 'maxhistory').then
            (
              function(world)
              {
                global.modmsg.ListAlertsForMe(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[listalertsforme] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'sendmsg',
        function(data)
        {
          try
          {
            makeWorld(spark, 'sendmsg', data, '*recipients', '*msg', 'itype', 'gpslat', 'gpslon').then
            (
              function(world)
              {
                global.modmsg.SendMsg(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[sendmsg] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'chatmsg',
        function(data)
        {
          try
          {
            makeWorld(spark, 'chatmsg', data, '*msg', 'recipients').then
            (
              function(world)
              {
                global.modmsg.ChatMsg(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[chatmsg] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'msghistory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'msghistory', data, 'maxhistory').then
            (
              function(world)
              {
                global.modmsg.MsgHistory(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[msghistory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'emailhistory',
        function(data)
        {
          try
          {
            makeWorld(spark, 'emailhistory', data, 'maxhistory').then
            (
              function(world)
              {
                global.modmsg.EmailHistory(world);
              }
            ).then
            (
              null,
              function(ignore)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[emailhistory] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // *******************************************************************************************************************************************************************************************
      // MDM events...
      spark.on
      (
        'newpoll',
        function(data)
        {
          try
          {
            global.modmdm.NewPoll(spark, 'newpoll', data.polldata);
          }

          catch (err)
          {
            global.log.info({as1: true}, '[newpoll] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // *******************************************************************************************************************************************************************************************
      // Reports
      spark.on
      (
        'report',
        function(data)
        {
          try
          {
            makeWorld(spark, 'report', data, 'report', 'datefrom', 'dateto', 'clients', 'categories', 'country', 'state').then
            (
              function(world)
              {
                // Add name of report to pdata for caller...
                world.datefrom = global.moment(world.datefrom).format('YYYY-MM-DD 00:00:00');
                world.dateto = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');
                world.pdata.report = 'report-' + world.report;

                if (world.report == 'orderslocations')
                  global.modreports.OrdersLocations(world);
                else if (world.report == 'topxxorders')
                  global.modreports.TopXXOrders(world);
                else if (world.report == 'topxxproductsbyqty')
                  global.modreports.TopXXProductsByQty(world);
                else if (world.report == 'topxxproductsbyvalue')
                  global.modreports.TopXXProductsByValue(world);
                else if (world.report == 'productsordered')
                  global.modreports.ProductsOrdered(world);

                // POS reports
                else if (world.report == 'pos-salestotals')
                  global.modpos.POSSalesTotal(world);

                // Customer specific reports
                else if (world.report == 'usedproductcodes')
                  global.modreports.TPCCUsedProductCodes(world);
              }
            ).then
            (
              null,
              function(err)
              {
              }
            );
          }

          catch (err)
          {
            global.log.error({as1: true}, '[report] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      if (global.config.modules.counters)
      {
        spark.on
        (
          'getcounters',
          function(data)
          {
            try
            {
              makeWorld(spark, 'getcounters', data).then
              (
                function(world)
                {
                  global.modcounters.GetCounters(world);
                }
              ).then
              (
                null,
                function(err)
                {
                }
              );
            }

            catch (err)
            {
              global.log.error({as1: true}, '[getcounters] ' + global.text_generalexception + ' ' + err.message);
            }
          }
        );
      }


      // *******************************************************************************************************************************************************************************************
      // Finally all event listeners registered.... do something useful and welcome our client...
      // For MDM devices with no login, we'll also generate a unique device token to represent it...
      // TODO: Validate uniqueness of this ID across instances/existing database etc...
      var deviceid = uuidv4();
      spark.emit('welcome', {fguid: fguid, channel: global.config.env.notificationschannel, deviceid: deviceid});
    }
  );

  // *******************************************************************************************************************************************************************************************
  // "External feeds" stuff...
  if (global.config.modules.oxr)
  {
    global.oxr.set({app_id: global.config.openexchangerates.appid});
    global.oxr.latest
    (
      function()
      {
        global.fx.rates = global.oxr.rates;
        global.fx.base = global.oxr.base;
        //console.log(global.fx.convert(99, {from: 'USD', to: 'AUD'}));
        //console.log(global.fx(99).from('USD').to('AUD'));
      }
    );
  }
  else
    global.log.info({as1: true}, '[oxr] not enabled...');

  // *******************************************************************************************************************************************************************************************
  // "Background" stuff...
  if (!global.config.env.windows)
  {
    global.log.info({as1: true}, '[env] non-windows platform...');

    ekg.on
    (
      'cpu',
      function (cpu)
      {
        global.pr.sendToRoom(global.config.env.statschannel, 'stat2', {cpu: cpu});
      }
    );

    ekg.on
    (
      'memory',
      function (memory)
      {
        global.pr.sendToRoom(global.config.env.statschannel, 'stat2', {memory: memory});
      }
    );

    ekg.on
    (
      'proc',
      function (proc)
      {
        proc.uptime = os.sysUptime();
        global.pr.sendToRoom(global.config.env.statschannel, 'stat2', {proc: proc});
      }
    );
  }
  else
    global.log.info({as1: true}, '[env] windows platform...');

  global.ConsoleLog('========== Background stats process launching...');
  ekg.start(1000);

  global.ConsoleLog('========== Http(s) server starting...');
  server.listen(global.config.env.loginPort);

  // *******************************************************************************************************************************************************************************************
  // TODO: If you add/remove/modify primus plugins etc, uncomment and run the following line and copy the JS file to clients...
  // global.pr.library();
  // global.pr.save('primus-compiled.js');

  if (global.config.modules.counters)
    global.modcounters.RefreshCounters();

  global.modconfig.InitialiseCustomerConfigCache();

  //global.modauth.CreateCredentials('iwu', 'letmein');
  // global.modauth.RegisterUser({sprak: 1234, eventname: 'test-eventname', pdata: 'test-pdata', fguid: 'test-fguid', custid: 2, uid: 'iwu', name: 'Ian Wu', pwd: 'letmein', isadmin: 1});
  //global.modauth.LoginUser(1234, 'test-eventname', 'test-fguid', 'iwu', 'letmein', 'test-pdata');
  //global.modauth.LogoutUser(1234, 'test-eventname', 'test-fguid', 'iwu', 'test-pdata');
  //global.modauth.GetUser({spark: 1234, eventname: 'test-eventname', pdata: 'test-pdata', fguid: 'test-fguid', uid: 'iwu'});

  //global.modimport.ImportMyobProducts({filename: 'items.xlsx', cn: {custid: 2, userid: 13}});
  //global.modimport.ImportMyobClients({filename: 'customers.xlsx', cn: {custid: 2, userid: 13}});
  //global.modimport.ImportProducts1({filename: 'product_list.xlsx', cn: {custid: 2, userid: 13}, uuid: '05fcb11de8634dba01690ac7bb55a141'});
  //global.modimport.ImportProducts2({filename: 'product_barcodes.xlsx', cn: {custid: 2, userid: 13}, uuid: '05fcb11de8634dba01690ac7bb55a141'});
  //global.modimport.ImportInventory1({filename: 'invctst2.xlsx', cn: {custid: 2, userid: 13}, uuid: '05fcb11de8634dba01690ac7bb55a141'});

  /*
  var hours =
  [
    // Starts from monday...
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {},
    {},
  ];
  global.safejsonstringify
  (
    hours,
    function(err, json)
    {
      console.log(hours);
      console.log(json);
    }
  );
  */
  //global.modprinting.CalcPayrollFromRtap('2017-03-15', 7);

  //global.modimport.ImportMyobEmployees({filename: 'uploads/imports/aemployees.xlsx', cn: {custid: 2, userid: 13}});

  //global.modprinting.EmailRfidTaps();

  //global.modscripts.Try1();
  //global.modscripts.Try2();
  //global.modscripts.Try3();
  //global.modscripts.Try4();
  //global.modscripts.Try5();
  //global.modscripts.Try6();
  //global.modscripts.Try7();
  //global.modscripts.Try8();
  //global.modscripts.Try9();
  //global.modscripts.Try10();
  //global.modscripts.Try11();
  //global.modscripts.Try12();
  // global.modscripts.Try13();
  //global.modscripts.Try14();
  //global.modscripts.Try15();
  //global.modscripts.Try16();

  /*
  global.modinventory.AddInventory
  (
    {
      cn: {custid: 2, userid: 13},
      productid: 20222,
      locationid: 11,
      qty: -10,
      batchno: '',
      dateexpiry: null,
      dateproduction: null,
      otherid: null,
      comments: '',
      type: 4
    }
  );
  */
}
