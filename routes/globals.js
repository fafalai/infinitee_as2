var server = self.location.protocol + '://' + self.location.hostname + ':' + self.location.port;
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
var ispos = false;
var cmdcentre= null;
var myperms =
{
  canvieworders: 0,
  cancreateorders: 0,
  canviewinvoices: 0,
  cancreateinvoices: 0,
  canviewinventory: 0,
  cancreateinventory: 0,
  canviewpayroll: 0,
  cancreatepayroll: 0,
  canviewproducts: 0,
  cancreateproducts: 0,
  canviewclients: 0,
  cancreateclients: 0,
  canviewcodes: 0,
  cancreatecodes: 0,
  // canviewclients: 0,
  // cancreateclients: 0,
  canviewusers: 0,
  cancreateusers: 0,

  canviewbuilds: 0,
  cancreatebuilds: 0,
  canviewtemplates: 0,
  cancreatetemplates: 0,
  canviewbanking: 0,
  cancreatebanking: 0,
  canviewpurchasing: 0,
  cancreatepurchasing: 0,
  canviewalerts: 0,
  cancreatealerts: 0,
  canviewdashboard: 0,
  cancreatedashboard: 0
};
var tabs = null;
var graph = null;
var channels = [];
var inittasks = 0;
var completedtasks = 0;
var importtype = '';
//
var tpccgpslat = '-37.749451';
var tpccgpslon = '145.030579';
var tpccorgid = 5183;
//
var maxZoom = 14;
// CSS styles for embedded strings...
var css_gridcol_batchno_expired = 'color: red; font-weight: bold;';
var css_gridcol_batchno = 'color: blue;';
var css_gridcol_qty_neg = 'color: red;';
var css_gridcol_client_price = 'color: blue; font-weight: bold;';
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
  {name: 'Income', id: 5},
  {name: 'Cost of Goods Sold', id: 6},
  {name: 'Other Income', id: 7},
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
var taxtabletypes =
[
  {name: 'Tax Free Threshold', id: 1},
  {name: 'No Tax Free Threshold', id: 2}
];
var inventorytypes =
[
  {name: 'Transfer', id: 1},
  {name: 'Adjustment', id: 2},
  {name: 'Order', id: 3},
  {name: 'Stock', id: 4},
  {name: 'Build', id: 5},
  {name: 'P.O.', id: 6}
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
  {name: 'Other', id: 99}
];
var itype_paymenttype_cc = 1;
var itype_paymenttype_cheque = 2;
var itype_paymenttype_eft = 3;
var itype_paymenttype_cash = 4;
var itype_paymenttype_other = 99;
var paymentreasons =
[
  {name: 'Deposit', id: 1},
  {name: 'Order', id: 2},
  {name: 'POS', id: 3},
  {name: 'Other', id: 99}
];
var journaltypes =
[
  {name: 'Sales', id: 1},
  {name: 'Purchases', id: 2},
  {name: 'Payroll', id: 3},
  {name: 'Cash Receipts', id: 4},
  {name: 'Cash Disbursements', id: 5},
  {name: 'General', id: 6},
  {name: 'Inventory Purchase', id: 7},
  {name: 'Inventory Sale', id: 8},
  {name: 'Adjustment', id: 99}
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
  {name: '', id: 0},

  {name: 'Quote', id: 1},
  {name: 'Order', id: 2},
  {name: 'Invoiced', id: 3},
  {name: 'P.O. Received', id: 4},
  {name: 'Deposit Paid', id: 5},
  {name: 'Invoice Paid', id: 6},

  {name: 'Approved', id: 100},
  {name: 'Pending', id: 101},
  {name: 'On Hold', id: 102},
  {name: 'Completed', id: 103},
  {name: 'Back Order', id: 104},
  {name: 'Order Processed', id: 105},

  {name: 'Manufacturing', id: 200},
  {name: 'Picking', id: 201},
  {name: 'Ready for Despatch', id: 202},
  {name: 'Shipped', id: 203},

  {name: 'Artwork Approved', id: 300},
  {name: 'Plates Ordered', id: 301},
  {name: 'Plates Received', id: 302},
  {name: 'Printing', id: 303},
  {name: 'Printing Completed', id: 304},
  {name: 'Cuttting', id: 305},
  {name: 'Cuttting Completed', id: 306},
  {name: 'Forming', id: 307},
  {name: 'Product Built', id: 308},

  {name: 'Comment', id: 99999}
];
var titles =
[
  {name: 'Mr'},
  {name: 'Mrs'},
  {name: 'Ms'},
  {name: 'Miss'},
  {name: 'Dr'},
  {name: 'Sir'},
  {name: ''}
];
var int_to_5 =
[
  {name: '1',  id: 1},
  {name: '2',  id: 2},
  {name: '3',  id: 3},
  {name: '4',  id: 4},
  {name: '5',  id: 5}
];
var int_to_10 =
[
  {name: '1',  id: 1},
  {name: '2',  id: 2},
  {name: '3',  id: 3},
  {name: '4',  id: 4},
  {name: '5',  id: 5},
  {name: '6',  id: 6},
  {name: '7',  id: 7},
  {name: '8',  id: 8},
  {name: '9',  id: 9},
  {name: '10', id: 10},
  {name: '11', id: 11},
  {name: '12', id: 12},
  {name: '13', id: 13},
  {name: '14', id: 14},
  {name: '15', id: 15},
  {name: '16', id: 16},
  {name: '17', id: 17},
  {name: '18', id: 18},
  {name: '19', id: 19},
  {name: '20', id: 20}
];
var pricelevels =
[
  {name: 'Level 1',  id: 1},
  {name: 'Level 2',  id: 2},
  {name: 'Level 3',  id: 3},
  {name: 'Level 4',  id: 4},
  {name: 'Level 5',  id: 5},
  {name: 'Level 6',  id: 6},
  {name: 'Level 7',  id: 7},
  {name: 'Level 8',  id: 8},
  {name: 'Level 9',  id: 9},
  {name: 'Level 10', id: 10},
  {name: 'Level 11', id: 11},
  {name: 'Level 12', id: 12}
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
var colour_olivedrab = '#6b8e23';
var colour_ghostwhite = '#f8f8ff';
// Caches so we can refresh/redraw/re-populate etc faster - maybe...
var cache_accounts = [];
var cache_employees = [];
var cache_taxcodes = [];
var cache_superfunds = [];
var cache_clients = [];
var cache_clientattachments = [];
var cache_suppliers = [];
var cache_locations = [];
var cache_productcategories = [];
var cache_porders = [];
var cache_producttemplates = [];
var cache_products = [];
var cache_users = [];
var cache_statusalerts = [];
var cache_exchangerates = [];
var cache_timesheets = [];
var cache_discountcode = [];
var cache_listpricecode = [];
// Cached lists for dialogs...
var cache_productsbycategory = [];
var cache_suppliernotes = [];
var cache_userpermissions = [];
var cache_orderproducts = [];
var cache_printtemplates = [];
var cache_buildtemplates = [];
var cache_config = {};

//Cached lists for permission templates
var cache_permissiontemplates = [];
//propertygrid
var cache_permissions = [];

// Jobsheet detail types
var itype_js_printer = 1;
var itype_js_printer_complete = 2;
var itype_js_cutter = 3;
var itype_js_cutter_complete = 4;
var itype_js_build = 5;
var itype_js_build_complete = 6;
var js_types =
[
  {name: 'Print',            id: 1},
  {name: 'Print Complete',   id: 2},
  {name: 'Cutting',          id: 3},
  {name: 'Cutting Complete', id: 4},
  {name: 'Build',            id: 5},
  {name: 'Build Complete',   id: 6}
];
//
var dateboxParserObj =
{
  onSelect: function(dt)
  {
    console.log("select");
  },
  formatter: function(dt)
  {
    console.log(dt);
    //dt = dt.toLocaleDateString();
    return _.nicedatetodisplay(dt);
  },
  parser: function(d)
  {
    console.log(d);
    if (_.isUndefined(d) || _.isBlank(d))
    {
      return new Date();
    }
    else
    {
      var dt = moment(d).format('YYYY-MM-DD HH:mm:ss');
      return moment(dt).isValid() ? moment(dt).toDate() : new Date();
    }
    //return dt.isValid() ? dt.toDate() : new Date();
  }
};

var numberboxParseObj =
{
  parser: function(e)
  {
    return _.evil(e);
  },
  formatter: function(e)
  {
    return _.niceformatnumber(e, 4, false);
  },
  filter: function(e)
  {
    if ('01234567890.*-+/()'.indexOf(e.key) != -1)
      return true;

    return false;
  }
};

// ************************************************************************************************************************************************************************
// Provectus specific
var classtypes =
[
  {name: 'Claass A', id: 1},
  {name: 'Claass B', id: 2},
  {name: 'Claass C', id: 3},
  {name: 'Claass D', id: 4}
];

function mapMimeTypeToImage(m)
{
  var baseimage = '';

  if (_.isUndefined(m) || _.isBlank(m) || _.isNull(m))
    return '';

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
  else if (_.hasstring(m, 'officedocument') || _.hasstring(m, 'msword'))
    baseimage = 'mime-doc.png';
  else
    baseimage = 'mime-attachment.png';

  return '<img width="20" height="20" src="images/mimetypes/' + baseimage + '" />';
}

function mapBatteryToImage(level, state)
{
  var img = 'blank.png';

  if (!_.isUndefined(state) && !_.isNull(state) && (state.toLowerCase() == 'charging'))
    img = 'battery0.png';
  else
  {
    if (level > 0.8)
      img = 'battery100.png';
    else if (level > 0.6)
      img = 'battery80.png';
    else if (level > 0.4)
      img = 'battery60.png';
    else if (level > 0.2)
      img = 'battery40.png';
    else
      img = 'battery20.png';
  }
  return '<img id="imgBatteryLevel" width="71" height="30" src="images/battery/' + img + '" />';
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
  return '<img width="30" height="30" src="images/avatars/' + avatar + '" />';
}

function mapUserStatusToImage(u)
{
  var baseimage = 'ball-grey.png';

  if (u == 'online')
    baseimage = 'ball-green.png';
  else if (u == 'offline')
    baseimage = 'ball-black.png';
  else if (u == 'paused')
    baseimage = 'ball-darkblue.png';
  else if (u == 'polled')
    baseimage = 'ball-lightblue.png';

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

function mapPaymentTypeToName(t)
{
  var itype_paymenttype_cc = 1;
  var itype_paymenttype_cheque = 2;
  var itype_paymenttype_eft = 3;
  var itype_paymenttype_cash = 4;
  var itype_paymenttype_other = 99;
    var name = '';

  if (t == itype_paymenttype_cc)
    name = 'Credit Card';
  else if (t == itype_paymenttype_cheque)
    name = 'Cheque';
  else if (t == itype_paymenttype_eft)
    name = 'EFT';
  else if (t == itype_paymenttype_cash)
    name = 'Cash';
  else
    name = 'Other';

    return name;
}

// ************************************************************************************************************************************************************************
// Cursor and messagebox functions...
function showBusy()
{
  $('body').css('cursor', 'progress');
  $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="images/ajax_processing.gif" width="220" height="20"/>');
}

function showIdle()
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

      var d = _.isUndefined(decimals) ? 2 : decimals;

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
    niceformatnumber: function(n, decimals, zeroasblank)
    {
      if (_.isUndefined(n) || _.isNull(n) || isNaN(n) || _.isBlank(n) || (n == 0))
        return _.isUndefined(zeroasblank) || (zeroasblank == true) ? '' : 0.0;

      var d = _.isUndefined(decimals) ? 2 : decimals;

      if (n instanceof Decimal)
        return accounting.formatNumber(n.toFixed(d), d, ',');

      return accounting.formatNumber(n, d, ',');
    }
  }
);

_.mixin
(
  {
    niceformatqty: function(n, decimals)
    {
      if (_.isUndefined(n) || _.isNull(n) || isNaN(n) || _.isBlank(n) || (n == 0))
        return '';

      var d = _.isUndefined(decimals) ? 4 : decimals;

      if (n instanceof Decimal)
        return accounting.formatNumber(n.toFixed(d), 0, ',');

      return accounting.formatNumber(n, d, ',');
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
      if (_.isUndefined(s1) || _.isUndefined(s2))
        return false;
      return s1.indexOf(s2) > -1;
    }
  }
);

_.mixin
(
  {
    nicedatetodisplay: function(d)
    {
      if (_.isUndefined(d) || _.isNull(d) || _.isBlank(d) || (d == 'Invalid date'))
        return '';

      return new moment(d).format('YYYY-MM-DD');
    }
  }
);

_.mixin
(
  {
    nicejsdatetodisplay: function(d)
    {
      if (_.isUndefined(d) || _.isNull(d) || _.isBlank(d) || (d == 'Invalid date'))
        return '';

      // Javascript Date uses american format....
      return new moment(d, 'MM/DD/YYYY').format('YYYY-MM-DD');
    }
  }
);

_.mixin
(
  {
    friendlydisplaydate: function(d)
    {
      if (_.isUndefined(d) || _.isNull(d) || _.isBlank(d) || (d == 'Invalid date'))
        return '';

      return new moment(d).format('dddd, MMMM Do YYYY');
    }
  }
);

_.mixin
(
  {
    posdisplaydate: function(d)
    {
      if (_.isUndefined(d) || _.isNull(d) || _.isBlank(d) || (d == 'Invalid date'))
        return '';

      return new moment(d).format('ddd, MMM Do h:mm a');
    }
  }
);

_.mixin
(
  {
    validateemail: function(email)
    {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
  }
);

_.mixin
(
  {
    forcehtmlspacerpad: function(str, len)
    {
      if (str.length < len)
        str += ' ' + _.repeat('&nbsp;', len - str.length);

      return str;
    }
  }
);

_.mixin
(
  {
    forcehtmlspacelpad: function(str, len)
    {
      if (str.length < len)
        str = _.repeat('&nbsp;', len - str.length) + ' ' + str;

      return str;
    }
  }
);

_.mixin
(
  {
    evil: function(fn)
    {
      // _.evil('5*4');
      return new Function('return ' + fn)();
    }
  }
);

_.mixin
(
  {
    isUNB: function(d)
    {
      return _.isUndefined(d) || _.isNull(d) || _.isBlank(d);
    }
  }
);

_.mixin
(
  {
    isUN: function(d)
    {
      return _.isUndefined(d) || _.isNull(d);
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

function doNiceDateNoTime(dt)
{
  return _.isUndefined(dt) || _.isNull(dt) ? '' : moment(dt).format('YYYY-MM-DD');
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

function doNiceUppercaseString(s)
{
  return _.isUndefined(s) || _.isNull(s) || (s.length == 0) ? '' : s.toUpperCase();
}

function doNiceComments(s)
{
  return _.isUndefined(s) || _.isNull(s) || (s.length == 0) ? '' : _.escape(s);
}

// ************************************************************************************************************************************************************************
// TAB functions
function doSelectSalesTab(which, selectid)
{
  $('#as1tabs').tabs('select', 'Sales');
  $('#salestabs').tabs('select', which);

  $('#divEvents').trigger('selectorderid', {id: selectid});
}

function doSelectJobSheetsTab()
{
  $('#as1tabs').tabs('select', 'Job Sheets');
}

function doSelectPurchasingTab(which)
{
  $('#as1tabs').tabs('select', 'Purchasing');
  $('#purchasingtabs').tabs('select', which);
}

function doSelectInventoryTab(which)
{
  $('#as1tabs').tabs('select', 'Inventory');
  $('#inventorytabs').tabs('select', which);
}

function doSelectBankingTab(which)
{
  $('#as1tabs').tabs('select', 'Banking');
  $('#bankingtabs').tabs('select', which);
}

function doSelectPayrollTab(which)
{
  $('#as1tabs').tabs('select', 'Payroll');
  $('#payrolltabs').tabs('select', which);
}

function doSelectAccountsTab(which)
{
  $('#as1tabs').tabs('select', 'Accounts');
  $('#accounttabs').tabs('select', which);
}

function doSelectDashTab(which)
{
  $('#as1tabs').tabs('select', 'Dashboard');
  $('#dashtabs').tabs('select', which);
}

// ************************************************************************************************************************************************************************
// Data helpers
function doArrayToObject(a)
{
  var o = {};

  for (var i = 0; i < a.length; i++)
    o[i] = a[i];
  return o;
}

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

function doGetUserNameFromUUID(uuid)
{
  var result = $.grep(cache_users, function(ev) {return ev.uuid == uuid;});

  return _.isNull(result) || (result.length == 0) ? '' : result[0].name;
}

function doGetObjFromIdInObjArray(objarr, id)
{
  var result = $.grep(objarr, function(ev) {return ev.id == id;});

  return _.isNull(result) || (result.length == 0) ? {} : result[0];
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
  var u = $('#fldUid').textbox('getValue');
  var p = $('#fldPwd').passwordbox('getValue');

  primus.emit('login', {fguid: fguid, uid: u, pwd: p});
  //
  $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64gears + '" width="24" height="24"/> Authenticating... ');
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
  if (inittasks > 0)
  {
    var p = (++completedtasks / inittasks) * 100;
    $('#divProgress').progressbar('setValue', Math.ceil(p));

    if (p >= 100)
    {
      $('#divProgress').hide();
      $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="images/ajax_connected.gif" width="23" height="24"/>');
    }
  }
}

function doRefreshAll()
{
  inittasks = 15;
  completedtasks = 0;
  $('#divProgress').progressbar({value: 0});

  primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listpayrollemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  // primus.emit('listporders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('liststatusalerts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listprinttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('loadconfig', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  primus.emit('listpermissiontemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
  
  // Don't include these as tasks for progressbar...
  primus.emit('latestrates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
}

// Recurse through hierarchy array (output of treegrid/combotree) count total #nodes...
function doGetCountTreeArray(rows)
{
  var count = 0;

  function countInTree(haystacks)
  {
    var c = haystacks.length;

    for (var i = 0, l = haystacks.length; (i < l); i++)
    {
      var hay = haystacks[i];

      if (!_.isUndefined(hay.children) && (hay.children.length > 0))
        c += countInTree(hay.children);
    }

    return c;
  }

  count = countInTree(rows);

  return count;
}

// Recurse through hierarchy array (output of treegrid/combotree) looking for ID...
function doGetNameFromTreeArray(rows, srcid)
{
  function findInTree(haystacks, needle)
  {
    var node = null;

    for (var i = 0, l = haystacks.length; (i < l) && _.isNull(node); i++)
    {
      var hay = haystacks[i];

      if (hay.id == needle)
        node = hay;
      else if (!_.isUndefined(hay.children) && (hay.children.length > 0))
        node = findInTree(hay.children, needle, null);
    }

    return node;
  }

  node = findInTree(rows, srcid);
  if (!_.isNull(node))
    return node.name;

  return '';
}

function doGetTextFromTreeArray(rows, srcid)
{
  function findInTree(haystacks, needle)
  {
    var node = null;

    for (var i = 0, l = haystacks.length; (i < l) && _.isNull(node); i++)
    {
      var hay = haystacks[i];

      if (hay.id == needle)
        node = hay;
      else if (!_.isUndefined(hay.children) && (hay.children.length > 0))
        node = findInTree(hay.children, needle, null);
    }

    return node;
  }

  node = findInTree(rows, srcid);
  if (!_.isNull(node))
    return node.text;

  return '';
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

function doExpandTreeToId(treename, nodeid, alsoExpandNode)
{
  let tree = '#' + treename;
  if (!_.isUndefined(nodeid) && !_.isNull(nodeid))
  {
    // var tree = '#' + treename;

    if (!_.isNull($(tree).treegrid('find', nodeid)))
    {
      $(tree).treegrid('expandTo', nodeid);
      $(tree).treegrid('select', nodeid);

      if (!_.isUndefined(alsoExpandNode) && (alsoExpandNode === true))
        $(tree).treegrid('expand', nodeid);
    }
  }
  else
    $(tree).treegrid('unselectAll');
}

function doTreeReloadAndExpandToId(treename, nodeid)
{
  var tree = '#' + treename;

  $(tree).treegrid('reload');

  if (!_.isUndefined(nodeid) && !_.isNull(nodeid))
  {
    if (!_.isNull($(tree).treegrid('find', nodeid)))
    {
      $(tree).treegrid('expandTo', nodeid);
      $(tree).treegrid('select', nodeid);
    }
  }
  else
    $(tree).treegrid('unselectAll');
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

function doSearchCodeNameInGrid(gridname, txt, codecol, idcol)
{
  var grid = '#' + gridname;
  var haystacks = $(grid).datagrid('getRows');
  var selected = $(grid).datagrid('getSelected');
  var startid = _.isNull(selected) ? null : _.isNull(idcol) || _.isUndefined(idcol) ? selected.id : selected[idcol];
  var needle = txt.toUpperCase();
  var foundrow = null;
  var index = 0;

  if (!_.isNull(startid))
    index = $(grid).datagrid('getRowIndex', startid) + 1;

  if (_.isUndefined(codecol) || _.isNull(codecol))
    codecol = 'code';

  for (var i = index, l = haystacks.length; i < l; i++)
  {
    var o = haystacks[i];

    if (!_.isNull(o) && !_.isUndefined(o))
    {
      var code = o[codecol];

      if (!_.isNull(code) && !_.isUndefined(code))
      {
        code = code.toUpperCase();

        if ((code.indexOf(needle) > -1) || (name.indexOf(needle) > -1))
        {
          foundrow = i;
          break;
        }
      }
    }
  }

  if (!_.isNull(foundrow))
    $(grid).datagrid('selectRow', foundrow);
  else
    doShowWarning('No more occurrences found...');
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

function doGetGridFindId(gridname, id, callback)
{
  var grid = '#' + gridname;
  var index=0;
  if($(grid).length){
    index = $(grid).datagrid('getRowIndex', id);
  }
  

  if (!_.isUndefined(callback) && !_.isNull(callback))
  {
    if (index == -1)
      callback({index: index}, null);
    else
      callback(null, index);
  }
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
    $(grid).datagrid('unselectRow', index);
  }

  return {row: row, index: index};
}

function doUpdateGridRow(gridname, id, data)
{
  var grid = '#' + gridname;
  var index = null;

  index = $(grid).datagrid('getRowIndex', id);
  $(grid).datagrid('updateRow', {index: index, row: data});
  $(grid).datagrid('unselectRow', index);

  return {row: data, index: index};
}

function doGridRemoveRow(gridname, row)
{
  var grid = '#' + gridname;
  var rowindex = $(grid).datagrid('getRowIndex', row);

  if (!_.isNull(rowindex))
    $(grid).datagrid('deleteRow', rowindex);
}

function doGridGetSelectedRowData(gridname, callback)
{
  var grid = '#' + gridname;
  var row = $(grid).datagrid('getSelected');

  if (!_.isNull(row))
  {
    if (!_.isUndefined(callback) && !_.isNull(callback))
    {
      var rowindex = $(grid).datagrid('getRowIndex', row.id);
      callback(row, rowindex);
    }
    return true;
  }
  return false;
}

function doGridStartEdit(gridname, index, callback)
{
  // console.log("doGridStartEdit");
  // console.log(gridname);
  console.log(index);
  var grid = '#' + gridname;
  console.log(grid);

  if (_.isNull(index))
  {
    var row = $(grid).datagrid('getSelected');
    console.log(row);

    if (!_.isNull(row))
    {
      index = $(grid).datagrid('getRowIndex', row);
      console.log(index);
      $(grid).datagrid('beginEdit', index);

      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(row, index);
    }
    // else
    // {
    //   doShowWarning('Please select a row first');
    // }
  }

  return index;
}

function doGridGetEditor(gridname, index, fieldname, callback)
{
  console.log("do grid get editor");
  console.log(fieldname);
  var grid = '#' + gridname;
  console.log(grid);
  console.log(index);
  console.log(fieldname);
  var ed = $(grid).datagrid('getEditor', {index: index, field: fieldname});
  var eds = $(grid).datagrid('getEditors', index);
  //console.log(eds);

  if (!_.isNull(ed))
  {
    $(ed.target).focus();

    if (!_.isUndefined(callback) && !_.isNull(callback))
      callback(eds);
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

function doComboGridGetSelectedRowData(combogridname, callback)
{
  var combo = '#' + combogridname;
  var grid = $(combo).combogrid('grid');
  var row = grid.datagrid('getSelected');

  if (!_.isNull(row))
  {
    if (!_.isUndefined(callback) && !_.isNull(callback))
    {
      var rowindex = $(grid).datagrid('getRowIndex', row.id);
      callback(row, rowindex);
    }
    return true;
  }
  return false;
}

function doGridCalcProductTotals(gridname, colproduct, colprice, colqty)
{
  var grid = '#' + gridname;
  var data = $(grid).datagrid('getData');
  var totalprice = _.toBigNum(0.0);
  var totalqty = _.toBigNum(0.0);
  var q = null;
  var p = null;
  var u = null;
  var product = null;

  if (!_.isNull(data) && !_.isNull(data.rows))
  {
    data.rows.forEach
    (
      function(d)
      {
        product = doGetObjFromIdInObjArray(cache_products, d[colproduct]);
        q = _.toBigNum(d[colqty]);
        p = _.toBigNum(d[colprice]);

        if (!_.isEmpty(product))
        {
          if (!_.isBlank(product.uomsize))
          {
            u = _.toBigNum(product.uomsize);
            totalprice = totalprice.plus(p.times(q.dividedBy(u)));
          }
          else
            totalprice = totalprice.plus(p.times(q));
        }
        else
          totalprice = totalprice.plus(p.times(q));

        totalqty = totalqty.plus(q);
      }
    );
  }

  var a = {};
  a[colprice] = '<span class="totals_footer">' + _.niceformatnumber(totalprice) + '</span>';
  a[colqty] = '<span class="totals_footer">' + _.niceformatnumber(totalqty) + '</span>';

  $(grid).datagrid('reloadFooter', [a]);

  return {
    price: totalprice,
    qty: totalqty,
    formattedprice: a[colprice],
    formattedqty: a[colqty]
  };
}

function doGridCalcTotals(gridname, colprice, colqty, coldiscount, colexpressfee)
{
  var grid = '#' + gridname;
  var data = $(grid).datagrid('getData');
  var totalprice = _.toBigNum(0.0);
  var totalqty = _.toBigNum(0.0);
  var q = null;
  var d = null;
  var f = null;
  var p = null;
  var t = null;
  var isColQty = !_.isUndefined(colqty);
  var isColDiscount = !_.isUndefined(coldiscount);
  var isColExpresFee = !_.isUndefined(colexpressfee);

  if (!_.isNull(data) && !_.isNull(data.rows))
  {
    data.rows.forEach
    (
      function(r)
      {
        if (isColQty)
        {
          q = _.toBigNum(accounting.unformat(r[colqty]));
          totalqty = totalqty.plus(q);
        }
        else
          q = 1;

        if (isColDiscount)
          d = _.toBigNum(accounting.unformat(r[coldiscount]));
        else
          d = 0;

        if (isColExpresFee)
          f = _.toBigNum(accounting.unformat(r[colexpressfee]));
        else
          f = 0;

        p = _.toBigNum(accounting.unformat(r[colprice]));
        t = p.times(q);

        totalprice = totalprice.plus(t);
        totalprice = totalprice.minus(t.times(d).div(100.0));
        totalprice = totalprice.plus(t.times(f).div(100.0));
      }
    );
  }

  var a = {};
  a[colprice] = '<span class="totals_footer">' + _.niceformatnumber(totalprice) + '</span>';

  if (isColQty)
    a[colqty] = '<span class="totals_footer">' + _.niceformatnumber(totalqty) + '</span>';

  $(grid).datagrid('reloadFooter', [a]);

  return {
    price: totalprice,
    qty: totalqty,
    formattedprice: a[colprice],
    formattedqty: isColQty ? a[colqty] : ''
  };
}

function doGridChangeCellLabelValue(gridname, index, field, value)
{
  var grid = '#' + gridname;
  var ed = $(grid).datagrid('getEditor', {index: index, field: field});

  if (!_.isNull(ed))
    $(ed.target).html(value);
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

function doGridSelectRowById(gridname, id)
{
  var grid = '#' + gridname;

  if (!_.isUndefined(id) && !_.isNull(id))
    $(grid).datagrid('selectRecord', id);
  else
    $(grid).datagrid('clearSelections');
  }

function doGridReloadAndSelectId(gridname, id)
{
  var grid = '#' + gridname;

  $(grid).datagrid('reload');

  if (!_.isUndefined(id) && !_.isNull(id))
    $(grid).datagrid('selectRecord', id);
  else
    $(grid).datagrid('clearSelections');
}

//
function doTreeGridGetRowData(gridname, id, callback)
{
  var grid = '#' + gridname;

  if (!_.isNull(id))
  {
    var row = $(grid).treegrid('find' , id);

    if (!_.isNull(row))
    {
      if (!_.isUndefined(callback) && !_.isNull(callback))
        callback(row);
    }
  }

  return id;
}

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

function doShowGridLoading(grid)
{
  $('#' + grid).datagrid('loading');
}

function doShowGridLoaded(grid)
{
  $('#' + grid).datagrid('loaded');
}

//
function doGetComboTreeSelectedId(treename)
{
  var t = $('#' + treename).combotree('tree');

  if (!_.isNull(t))
  {
    var n = t.tree('getSelected');

    if (!_.isNull(n))
      return n.id;
  }

  return null;
}

function doComboTreeSelectId(treename, id)
{
  var t = $('#' + treename).combotree('tree');

  if (!_.isNull(t))
  {
    var node = $(t).tree('find', id);

    if (!_.isNull((node)))
    {
      $(t).tree('expandTo', node.target);
      $(t).tree('select', node.target);
    }

    return id;
  }

  return null;
}

//
function doSwitchButtonChecked(btn)
{
  var options = $('#' + btn).switchbutton('options');

  return options.checked;
}

function doSetSwitchButton(btn, istrue)
{
  var v = !_.isUndefined(istrue) && ((istrue === true) || (istrue == 1) || (istrue == '1'));
  var newv = v ? 'check' : 'uncheck';
  $('#' + btn).switchbutton(newv);
}

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

// ************************************************************************************************************************************************************************
// Map functions
function doAddressAutofill(place, fldaddress1, fldcity, fldpostcode, fldstate)
{
  if (!_.isUndefined(place) && !_.isUndefined(place.address_components))
  {
    var address1 = '#' + fldaddress1;
    var city = '#' + fldcity;
    var postcode = '#' + fldpostcode;
    var state = '#' + fldstate;

    if (place.address_components.length == 8)
    {
      $(address1).textbox('setValue', place.name);
      $(city).textbox('setValue', place.address_components[3].short_name);
      $(postcode).textbox('setValue', place.address_components[7].short_name);
      $(state).combobox('setValue', place.address_components[5].short_name);
    }
    else
    {
      $(address1).textbox('setValue', place.name);
      $(city).textbox('setValue', place.address_components[2].short_name);
      $(postcode).textbox('setValue', place.address_components[6].short_name);
      $(state).combobox('setValue', place.address_components[4].short_name);
    }
  }
}

function initMap()
{
  if (ispos)
  {
    var autocomplete1 = new google.maps.places.Autocomplete($('#fldNewCustAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});

    google.maps.event.addListener(autocomplete1, 'place_changed', function() {doAddressAutofill(autocomplete1.getPlace(), 'fldNewCustAddress1', 'fldNewCustCity', 'fldNewCustPostcode', 'cbNewCustState');});
  }
  else
  {
    var autocomplete1 = new google.maps.places.Autocomplete($('#fldNewClientAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    var autocomplete2 = new google.maps.places.Autocomplete($('#fldNewClientShippingAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    //
    var autocomplete3 = new google.maps.places.Autocomplete($('#fldNewSupplierAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    var autocomplete4 = new google.maps.places.Autocomplete($('#fldNewSupplierShippingAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    //
    var autocomplete5 = new google.maps.places.Autocomplete($('#fldNewLocationAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    //
    var autocomplete6 = new google.maps.places.Autocomplete($('#fldNewEmployeeAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    //
    var autocomplete7 = new google.maps.places.Autocomplete($('#fldNewOrderAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});
    var autocomplete8 = new google.maps.places.Autocomplete($('#fldNewOrderShiptoAddress1').textbox('textbox')[0], {types: ['geocode'], componentRestrictions: {country: defaultRegionCode}});

    google.maps.event.addListener
    (
      autocomplete1,
      'place_changed',
      function()
      {
        // var lat = place.geometry.location.lat();
        // var lng = place.geometry.location.lng();

        doAddressAutofill(autocomplete1.getPlace(), 'fldNewClientAddress1', 'fldNewClientCity', 'fldNewClientPostcode', 'cbNewClientState');
      }
    );

    google.maps.event.addListener(autocomplete2, 'place_changed', function() {doAddressAutofill(autocomplete2.getPlace(), 'fldNewClientShippingAddress1', 'fldNewClientShippingCity', 'fldNewClientShippingPostcode', 'cbNewClientShippingState');});
    google.maps.event.addListener(autocomplete3, 'place_changed', function() {doAddressAutofill(autocomplete3.getPlace(), 'fldNewSupplierAddress1', 'fldNewSupplierCity', 'fldNewSupplierPostcode', 'cbNewSupplierState');});
    google.maps.event.addListener(autocomplete4, 'place_changed', function() {doAddressAutofill(autocomplete4.getPlace(), 'fldNewSupplierShippingAddress1', 'fldNewSupplierShippingCity', 'fldNewSupplierShippingPostcode', 'cbNewSupplierShippingState');});
    google.maps.event.addListener(autocomplete5, 'place_changed', function() {doAddressAutofill(autocomplete5.getPlace(), 'fldNewLocationAddress1', 'fldNewLocationCity', 'fldNewLocationPostcode', 'cbNewLocationState');});
    google.maps.event.addListener(autocomplete6, 'place_changed', function() {doAddressAutofill(autocomplete6.getPlace(), 'fldNewEmployeeAddress1', 'fldNewEmployeeCity', 'fldNewEmployeePostcode', 'cbNewEmployeeState');});
    google.maps.event.addListener(autocomplete7, 'place_changed', function() {doAddressAutofill(autocomplete7.getPlace(), 'fldNewOrderAddress1', 'fldNewOrderCity', 'fldNewOrderPostcode', 'cbNewOrderState');});
    google.maps.event.addListener(autocomplete8, 'place_changed', function() {doAddressAutofill(autocomplete8.getPlace(), 'fldNewOrderShiptoAddress1', 'fldNewOrderShiptoCity', 'fldNewOrderShiptoPostcode', 'cbNewOrderShiptoState');});
  }
}

function doShowMap(gpslat, gpslon, title, html)
{
  var map = null;
  $('#divMapPanel').window
  (
    {
      title: title,
      href: 'template_showmap2.html',
      onLoad: function()
      {
        map = L.map('xx_map').setView([gpslat, gpslon], 16);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
        L.marker([gpslat, gpslon]).addTo(map).bindPopup(html).openPopup();
      },
      onClose: function()
      {
        map.remove();
        map = null;
      }
    }
  ).window('open');
}

// ************************************************************************************************************************************************************************
// Menu functions...
function doContextMenu(menuname, data)
{
  $('#divEvents').trigger(menuname, data);
}

function doFeedback()
{
  doDlgFeedback();
}

// ************************************************************************************************************************************************************************
// Notification functions...
function doShowError(msg)
{
  noty({text: msg, type: 'error', timeout: 4000});
}

function doShowWarning(msg)
{
  noty({text: msg, type: 'warning', timeout: 4000});
}

function doShowSuccess(msg)
{
  noty({text: msg, type: 'success', timeout: 4000});
}

function doShowInfo(msg)
{
  noty({text: msg, type: 'information', animation: {open: 'animated fadeIn', close: 'animated fadeOut', easing: 'swing', speed: 500}, layout: 'topRight', timeout: 3000});
}

function doShowChat(msg)
{
  noty({text: msg, type: 'information', animation: {open: 'animated fadeIn', close: 'animated hinge', easing: 'swing', speed: 500}, layout: 'topRight'});
}

function doShowResults(msg)
{
  noty({text: msg, type: 'information', animation: {open: 'animated fadeIn', close: 'animated fadeOut', easing: 'swing', speed: 500}, layout: 'topRight'});
}

// ************************************************************************************************************************************************************************
// Primus functions...
function doServerDataMessage(msg, data, pdata)
{
  primus.emit(msg, $.extend(data, {fguid: fguid, uuid: uuid, session: session, pdata: $.extend(pdata, {})}));
}

function doServerMessage(msg, pdata)
{
  primus.emit(msg, {fguid: fguid, uuid: uuid, session: session, pdata: $.extend(pdata, {})});
}


//Trials
/**
 * https://gist.github.com/lmfresneda/9158e06a93a819a78b30cc175573a8d3
 * Remove duplicates from an array of objects in javascript
 * @param arr - Array of objects
 * @param prop - Property of each object to compare
 * @returns {Array}
 */
function removeDuplicates( arr, prop ) {
  //console.log("I am in");
  //console.log(prop);
  var obj = {}; //key-object pair, use the id as the key, pair with the array[i], next time, same id appear, but already has one, so pass to next id. 
  for ( var i = 0, len = arr.length; i < len; i++ )
  {
    //console.log(obj[arr[i][prop]]);
    if(!obj[arr[i][prop]]) 
    {
      obj[arr[i][prop]] = arr[i];
      //console.log(obj[arr[i][prop]]);
    }
    else
    {
      //console.log(obj[arr[i][prop]]);
    }
  }
  var newArr = [];
  //console.log(obj);
  for ( var key in obj ) 
  {
    newArr.push(obj[key]);
  }
  //console.log(newArr);
  return newArr;
}
