var server = 'http://' + self.location.hostname + ':' + self.location.port;
var buildno = '1.0.57';
var geocoder = null;
var primus = null;
var firstconnection = true;
var connected = false;
var fguid = '';
var uid = '';
var uname = '';
var uuid = '';
var session = '';
var isadmin = 0;
var isclient = 0;
var myperms =
{
  canvieworders: 0,
  cancreateorders: 0,
  canviewinvoices: 0,
  cancreateinvoices: 0,
  canviewproducts: 0,
  cancreateproducts: 0,
  canviewinventory: 0,
  cancreateinventory: 0,
  canviewpayroll: 0,
  cancreatepayroll: 0,
  canviewcodes: 0,
  cancreatecodes: 0,
  canviewclients: 0,
  cancreateclients: 0
};
var tabs = null;
var graph = null;
var maxhistory = 50;
var channels = [];
var inittasks = 0;
var completedtasks = 0;
var importtype = '';
//
var tpccgpslat = '-37.749451';
var tpccgpslon = '145.030579';
var tpccorgid = 5183;
//
var errcode_none = 0;
var errcode_nodata = -1;
var errcode_missingparams = -2;
var errcode_fatal = -3;
var errcode_notloggedin = -4;
var errcode_sessionexpired = -5;
var errcode_resourceunavail = -6;
var errcode_dbunavail = -7;
var errcode_userexists = -8;
var errcode_dberr = -9;
var errcode_fileerr = -10;
var errcode_usernotregistered = -11;
var errcode_passwdhash = -12;
var errcode_invalidconnection = -13;
var errcode_invalidlogin = -14;
var errcode_missingurl = -15;
var errcode_smserror = -16;
var errcode_invalidsession = -17;
var errcode_invalidclient = -18;
var errcode_unablerestoresession = -19;
var errcode_committx = -20;
var errcode_jsonparse = -21;
var errcode_jsonstringify = -22;
var errcode_unablecreatenewuser = -23;
var errcode_unableloginuser = -24;
var errcode_unablesaveclient = -25;
var errcode_unablesaveproduct = -26;
var errcode_insufficientqty = -27;
// CSS styles for embedded strings...
var css_gridcol_batchno_expired = 'color: red; font-weight: bold;';
var css_gridcol_batchno = 'color: blue;';
var css_gridcol_qty_neg = 'color: red;';
var css_gridcol_client_price = 'color: blue; font-weight: bold;';
// iTypes...
var itype_inventory_xfer = 1;
var itype_inventory_adjust = 2;
var itype_inventory_order = 3;
var itype_inventory_stock = 4;
var itype_inventory_build = 5;
//
var itype_account_asset = 1;
var itype_account_expense = 2;
var itype_account_liability = 3;
var itype_account_equity = 4;
var itype_account_revenue = 5;
var itype_account_costofgoodssold = 6;
var itype_account_otherrevenue = 7;
var itype_account_otherexpenses = 8;
var itype_account_bank = 99;
//
var itype_order_order = 1;
var itype_order_invoice = 2;
var itype_order_quote = 3;
var itype_order_deliverydocket = 4;
//
var uomtypes =
[
  'Bottle',
  'Carton',
  'Box',
  'Palette',
  'bbl',        // barrel
  'doz',        // dozen
  'floz',       // fluid ounces
  'gal',        // gallon
  'kg',         // kilogram
  'g',          // gram
  'l',          // litres
  'lb',         // pounds
  'm3',         // cubic meter
  'mg',         // milligram
  'mt',         // metric tonne
  'oz',         // ounce
  'ml',         // milli-litre
  't'           // tonne
];
var accounttypes =
[
  {name: 'Assets', id: 1},
  {name: 'Expenses', id: 2},
  {name: 'Liabilities', id: 3},
  {name: 'Equities', id: 4},
  {name: 'Revenues', id: 5},
  {name: 'Cost of Goods Sold', id: 6},
  {name: 'Other Revenue', id: 7},
  {name: 'Other Expenses', id: 8},
  {name: 'Bank', id: 99}
];
var tstypes =
[
  {name: 'Base Pay', id: 1},
  {name: 'Overtime 1', id: 2},
  {name: 'Overtime 2', id: 3},
  {name: 'Overtime 3', id: 4},
  {name: 'Leave - Annual', id: 5},
  {name: 'Leave - Sick & Carers', id: 6},
  {name: 'Leave - Compassionate', id: 7},
  {name: 'Leave - Long Service', id: 8},
  {name: 'Leave - Maternity & Parental', id: 9},
  {name: 'Leave - Worker\'s Compensation', id: 10},
  {name: 'Leave - Community Service', id: 11},
  {name: 'Public Holiday', id: 12},
  {name: 'Other', id: 13}
];
var inventorytypes =
[
  {name: 'Transfer', id: 1},
  {name: 'Adjustment', id: 2},
  {name: 'Order', id: 3},
  {name: 'Stock', id: 4},
  {name: 'Build', id: 5}
];
var payrates =
[
  {name: 'Hourly', id: 1},
  {name: 'Daily', id: 2},
  {name: 'Weekly', id: 3},
  {name: 'Fortnightly', id: 4},
  {name: 'Monthly', id: 5},
  {name: 'Annual', id: 6}
];
var payfrequencies =
[
  {name: 'Weekly', id: 1},
  {name: 'Fortnightly', id: 2},
  {name: 'Monthly', id: 3}
];
var employmenttypes =
[
  {name: 'Full Time', id: 1},
  {name: 'Part Time', id: 2},
  {name: 'Casual', id: 3},
  {name: 'Fixed Term', id: 4},
  {name: 'Contract', id: 5},
  {name: 'Apprentice', id: 6}
];
var employmentstatuses =
[
  {name: 'Employed', id: 1},
  {name: 'Suspended', id: 2},
  {name: 'Leave', id: 3}
];
var paymenttypes =
[
  {name: 'Credit Card', id: 1},
  {name: 'Cheque', id: 2},
  {name: 'EFT', id: 3},
  {name: 'Cash', id: 4},
  {name: 'Other', id: 5}
];
var barcodetypes =
[
  {id: 'codabar'},
  {id: 'code11'},
  {id: 'code29'},
  {id: 'code93'},
  {id: 'code128'},
  {id: 'ean8'},
  {id: 'ean13'},
  {id: 'std25'},
  {id: 'int25'},
  {id: 'msi'},
  {id: 'datamatrix'}
];
var orderstatustypes =
[
  {name: 'Quote', id: 1},
  {name: 'Order', id: 2},
  {name: 'Pending', id: 3},
  {name: 'Approved', id: 4},
  {name: 'Invoiced', id: 5},
  {name: 'Manufacturing', id: 6},
  {name: 'Picking', id: 7},
  {name: 'Shipped', id: 8},
  {name: 'On Hold', id: 9},
  {name: 'Paid', id: 10},
  {name: 'Completed', id: 11},
  {name: 'Received', id: 12},
  {name: 'Back Order', id: 13},
  {name: 'Artwork Approved', id: 14},
  {name: 'P.O. Received', id: 15},
  {name: 'Printing', id: 16},
  {name: 'Comment', id: 99}
];
var avatars =
[
  {name: 'Female 1',     image: 'mp-avatar1.png'},
  {name: 'Female 2',     image: 'mp-avatar2.png'},
  {name: 'Female 3',     image: 'mp-avatar3.png'},
  {name: 'Female 4',     image: 'mp-avatar4.png'},
  {name: 'Female 5',     image: 'mp-avatar5.png'},
  {name: 'Female 6',     image: 'mp-avatar6.png'},
  {name: 'Female 7',     image: 'mp-avatar7.png'},
  {name: 'Female 8',     image: 'mp-avatar8.png'},
  {name: 'Female 9',     image: 'mp-avatar9.png'},
  {name: 'Female 10',    image: 'mp-avatar10.png'},
  {name: 'Black',        image: 'mp-black.png'},
  {name: 'Black Widow',  image: 'mp-blackwidow.png'},
  {name: 'Blue',         image: 'mp-blue.png'},
  {name: 'Brown',        image: 'mp-brown.png'},
  {name: 'Dark Blue',    image: 'mp-darkblue.png'},
  {name: 'Frankenstein', image: 'mp-frankenstein.png'},
  {name: 'Green',        image: 'mp-green.png'},
  {name: 'Grey',         image: 'mp-grey.png'},
  {name: 'Hulk',         image: 'mp-hulk.png'},
  {name: 'iPad',         image: 'mp-ipad.png'},
  {name: 'iPhone',       image: 'mp-iphone.png'},
  {name: 'Iron Man',     image: 'mp-ironman.png'},
  {name: 'Ian',          image: 'mp-iwu.png'},
  {name: 'Mummy',        image: 'mp-mummy.png'},
  {name: 'Mustard',      image: 'mp-mustard.png'},
  {name: 'Orange',       image: 'mp-orange.png'},
  {name: 'Pink',         image: 'mp-pink.png'},
  {name: 'Pumpkin',      image: 'mp-pumpkin.png'},
  {name: 'Purple',       image: 'mp-purple.png'},
  {name: 'Red',          image: 'mp-red.png'},
  {name: 'Skull',        image: 'mp-skull.png'},
  {name: 'Steel Blue',   image: 'mp-steelblue.png'},
  {name: 'Thor',         image: 'mp-thor.png'},
  {name: 'Violet',       image: 'mp-violet.png'},
  {name: 'Witch',        image: 'mp-witch.png'},
  {name: 'Yellow',       image: 'mp-yellow.png'}
];
// Colour (pastel) styles...
// The other RGB chart http://www.tayloredmktg.com/rgb/
var colour_white = '#ffffff';
var colour_black = '#000000';
var colour_steelblue = '#4682b4';
var colour_maroon = '#b03060';
var colour_forestgreen = '#228b22';
var colour_dodgerblue = '#1e90ff';
var colour_orangered =  '#ff4500';
var colour_bisque3 = '#cdb79e';
var colour_honeydew2 = '#e0eee0';
var colour_mistyrose = '#ffe4e1';
var colour_lavender = '#e6e6fa';
var colour_lemonchiffon = '#fffacd';
var colour_slategrey = '#708090';
var colour_snow4 = '#8b8989';
var colour_peachpuff3 = '#cdaf95';
var colour_cornflowerblue = '#6495ed';
var colour_royalblue = '#4169e1';
var colour_skyblue = '#87ceeb';
var colour_darkturquoise = '#00ced1';
var colour_mediumaqumarine = '#66cdaa';
var colour_lawngreen = '#7cfc00';
var colour_darkkhaki = '#bdb76b';
var colour_seagreen = '#2e8b57';
var colour_gold = '#ffd700';
var colour_yellow = '#ffff00';
var colour_goldenrod = '#eee8aa';
var colour_rosybrown = '#bc8f8f';
var colour_indianred = '#cd5c5c';
var colour_sienna = '#a0522d';
var colour_chocolate = '#d2691e';
var colour_deeppink = '#ff1493';
var colour_blueviolet = '#8a2be2';
var colour_purple = '#a020f0';
var colour_mediumorchid = '#ba55d3';
var colour_darkorange = '#ff8c00';
var colour_darkturquoise = '#00ced1';
var colour_cadetblue = '#5f9ea0';
// Caches so we can refresh/redraw/re-populate etc faster - maybe...
var cache_accounts = [];
var cache_employees = [];
var cache_taxcodes = [];
var cache_superfunds = [];
var cache_clients = [];
var cache_suppliers = [];
var cache_locations = [];
var cache_productcategories = [];
var cache_orders = [];
var cache_invoices = [];
var cache_producttemplates = [];
var cache_products = [];
var cache_users = [];
var cache_invstock = [];
var cache_statusalerts = [];
var cache_exchangerates = [];
var cache_timesheets = [];
var cache_journals = [];
var cache_emails = [];
// Cached lists for dialogs...
var cache_productsbycategory = [];
var cache_productsbytemplate = [];
var cache_productsbybuild = [];
var cache_productprices = [];
var cache_clientnotes = [];
var cache_clientattachments = [];
var cache_clientinvoices = [];
var cache_suppliernotes = [];
var cache_supplierattachments = [];
var cache_orderattachments = [];
var cache_userpermissions = [];
var cache_orderversions = [];
var cache_orderstatuses = [];
var cache_ordernotes = [];
var cache_orderproducts = [];
var cache_productpriceselection = [];
var cache_productselection = [];
var cache_printtemplates = [];
var cache_builds = [];
var cache_config = {};

// ************************************************************************************************************************************************************************
// Mapping functions...
function initMap()
{
  geocoder = new google.maps.Geocoder();
  $.getScript
  (
    'js/jquery.geocomplete.min.js'
    ,
    function(data, textStatus, jqxhr)
    {
      $('#fldOrderInvoicetoAddress1').geocomplete().bind
      (
        'geocode:result',
        function(ev, result)
        {
          // Coord in (result.geometry.location.H, result.geometry.location.L)
          $('#fldOrderInvoicetoAddress1').val(result.address_components[0].long_name + ' ' + result.address_components[1].long_name);
          $('#fldOrderInvoicetoCity').val(result.address_components[2].long_name);
          doSelectDropDownList('fldOrderInvoicetoCountry', result.address_components[4].long_name);
          doSelectDropDownList('fldOrderInvoicetoState', result.address_components[3].long_name);
          $('#fldOrderInvoicetoPostcode').val(result.address_components[5].long_name);
        }
      );

      $('#fldOrderShiptoAddress1').geocomplete().bind
      (
        'geocode:result',
        function(ev, result)
        {
          $('#fldOrderShiptoAddress1').val(result.address_components[0].long_name + ' ' + result.address_components[1].long_name);
          $('#fldOrderShiptoCity').val(result.address_components[2].long_name);
          doSelectDropDownList('fldOrderShiptoCountry', result.address_components[4].long_name);
          doSelectDropDownList('fldOrderShiptoState', result.address_components[3].long_name);
          $('#fldOrderShiptoPostcode').val(result.address_components[5].long_name);
        }
      );

      $('#fldMaintLocationAddress1').geocomplete().bind
      (
        'geocode:result',
        function(ev, result)
        {
          $('#fldMaintLocationAddress1').val(result.address_components[0].long_name + ' ' + result.address_components[1].long_name);
          $('#fldMaintLocationCity').val(result.address_components[2].long_name);
          doSelectDropDownList('fldMaintLocationCountry', result.address_components[4].long_name);
          doSelectDropDownList('fldMaintLocationState', result.address_components[3].long_name);
          $('#fldMaintLocationPostcode').val(result.address_components[5].long_name);
          //
          $('#fldMaintLocationGpslat').val(_.formatnumber(result.geometry.location.lat(), 4));
          $('#fldMaintLocationGpslon').val(_.formatnumber(result.geometry.location.lng(), 4));
        }
      );

      $('#fldClientAddress1').geocomplete().bind
      (
        'geocode:result',
        function(ev, result)
        {
          $('#fldClientAddress1').val(result.address_components[0].long_name + ' ' + result.address_components[1].long_name);
          $('#fldClientCity').val(result.address_components[2].long_name);
          doSelectDropDownList('fldClientCountry', result.address_components[4].long_name);
          doSelectDropDownList('fldClientState', result.address_components[3].long_name);
          $('#fldClientPostcode').val(result.address_components[5].long_name);
        }
      );

      $('#fldClientShippingAddress1').geocomplete().bind
      (
        'geocode:result',
        function(ev, result)
        {
          $('#fldClientShippingAddress1').val(result.address_components[0].long_name + ' ' + result.address_components[1].long_name);
          $('#fldClientShippingCity').val(result.address_components[2].long_name);
          doSelectDropDownList('fldClientShippingCountry', result.address_components[4].long_name);
          doSelectDropDownList('fldClientShippingState', result.address_components[3].long_name);
          $('#fldClientShippingPostcode').val(result.address_components[5].long_name);
        }
      );

      $('#fldEmployeeAddress1').geocomplete().bind
      (
        'geocode:result',
        function(ev, result)
        {
          $('#fldEmployeeAddress1').val(result.address_components[0].long_name + ' ' + result.address_components[1].long_name);
          $('#fldEmployeeCity').val(result.address_components[2].long_name);
          doSelectDropDownList('fldEmployeeCountry', result.address_components[4].long_name);
          doSelectDropDownList('fldEmployeeState', result.address_components[3].long_name);
          $('#fldEmployeePostcode').val(result.address_components[5].long_name);
        }
      );
    }
  );
}

function mapMimeTypeToImage(m)
{
  var baseimage = '';

  if (_.hasstring(m, 'image'))
    baseimage = 'mime-image.png';
  else if (_.hasstring(m, 'pdf'))
    baseimage = 'mime-pdf.png';
  else if (_.hasstring(m, 'excel') || _.hasstring(m, 'spreadsheet'))
    baseimage = 'mime-spreadsheet.png';
  else if (_.hasstring(m, 'compress'))
    baseimage = 'mime-zip.png';
  else if (_.hasstring(m, 'document'))
    baseimage = 'mime-doc.png';
  else if (_.hasstring(m, 'powerpoint'))
    baseimage = 'mime-ppt.png';
  else if (_.hasstring(m, 'postscript'))
    baseimage = 'mime-vector.png';
  else if (_.hasstring(m, 'video'))
    baseimage = 'mime-video.png';
  else if (_.hasstring(m, 'audio'))
    baseimage = 'mime-audio.png';
  else
    baseimage = 'mime-attachment.png';

  return '<img width="35" height="35" src="images/mimetypes/' + baseimage + '" />';
}

function mapBoolToImage(b)
{
  // All kinds of booleans...
  var baseimage = _.isUndefined(b) || _.isNull(b) || (b === false) || (b === 0) || (b === '0') ? 'blank.png' : 'tick.png';
  return '<img width="20" height="20" src="images/' + baseimage + '" />';
}

function mapAvatarToImage(avatar)
{
  if (_.isUndefined(avatar) || _.isNull(avatar) || _.isBlank(avatar))
    return '';
  return '<img width="23" height="30" src="images/' + avatar + '" />';
}

function mapUserStatusToImage(u)
{
  var baseimage = 'ball-grey.png';

  if (u == 'online')
    baseimage = 'ball-green.png';
  else if (u == 'offline')
    baseimage = 'ball-black.png';

  return '<img width="30" height="30" src="images/led/' + baseimage + '" />';
}

function mapUuidToImage(uuid)
{
  /*
  if (!_.isUndefined(uuid) && !_.isNull(uuid))
  {
    var rowdata = $('#divUsersGrid').jqxTreeGrid('getRow', uuid);
    // Grid may not be ready yet first time we get this event (for ourselves)....
    if (!_.isUndefined(rowdata) && !_.isNull(rowdata))
      return mapAvatarToImage(rowdata.avatar);
  }
  */
  return '';
}

function mapAccountTypeToImage(t)
{
  var img = '';

  if (status == 'simonline')
    img = 'simonline.png';
  else if (status == 'simoffline')
    img = 'simoffline.png';
  else if (status == 'simactivated')
    img = 'simactivated.png';
  else if (status == 'simdeactivated')
    img = 'simdeactivated.png';
  else if (status == 'simnoconnection')
    img = 'simnoconnection.png';
  else
    img = 'simnotready.png';
  return img;
}

// ************************************************************************************************************************************************************************
// Cursor and messagebox functions...
function showBusy()
{
  $('body').css('cursor', 'progress');
  $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="images/ajax_processing.gif" width="220" height="20"/>');
}

function showIdle(btnToEnable)
{
  $('body').css('cursor', 'default');
  if (connected)
    $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="images/ajax_connected.gif" width="23" height="24"/>');
  else
    $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64disconnected + '" width="24" height="24"/> Waiting for server...');
}

// ************************************************************************************************************************************************************************
// Underscore helpers...
_.mixin(_.str.exports());

_.mixin
(
  {
    escapeSingleQuotes: function(string)
    {
      if (_.isUndefined(string) || _.isNull(string))
        return '';

      if (_.isNumber(string))
        return string;

      return string.replace(/'/g, "\\'");
    }
  }
);

_.mixin
(
  {
    escapeDoubleQuotes: function(string)
    {
      if (_.isUndefined(string) || _.isNull(string))
        return '';

      if (_.isNumber(string))
        return string;

      return string.replace(/"/g, '\\"');
    }
  }
);

_.mixin
(
  {
    repeat: function(string, count)
    {
      if (count < 1)
        return '';

      var result = '';
      var pattern = string.valueOf();

      while (count > 0)
      {
        if (count & 1)
          result += pattern;
        count >>= 1;
        pattern += pattern;
      }
      return result;
    }
  }
);

_.mixin
(
  {
    countslashes: function(string)
    {
      var regex = /\//igm;
      var count = string.match(regex);
      if (_.isUndefined(count) || _.isNull(count))
        return 0;
      return count.length;
    }
  }
);

_.mixin
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

_.mixin
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

_.mixin
(
  {
    makeisomobile: function(m)
    {
      // Strip all non-numeric characters - so hopefully end up with something like 0433123456
      // Then strip out the leading zero and replace with +61
      var n = _.stripnonnumeric(m);

      if (n.substring(0, 1) == '0')
        n = '+61' + n.substring(1);

      return n;
    }
  }
);

_.mixin
(
  {
    makeaddress: function(a)
    {
      var nice = _.isUndefined(a.nice) || _.isNull(a.nice) ? false : a.nice;
      var address1 = _.isUndefined(a.address1) || _.isNull(a.address1) ? '' : _.titleize(a.address1);
      var city = _.isUndefined(a.city) || _.isNull(a.city) ? '' : _.titleize(a.city);
      var state = _.isUndefined(a.state) || _.isNull(a.state) ? '' : _.titleize(a.state);
      var postcode = _.isUndefined(a.postcode) || _.isNull(a.postcode) ? '' : a.postcode;
      var country = _.isUndefined(a.country) || _.isNull(a.country) ? '' : _.titleize(a.country);
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

_.mixin
(
  {
    humaniseSeconds: function(seconds)
    {
      var h = '';
      var numyears = Math.floor(seconds / 31536000);
      var numdays = Math.floor((seconds % 31536000) / 86400);
      var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
      var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
      var numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);

      if (numyears > 0)
      {
        h = numyears;
        if (numyears == 1)
          h += ' Year, ';
        else
          h += ' Years, ';
      }

      if (numdays > 0)
      {
        h += numdays;
        if (numdays == 1)
          h += ' Day, ';
        else
          h += ' Days, ';
      }

      if (numhours > 0)
      {
        h += numhours;
        if (numhours == 1)
          h += ' Hour, ';
        else
          h += ' Hours, ';
      }

      if (numminutes > 0)
      {
        h += numminutes;
        if (numminutes == 1)
          h += ' Minute, ';
        else
          h += ' Minutes, ';
      }

      h += numseconds;
      if (numseconds == 1)
        h += ' Second';
      else
        h += ' Seconds';
      return h;
    }
  }
);

_.mixin
(
  {
    totype: function(obj)
    {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
  }
);

_.mixin
(
  {
    sanitiseAsNumeric: function(n, decimals)
    {
      if (_.isUndefined(n) || _.isNull(n) || isNaN(n) || _.isBlank(n) || (n == 0))
        return 0.0;

      var d = _.isUndefined(decimals) ? 4 : decimals;

      if (n instanceof Decimal)
        return n.toFixed(d);

      var b = new Decimal(n);
      return b.toFixed(d);
    }
  }
);

_.mixin
(
  {
    formatnumber: function(n, decimals, zeroasblank)
    {
      if (_.isUndefined(n) || _.isNull(n) || isNaN(n) || _.isBlank(n) || (n == 0))
        return _.isUndefined(zeroasblank) || (zeroasblank == true) ? '' : 0.0;

      var d = _.isUndefined(decimals) ? 4 : decimals;

      if (n instanceof Decimal)
        return n.toFixed(d);

      var b = new Decimal(n);
      return b.toFixed(d);
    }
  }
);

_.mixin
(
  {
    formatinteger: function(n)
    {
      if (_.isUndefined(n) || _.isNull(n) || isNaN(n) || _.isBlank(n) || (n == 0))
        return '';

      if (n instanceof Decimal)
        return n.toFixed(0);

      var b = new Decimal(n);
      return b.toFixed(0);
    }
  }
);

_.mixin
(
  {
    toBigNum: function(n)
    {
      if (_.isUndefined(n) || _.isNull(n) || isNaN(n) || _.isBlank(n) || (n == 0))
        return new Decimal(0.0);

      if (n instanceof Decimal)
        return n;

      return new Decimal(n);
    }
  }
);

_.mixin
(
  {
    hasstring: function(s1, s2)
    {
      return s1.indexOf(s2) > -1;
    }
  }
);

_.mixin
(
  {
    nicedatetodisplay: function(d)
    {
      if (_.isUndefined(d) || _.isNull(d))
        return '';
      return moment(d).format('YYYY-MM-DD');
    }
  }
);

// ************************************************************************************************************************************************************************
// UI helper functions
function doScrollToTopOfPage()
{
  //$('html,body').scrollTop(0);
  // Little animation instead of snap to top...
  $('html, body').animate({scrollTop: 0}, 'fast');
}

function doDisableInput(i)
{
  $('#' + i).attr('disabled', 'disabled');
}

function doEnableInput(i)
{
  $('#' + i).removeAttr('disabled');
}

function doNiceDate(dt)
{
  return _.isUndefined(dt) || _.isNull(dt) ? '' : moment(dt).format('YYYY-MM-DD HH:mm:ss');
}

function doNiceDateModifiedOrCreated(modified, created)
{
  return _.isUndefined(modified) || _.isNull(modified) ? moment(created).format('YYYY-MM-DD HH:mm:ss') : moment(modified).format('YYYY-MM-DD HH:mm:ss');
}

function doNiceModifiedBy(modified, modifiedby, createdby)
{
  return _.isUndefined(modified) || _.isNull(modified) ? _.titleize(createdby) : _.titleize(modifiedby);
}

function doNiceTitleizeString(s)
{
  return _.isUndefined(s) || _.isNull(s) ? '' : _.titleize(s);
}

function doNiceString(s)
{
  return _.isUndefined(s) || _.isNull(s) || (s.length == 0) ? '' : s;
}

function doNiceId(id)
{
  return _.isUndefined(id) || _.isNull(id) ? null : id;
}

function doNiceIntToBool(i)
{
  return _.isUndefined(i) || _.isNull(i) || (i == 0) ? false : true;
}

// ************************************************************************************************************************************************************************
// TAB functions
function doSelectSalesTab(which)
{
  $('#as1tabs').tabs('select', 2);
  $('#salestabs').tabs('select', which);
}

function doSelectInventoryTab(which)
{
  $('#as1tabs').tabs('select', 4);
  $('#inventorytabs').tabs('select', which);
}

function doSelectBankingTab(which)
{
  $('#as1tabs').tabs('select', 5);
  $('#bankingtabs').tabs('select', which);
}

function doSelectPayrollTab(which)
{
  $('#as1tabs').tabs('select', 6);
  $('#payrolltabs').tabs('select', which);
}

function doSelectAccountsTab(which)
{
  $('#as1tabs').tabs('select', 7);
  $('#accounttabs').tabs('select', which);
}

// ************************************************************************************************************************************************************************
// Data helpers
function doUpdateCacheName(objarr, id, n, d, b)
{
  objarr.forEach
  (
    function(o)
    {
      if (o.id == id)
      {
        o.name = n;

        if (!_.isUndefined(d))
          o.date = d;

        if (!_.isUndefined(b))
          o.by = b;
      }
    }
  );
}

function doUpdateCacheCode(objarr, id, c, d, b)
{
  var result = $.grep(objarr, function(ev) {return ev.id == id;});

  if (!_.isNull(result) && (result.length == 1))
  {
    result.code = c;

    if (!_.isUndefined(d))
      result.date = d;
    if (!_.isUndefined(b))
      result.by = b;
  }
}

function doUpdateCacheParent(objarr, id, p, d, b)
{
  var result = $.grep(objarr, function(ev) {return ev.id == id;});

  if (!_.isNull(result) && (result.length == 1))
  {
    console.log('found account, updating...');
    result.parentid = p;

    if (!_.isUndefined(d))
      result.date = d;
    if (!_.isUndefined(b))
      result.by = b;
  }
}

function doGetUserNameFromUUID(uuid)
{
  var result = $.grep(cache_users, function(ev) {return ev.uuid == uuid;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].name;
}

function doGetCodeFromIdInObjArray(objarr, id)
{
  var result = $.grep(objarr, function(ev) {return ev.id == id;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].code;
}

function doGetStringFromIdInObjArray(objarr, id)
{
  var result = $.grep(objarr, function(ev) {return ev.id == id;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].name;
}

function doGetDescFromIdInObjArray(objarr, id)
{
  var result = $.grep(objarr, function(ev) {return ev.id == id;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].description;
}

function doGetIdFromStringInObjArray(objarr, s)
{
  var result = $.grep(objarr, function(ev) {return ev.name == s;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].id;
}

function doGetNameFromImage(i)
{
  var result = $.grep(avatars, function(ev) {return ev.image == i;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].name;
}

function doGetPercentFromTaxcode(id)
{
  var result = $.grep(cache_taxcodes, function(ev) {return ev.id == id;});

  return _.isNull(result) || (result.length == 0) ? 0.0 : result[0].percent;
}

function doThrowOrderAttachment(orderattachmentid)
{
  var a = $('#ancSpare').get(0);
  a.target = '_blank';
  a.href = '/throworderattachment?orderattachmentid=' + orderattachmentid + '&uuid=' + uuid;
  a.click();
}

function doThrowClientAttachment(clientattachmentid)
{
  var a = $('#ancSpare').get(0);
  a.target = '_blank';
  a.href = '/throwclientattachment?clientattachmentid=' + clientattachmentid + '&uuid=' + uuid;
  a.click();
}

function doThrowPrintTemplate(printtemplateid)
{
  var a = $('#ancSpare').get(0);
  a.target = '_blank';
  a.href = '/throwprinttemplate?printtemplateid=' + printtemplateid + '&uuid=' + uuid;
  a.click();
}

// ************************************************************************************************************************************************************************
// Dialog functions
function doLogin()
{
  var u = $('#fldUid').val();
  var p = $('#fldPwd').val();
  primus.emit('login', {fguid: fguid, uid: u, pwd: p});
  //
  $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64gears + '" width="24" height="24"/> Authenticating...');
}

//
function doPromptOkCancel(prompttext, callback)
{
  noty
  (
    {
      text: prompttext,
      type: 'warning',
      animation:
      {
        open: 'animated flipInX',
        close: 'animated flipOutX',
        easing: 'swing',
        speed: 500
      },
      buttons:
      [
        {
          addClass: 'btn btn-primary',
          text: 'Ok',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(true);
          }
        },
        {
          addClass: 'btn btn-danger',
          text: 'Cancel',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(null);
          }
        }
      ]
    }
  );
}

function doPromptYesNoCancel(prompttext, callback)
{
  noty
  (
    {
      text: prompttext,
      type: 'warning',
      animation:
      {
        open: 'animated flipInX',
        close: 'animated flipOutX',
        easing: 'swing',
        speed: 500
      },
      buttons:
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(true);
          }
        },
        {
          addClass: 'btn btn-primary',
          text: 'No',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(false);
          }
        },
        {
          addClass: 'btn btn-danger',
          text: 'Cancel',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(null);
          }
        }
      ]
    }
  );
}

function doPrompt2OptionsCancel(prompttext, btn1text, btn2text, callback)
{
  noty
  (
    {
      text: prompttext,
      type: 'warning',
      animation:
      {
        open: 'animated flipInX',
        close: 'animated flipOutX',
        easing: 'swing',
        speed: 500
      },
      buttons:
      [
        {
          addClass: 'btn btn-primary',
          text: btn1text,
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(1);
          }
        },
        {
          addClass: 'btn btn-primary',
          text: btn2text,
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(2);
          }
        },
        {
          addClass: 'btn btn-danger',
          text: 'Cancel',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(null);
          }
        }
      ]
    }
  );
}

function doPrompt3OptionsCancel(prompttext, btn1text, btn2text, btn3text, callback)
{
  noty
  (
    {
      text: prompttext,
      type: 'warning',
      animation:
      {
        open: 'animated flipInX',
        close: 'animated flipOutX',
        easing: 'swing',
        speed: 500
      },
      buttons:
      [
        {
          addClass: 'btn btn-primary',
          text: btn1text,
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(1);
          }
        },
        {
          addClass: 'btn btn-primary',
          text: btn2text,
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(2);
          }
        },
        {
          addClass: 'btn btn-primary',
          text: btn3text,
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(3);
          }
        },
        {
          addClass: 'btn btn-danger',
          text: 'Cancel',
          onClick: function($noty)
          {
            $noty.close();
            if (!_.isUndefined(callback) && !_.isNull(callback))
              callback(null);
          }
        }
      ]
    }
  );
}

function doUpdateInitTasksProgress()
{
  var p = (++completedtasks / inittasks) * 100;
  $('#divProgress').progressbar('setValue', Math.ceil(p));

  if (p == 100)
  {
    $('#divProgress').hide();
    $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="images/ajax_connected.gif" width="23" height="24"/>');
  }
}

function doRefreshAll()
{
  inittasks = 5;
  completedtasks = 0;
  $('#divProgress').progressbar({value: 0});

  primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listinvoices', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('loadconfig', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
}

// Recurse through treegrid row data...
// If startid is null, just search for first occurrence of needle
// Else look for startid node id first, then continue (like find next)...
function doSearchCodeNameInTree(treename, txt)
{
  // Var start needs to be global scope to recursion function otherwise we may quit recusrsion too early...
  var tree = '#' + treename;
  var rows = $(tree).treegrid('getData');
  var selected = $(tree).treegrid('getSelected');
  var startid = _.isNull(selected) ? null : selected.id;
  var srctxt = txt.toUpperCase();
  var nodeid = null;

  function findInTree(haystacks, needle)
  {
    var id = null;

    for (var i = 0, l = haystacks.length; (i < l) && _.isNull(id); i++)
    {
      var hay = haystacks[i];

      if (_.isNull(startid))
      {
        var code = hay.code.toUpperCase();
        var name = hay.name.toUpperCase();

        if ((code.indexOf(needle) > -1) || (name.indexOf(needle) > -1))
          id = hay.id;
        else if (!_.isUndefined(hay.children) && (hay.children.length > 0))
          id = findInTree(hay.children, needle, null);
      }
      else
      {
        // If found id, turn off start id "flag" and continue search from this point...
        if (hay.id == startid)
          startid = null;

        if (!_.isUndefined(hay.children) && (hay.children.length > 0))
          id = findInTree(hay.children, needle);
      }
    }

    return id;
  }

  nodeid = findInTree(rows, srctxt);
  if (!_.isNull(nodeid))
  {
    $(tree).treegrid('expandTo', nodeid);
    $(tree).treegrid('select', nodeid);
  }
  else
    noty({text: 'No more occurrences found...', type: 'warning', timeout: 4000});

  return nodeid;
}

function doExpandTreeToId(treename, nodeid)
{
  var tree = '#' + treename;

  if (!_.isUndefined(nodeid) && !_.isNull(nodeid))
  {
    if (!_.isNull($(tree).treegrid('find', nodeid)))
    {
      $(tree).treegrid('expandTo', nodeid);
      $(tree).treegrid('select', nodeid);
    }
  }
}

function doFindParentNode(data, id)
{
  var n = null;

  function findInTree(haystacks, needle)
  {
    var node = null;

    for (var i = 0, l = haystacks.length; (i < l) && _.isNull(node); i++)
    {
      var hay = haystacks[i];

      if (hay.id == needle)
        node = hay;
      else if (!_.isUndefined(hay.children) && (hay.children.length > 0))
        node = findInTree(hay.children, needle);
    }

    return node;
  }

  n = findInTree(data, id);
  return n;
}

function doSearchCodeNameInGrid(gridname, txt, codecol)
{
  // Var start needs to be global scope to recursion function otherwise we may quit recusrsion too early...
  var grid = '#' + gridname;
  var haystacks = $(grid).datagrid('getRows');
  var selected = $(grid).datagrid('getSelected');
  var startid = _.isNull(selected) ? null : selected.id;
  var needle = txt.toUpperCase();
  var foundrow = null;
  var index = 0;

  if (!_.isNull(startid))
    index = $(grid).datagrid('getRowIndex', startid) + 1;

  if (!_.isUndefined(codecol) || !_.isNull(codecol))
    codecol = 'code';

  for (var i = index, l = haystacks.length; i < l; i++)
  {
    var obj = haystacks[i];
    var code = obj[codecol].toUpperCase();
    var name = obj.name.toUpperCase();

    if ((code.indexOf(needle) > -1) || (name.indexOf(needle) > -1))
    {
      foundrow = i;
      break;
    }
  }

  if (!_.isNull(foundrow))
    $(grid).datagrid('selectRow', foundrow);
  else
    noty({text: 'No more occurrences found...', type: 'warning', timeout: 4000});
}

function doSetGridEditorValue(grid, index, field, value)
{
  var ed = $('#' + grid).datagrid('getEditor', {index: index, field: field});
  if (!_.isUndefined(ed) && !_.isNull(ed))
    $(ed.target).val(value);
}

function doSetGridEditorComboValue(grid, index, field, value)
{
  var ed = $('#' + grid).datagrid('getEditor', {index: index, field: field});
  if (!_.isUndefined(ed) && !_.isNull(ed))
    $(ed.target).combobox('select', value);
}

function doGetGridGetRowDataByIndex(gridname, index, callback)
{
  var grid = '#' + gridname;
  var index = null;
  var row = null;

  $(grid).datagrid('selectRow', index);
  row = $(grid).datagrid('getSelected');

  if (!_.isNull(row))
  {
    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback(row, index);
  }
}

function doGetGridSelectedRowIndex(gridname)
{
  var grid = '#' + gridname;
  var row = $(grid).datagrid('getSelected');

  if (!_.isNull(row))
    index = $(grid).datagrid('getRowIndex', row);

  return index;
}

function doUpdateGridSelectedRow(gridname, data)
{
  var grid = '#' + gridname;
  var index = null;
  var row = $(grid).datagrid('getSelected');

  if (!_.isNull(row))
  {
    index = $(grid).datagrid('getRowIndex', row);
    $(grid).datagrid('updateRow', {index: index, row: data});
  }

  return {row: row, index: index};
}

function doGridGetSelectedRowData(gridname, callback)
{
  var grid = '#' + gridname;
  var row = $(grid).datagrid('getSelected');

  if (!_.isNull(row))
  {
    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback(row);
    return true;
  }
  return false;
}

function doGridStartEdit(gridname, index, callback)
{
  var grid = '#' + gridname;

  if (_.isNull(index))
  {
    var row = $(grid).datagrid('getSelected');

    if (!_.isNull(row))
    {
      index = $(grid).datagrid('getRowIndex', row);
      $(grid).datagrid('beginEdit', index);

      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(row, index);
    }
  }

  return index;
}

function doGridGetEditor(gridname, index, fieldname, callback)
{
  var grid = '#' + gridname;
  var ed = $(grid).datagrid('getEditor', {index: index, field: fieldname});

  if (!_.isNull(ed))
  {
    $(ed.target).focus();

    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback(ed);
  }
}

function doGridCancelEdit(gridname, index, callback)
{
  var grid = '#' + gridname;

  if (!_.isNull(index))
  {
    $(grid).datagrid('cancelEdit', index);

    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback();
  }

  return null;
}

function doGridEndEditGetRow(gridname, index, callback)
{
  if (!_.isNull(index))
  {
    var grid = '#' + gridname;

    $(grid).datagrid('endEdit', index);
    $(grid).datagrid('selectRow', index);

    var row = $(grid).datagrid('getSelected');

    if (!_.isNull(row))
    {
      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(row);
    }

    return true;
  }

  return false;
}

function doGridCalcTotals(gridname, colprice, colqty)
{
  var grid = '#' + gridname;
  var data = $(grid).datagrid('getData');
  var totalprice = _.toBigNum(0.0);
  var totalqty = _.toBigNum(0.0);
  var q = null;
  var p = null;

  if (!_.isNull(data) && !_.isNull(data.rows))
  {
    data.rows.forEach
    (
      function(d)
      {
        q = _.toBigNum(d['colqty']);
        p = _.toBigNum(d['colprice']);
        totalprice = totalprice.plus(p.times(q));
        totalqty = totalqty.plus(q);
      }
    );
  }

  return {
    price: totalprice,
    qty: totalqty,
    formattedprice: '<span class="totals_footer">' + _.formatnumber(totalprice) + '</span>',
    formattedqty: '<span class="totals_footer">' + _.formatnumber(totalqty) + '</span>'
  };
}

function doGridContextMenu(gridname, menuname, e, index, row)
{
  if (!_.isNull(row))
  {
    var grid = '#' + gridname;

    e.preventDefault();
    $(grid).datagrid('selectRow', index);
    $('#' + menuname).menu
    (
      'show',
      {
        left: e.pageX,
        top: e.pageY
      }
    );
  }
}

//

function doTreeGridGetSelectedRowData(gridname, callback)
{
  var grid = '#' + gridname;
  var row = $(grid).treegrid('getSelected');

  if (!_.isNull(row))
  {
    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback(row);
    return true;
  }
  return false;
}

function doTreeGridStartEdit(gridname, id, callback)
{
  var grid = '#' + gridname;

  if (_.isNull(id))
  {
    var row = $(grid).treegrid('getSelected');

    if (!_.isNull(row))
    {
      id = row.id;
      $(grid).treegrid('beginEdit', id);

      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(row, id);
    }
  }

  return id;
}

function doTreeGridGetSelectedRowEditor(gridname, fieldname, callback)
{
  var grid = '#' + gridname;
  var row = $(grid).treegrid('getSelected');

  if (!_.isNull(row))
  {
    var ed = $(grid).treegrid('getEditor', {id: row.id, field: fieldname});

    if (!_.isNull(ed))
    {
      $(ed.target).focus();

      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(ed);
    }
  }
}

function doTreeGridGetEditor(gridname, id, fieldname, callback)
{
  var grid = '#' + gridname;
  var ed = $(grid).treegrid('getEditor', {id: id, field: fieldname});

  if (!_.isNull(ed))
  {
    $(ed.target).focus();

    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback(ed);
  }
}

function doTreeGridEndEditGetRow(gridname, id, callback)
{
  if (!_.isNull(id))
  {
    var grid = '#' + gridname;

    $(grid).treegrid('endEdit', id);
    $(grid).treegrid('select', id);

    var row = $(grid).treegrid('getSelected');

    if (!_.isNull(row))
    {
      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(row);
    }

    return true;
  }

  return false;
}

function doTreeGridCancelEdit(gridname, id, callback)
{
  var grid = '#' + gridname;

  if (!_.isNull(id))
  {
    $(grid).treegrid('cancelEdit', id);

    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback();
  }

  return null;
}

function doTreeGridContextMenu(gridname, menuname, e, row)
{
  if (!_.isNull(row))
  {
    var grid = '#' + gridname;

    e.preventDefault();
    $(grid).treegrid('select', row.id);
    $('#' + menuname).menu
    (
      'show',
      {
        left: e.pageX,
        top: e.pageY
      }
    );
  }
}

//

function doSwitchButtonChecked(btn)
{
  var options = $('#' + btn).switchbutton('options');

  return options.checked;
}

//

function doRemoveTBButton(tb, buttonname)
{
  for (var i = 0, l = tb.length; i < l; i++)
  {
    if (tb[i].text == buttonname)
    {
      tb.splice(i, 1);
      break;
    }
  }
}

// Find "right" base widget to set focus to... (usually the textbox component)...

function doTextboxFocus(tbname)
{
  var tb = '#' + tbname;
  $(tb).textbox('textbox').focus();
}

function doMandatoryTextbox(prompt, tbname)
{
  noty({text: prompt, type: 'error', timeout: 4000});
  doTextboxFocus(tbname);
}
