// TODO: Instead of calling refreshFromCacheXXXXX() methods directly from here - use fireEvent on divEvents... so makes methods independent and also allows  multiple dependencies to auto consume the event....
//       See dlg-build-template-details.js for example consumption/usage...
function addChannels(c)
{
  if (_.isArray(c))
  {
    c.forEach
    (
      function(chan)
      {
        if (channels.indexOf(chan) == -1)
          channels.push(chan);
      }
    );
  }
  else
  {
    if (channels.indexOf(c) == -1)
      channels.push(c);
  }
}

function doJoinChannels()
{
  if (!_.isUndefined(channels) && !_.isNull(channels))
  {
    channels.forEach
    (
      function(channel)
      {
        primus.emit
        (
          'join',
          {
            fguid: fguid,
            uuid: uuid,
            session: session,
            channel: channel,
            pdata: 'join'
          }
        );
      }
    );
  }
}

function doPrimus()
{
  try
  {
    console.log('***** Init Primus...');
    primus = new Primus
    (
      server,
      {
        reconnect: {maxDelay: 15 * 1000, minDelay: 1000, retries: 1000},
        strategy: ['disconnect', 'timeout']
      }
    );

    // Add error listener as soon as possible after open - so we can catch connection errors...
    primus.on
    (
      'error',
      function(err)
      {
        // Note we get a connection error first if we get "disconnected", then an "offline"" event, finally a "close" event...
        // We mark disconnection here as we will get this event faster than an "offline" or "close" event - especially after a pause/resumed cycle where we need to detect and force a reconnect quickly...
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64disconnected + '" width="24" height="24"/> Oops, server may be lost...');
        connected = false;
      }
    );

    // Connection events from primus itself...
    primus.on
    (
      'open',
      function()
      {
        $('#divDashConnectionStatus').html(document.createTextNode('Connected to server...'));
        connected = true;
        if (firstconnection)
        {
          if (annyang)
          {
            if (!ispos)
              noty({text: 'Your browser supports speech recognition - Click Allow Microphone Access..."', type: 'success', timeout: 5000});
          }
          firstconnection = false;
        }
        // We also get here after a temporary disconnection -  so we need to rejoin channels as server would have dumped us...
        doJoinChannels();
      }
    );

    primus.on
    (
      'close',
      function()
      {
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64disconnected + '" width="24" height="24"/> OK, server has gone away, don\'t worry, will look for it shortly...');
        console.log('***** Server has gone away...');
      }
    );

    primus.on
    (
      'end',
      function()
      {
        console.log('***** Connection ended...');
      }
    );

    primus.on
    (
      'reconnecting',
      function(opts)
      {
        var s = opts.timeout / 1000;

        s = s.toFixed(0);
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64searching + '" width="24" height="24"/> Sending search party for server in ' + s + 's, retry ' + opts.attempt + ' of ' + opts.retries);
        console.log('***** Reconecting in ' + s + 's');
      }
    );

    primus.on
    (
      'reconnect',
      function()
      {
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64gears + '" width="24" height="24"/> Looking for server now...');
        console.log('***** Looking for server...');
      }
    );

    // Auth events
    primus.on
    (
      'welcome',
      function(data)
      {
        fguid = data.fguid;
        //
        console.log('***** Server welcome...');
        //
        addChannels(data.channel);
        showIdle();
        $('#divEvents').trigger('poswelcome', {pdata: 'none'});
      }
    );

    primus.on
    (
      'join',
      function(data)
      {
      }
    );

    primus.on
    (
      'login',
      function(data)
      {
        console.log('***** Login successful...');

        uid = data.uid;
        uname = data.uname;
        uuid = data.uuid;
        isadmin = data.isadmin;
        isclient = data.isclient;
        clientid = data.clientid;
        avatar = data.avatar;
        myperms = data.permissions;
        session = data.session;

        if (isclient)
        {
          noty({text: 'Access denied... please use client login', type: 'error'});
          return;
        }
        /*
        noty
        (
          {
            text: 'Login successful...',
            type: 'success',
            force: true,
            killer: true,
            timeout: 4000,
            callback:
            {
              onShow: function()
              {
                addChannels(data.channels);
                doJoinChannels();
                //
                $('#spnMenu').html('Logged in as <strong>' + _.titleize(uname) + '</strong>');
                $('#spnServer').text(server);
                $('#divEvents').trigger('refresh-all', {pdata: 'none'});
                $('#dlgLogin').dialog('close');
              }
            }
          }
        );
        */

        addChannels(data.channels);
        doJoinChannels();

        // Display login details
        var imgAvatar = mapAvatarToImage(avatar);

        if (_.isBlank(imgAvatar))
          $('#spnMenu').html('Logged in as <strong>' + _.titleize(uname) + '</strong>');
        else
        {
          $('#spnMenu').html
          (
            '<table><tr>' +
              '<td valign="middle">' + imgAvatar + '</td>' +
              '<td valign="middle">Logged in as <strong>' + _.titleize(uname) + '</strong></td>' +
            '</tr></table>'
          );
        }

        // Indicate which server we're connected to and close login dialog...
        $('#spnServer').text(server);
        $('#dlgLogin').dialog('close');

        if (!ispos)
        {
          // Trigger refresh/load of all data...
          $('#divEvents').trigger('refresh-all', {pdata: 'none'});

          console.log('***** Determining permissions...');

          if (posonly)
          {
            $('#as1tabs').tabs('close', 'Command TAB');
            $('#as1tabs').tabs('close', 'Dashboard');
            $('#as1tabs').tabs('close', 'Purchasing');
            $('#as1tabs').tabs('close', 'Job Sheets');
            $('#as1tabs').tabs('close', 'Payroll');
            $('#as1tabs').tabs('close', 'Accounts');

            $('#dashtabs').tabs('close', 'Alerts');
            $('#dashtabs').tabs('close', 'Chat Support');
            $('#dashtabs').tabs('close', 'Order Cards');

            $('#salestabs').tabs('close', 'Invoices');

            $('#inventorytabs').tabs('close', 'Build Templates');
            $('#inventorytabs').tabs('close', 'Builds');

            $('#maintenancetabs').tabs('close', 'Status Alerts');
            $('#maintenancetabs').tabs('close', 'Product Templates');
            $('#maintenancetabs').tabs('close', 'Print Templates');
            $('#maintenancetabs').tabs('close', 'Emails');

            if (!isadmin)
            {
              // Inventory
              if (!myperms.canviewinventory)
                $('#as1tabs').tabs('close', 'Inventory');

              $('#as1tabs').tabs('close', 'Maintenance');
              $('#salestabs').tabs('close', 'Clients');
            }
          }
          else
          {
            // Close TABs where user permissions deny viewing
            // Can't handle creation permissions here since TAB panels are not yet loaded...
            if (!isadmin)
            {
              console.log(myperms);
              // Alerts
              if (!myperms.canviewalerts)
              {
                $('#dashtabs').tabs('close', 'Alerts');
                $('#maintenancetabs').tabs('close', 'Status Alerts');
              }

              // Codes
              if (!myperms.canviewcodes)
              {
                $('#as1tabs').tabs('close', 'Accounts');
              }

              // Orders
              if (!myperms.canvieworders)
              {
                $('#dashtabs').tabs('close', 'Order Cards');
                $('#salestabs').tabs('close', 'Orders');
              }

              // Invoices
              if (!myperms.canviewinvoices)
              {
                $('#salestabs').tabs('close', 'Invoices');
              }

              // Clients
              if (!myperms.canviewclients)
              {
                $('#salestabs').tabs('close', 'Clients');
                $('#salestabs').tabs('close', 'Suppliers');
              }

              // Purchasing
              if (!myperms.canviewpurchasing)
              {
                $('#as1tabs').tabs('close', 'Purchasing');
              }

              // Inventory
              if (!myperms.canviewinventory)
              {
                $('#inventorytabs').tabs('close', 'Locations');
                $('#inventorytabs').tabs('close', 'Stock');
              }

              // Products
              if (!myperms.canviewproducts)
              {
                $('#inventorytabs').tabs('close', 'Products');
                $('#inventorytabs').tabs('close', 'Categories');
              }

              // Builds
              if (!myperms.canviewbuilds)
              {
                $('#inventorytabs').tabs('close', 'Build Templates');
              }

              // Banking
              if (!myperms.canviewbanking)
              {
                $('#as1tabs').tabs('close', 'Banking');
              }

              // Payroll
              if (!myperms.canviewpayroll)
              {
                $('#as1tabs').tabs('close', 'Payroll');
              }

              // Users
              if (!myperms.canviewusers)
              {
                $('#maintenancetabs').tabs('close', 'Users');
              }

              // Templates
              if (!myperms.canviewtemplates)
              {
                $('#maintenancetabs').tabs('close', 'Product Templates');
                $('#maintenancetabs').tabs('close', 'Print Templates');
              }

              // Command centre permissions...
              var allowednodes = [cmdcentreConfig, noderoot];

              // Note: order of node removal important, go from deepest to top as we're simply removing array elements...
              if (!myperms.canviewclients)
                nodesales.children[0].children[0].children.splice(0, 1);

              if (!myperms.canviewinvoices)
                nodesales.children[0].children.splice(0, 1);

              if (myperms.canvieworders)
                allowednodes.push(nodesales);

              //
              if (!myperms.canviewbuilds)
                nodeinventory.children.splice(1, 1);

              if (!myperms.canviewproducts)
                nodeinventory.children[0].children.splice(0, 1);

              if (myperms.canviewinventory)
              {
                allowednodes.push(nodejobsheets);
                allowednodes.push(nodeinventory);
              }

              //
              if (myperms.canviewcodesl)
                allowednodes.push(nodeaccounts);

              if (myperms.canviewpayroll)
                allowednodes.push(nodepayroll);

              // If can't view users and templates, then may as well close all of maintenance TAB...
              if (!myperms.canviewusers && !myperms.canviewtemplates)
                $('#as1tabs').tabs('close', 'Maintenance');
              else
              {
                $('#maintenancetabs').tabs('close', 'Status Alerts');
                $('#maintenancetabs').tabs('close', 'Product Templates');
                $('#maintenancetabs').tabs('close', 'Print Templates');

                $('#maintenancetabs').tabs('close', 'Emails');
                $('#maintenancetabs').tabs('close', 'Settings');
              }

              if (!ispos)
                cmdcentre = new Treant(allowednodes);
            }
            else
            {
              // TODO: Not implemented tabs...
              //$('#as1tabs').tabs('disableTab', 'Purchasing');
              $('#bankingtabs').tabs('disableTab', 'Receipts');
              $('#bankingtabs').tabs('disableTab', 'Receipts');
              $('#payrolltabs').tabs('disableTab', 'Process');
              //$('#payrolltabs').tabs('disableTab', 'Timesheets');
              $('#payrolltabs').tabs('disableTab', 'Rosters');

              cmdcentre = new Treant([cmdcentreConfig, noderoot, nodesales, nodejobsheets, nodeinventory, nodeaccounts, nodepayroll]);
            }
          }

          doWidgetListeners();
        }
        else
          $('#divEvents').trigger('posready', {pdata: 'none'});
      }
    );

    primus.on
    (
      'changepassword',
      function(data)
      {
        $('#divEvents').trigger('changepassword', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // ************************************************************************************************************************************************************************************************
    // Application responses
    // ************************************************************************************************************************************************************************************************

    // Account requests
    primus.on
    (
      'listaccounts',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_accounts = [];

          data.rs.forEach
          (
            function(a)
            {
              var name = doNiceTitleizeString(a.name);
              var node =
              {
                id: doNiceId(a.id),
                parentid: doNiceId(a.parentid),
                parentname: doNiceTitleizeString(a.parentname),
                code: doNiceString(a.code),
                name: name,
                altcode: doNiceString(a.altcode),
                altname: doNiceTitleizeString(a.altname),
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                type: a.itype,
                date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
                by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated),
                children: []
              };

              if (_.isNull(a.parentid))
                cache_accounts.push(node);
              else
              {
                var parent = doFindParentNode(cache_accounts, a.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listaccounts', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loadaccount',
      function(data)
      {
        $('#divEvents').trigger('loadaccount', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newaccount',
      function(data)
      {
        $('#divEvents').trigger('newaccount', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveaccount',
      function(data)
      {
        $('#divEvents').trigger('saveaccount', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeaccountparent',
      function(data)
      {
        $('#divEvents').trigger('changeaccountparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireaccount',
      function(data)
      {
        $('#divEvents').trigger('expireaccount', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkaccountcode',
      function(data)
      {
        $('#divEvents').trigger('checkaccountcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Journal requests
    primus.on
    (
      'listjournals',
      function(data)
      {
        $('#divEvents').trigger('listjournals', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newjournal',
      function(data)
      {
        $('#divEvents').trigger('newjournal', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'testjournal',
      function(data)
      {
        $('#divEvents').trigger('testjournal', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Exchange rate requests
    primus.on
    (
      'listexchangerates',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_exchangerates = [];

          data.rs.forEach
          (
            function(x)
            {
              cache_exchangerates.push
              (
                {
                  id: doNiceId(x.id),
                  provider: doNiceString(x.provider),
                  name: doNiceString(x.name),
                  currency: doNiceString(x.currency),
                  rate: _.formatnumber(x.rate, 4),
                  date: doNiceDateModifiedOrCreated(x.datemodified, x.datecreated),
                  by: doNiceModifiedBy(x.datemodified, x.usermodified, x.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listexchangerates', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'newexchangerate',
      function(data)
      {
        $('#divEvents').trigger('newexchangerate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveexchangerate',
      function(data)
      {
        $('#divEvents').trigger('saveexchangerate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireexchangerate',
      function(data)
      {
        $('#divEvents').trigger('expireexchangerate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'latestrates',
      function(data)
      {
        $('#divEvents').trigger('latestrates', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Taxcode requests
    primus.on
    (
      'listtaxcodes',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_taxcodes = [];

          data.rs.forEach
          (
            function(t)
            {
              cache_taxcodes.push
              (
                {
                  id: doNiceId(t.id),
                  code: doNiceString(t.code),
                  name: doNiceString(t.name),
                  percent: _.formatnumber(t.percent, 4),
                  date: doNiceDateModifiedOrCreated(t.datemodified, t.datecreated),
                  by: doNiceModifiedBy(t.datemodified, t.usermodified, t.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listtaxcodes', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loadtaxcode',
      function(data)
      {
        $('#divEvents').trigger('loadtaxcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newtaxcode',
      function(data)
      {
        $('#divEvents').trigger('newtaxcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savetaxcode',
      function(data)
      {
        $('#divEvents').trigger('savetaxcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expiretaxcode',
      function(data)
      {
        $('#divEvents').trigger('expiretaxcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checktaxcode',
      function(data)
      {
        $('#divEvents').trigger('checktaxcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Location requests
    primus.on
    (
      'listlocations',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_locations = [];

          data.rs.forEach
          (
            function(l)
            {
              var name = doNiceString(l.name);
              var node =
              {
                id: doNiceId(l.id),
                parentid: doNiceId(l.parentid),
                parentname: doNiceId(l.parentname),
                code: doNiceString(l.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                address1: doNiceString(l.address1),
                address2: doNiceString(l.address2),
                city: doNiceString(l.city),
                statename: doNiceString(l.state),
                postcode: doNiceString(l.postcode),
                country: _.isBlank(l.country) ? defaultCountry : doNiceString(l.country),
                gpslat: _.formatnumber(l.gpslat, 4),
                gpslon: _.formatnumber(l.gpslon, 4),
                attrib1: doNiceString(l.attrib1),
                attrib2: doNiceString(l.attrib2),
                attrib3: doNiceString(l.attrib3),
                attrib4: doNiceString(l.attrib4),
                attrib5: doNiceString(l.attrib5),
                bay: doNiceString(l.bay),
                level: doNiceString(l.level),
                shelf: doNiceString(l.shelf),
                date: doNiceDateModifiedOrCreated(l.datemodified, l.datecreated),
                by: doNiceModifiedBy(l.datemodified, l.usermodified, l.usercreated),
                children: []
              };

              if (_.isNull(l.parentid))
                cache_locations.push(node);
              else
              {
                var parent = doFindParentNode(cache_locations, l.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listlocations', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loadlocation',
      function(data)
      {
        $('#divEvents').trigger('loadlocation', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newlocation',
      function(data)
      {
        $('#divEvents').trigger('newlocation', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savelocation',
      function(data)
      {
        $('#divEvents').trigger('savelocation', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changelocationparent',
      function(data)
      {
        $('#divEvents').trigger('changelocationparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expirelocation',
      function(data)
      {
        $('#divEvents').trigger('expirelocation', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checklocationcode',
      function(data)
      {
        $('#divEvents').trigger('checklocationcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Client requests
    primus.on
    (
      'loadclient',
      function(data)
      {
        $('#divEvents').trigger('loadclient', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listclients',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_clients = [];

          data.rs.forEach
          (
            function(c)
            {
              var name = doNiceString(c.name);
              var node =
              {
                id: doNiceId(c.id),
                parentid: doNiceId(c.parentid),
                parentname: doNiceString(c.parentname),
                code: doNiceString(c.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                isactive: c.isactive,
                issupplier: c.issupplier,
                // pricelevel:c.pricelevel,
                date: doNiceDateModifiedOrCreated(c.datemodified, c.datecreated),
                by: doNiceModifiedBy(c.datemodified, c.usermodified, c.usercreated),
                children: []
              };

              if (_.isNull(c.parentid))
                cache_clients.push(node);
              else
              {
                var parent = doFindParentNode(cache_clients, c.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listclients', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'newclient',
      function(data)
      {
        $('#divEvents').trigger('newclient', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveclient',
      function(data)
      {
        $('#divEvents').trigger('saveclient', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeclientparent',
      function(data)
      {
        $('#divEvents').trigger('changeclientparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireclient',
      function(data)
      {
        $('#divEvents').trigger('expireclient', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkclientcode',
      function(data)
      {
        $('#divEvents').trigger('checkclientcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listemails',
      function(data)
      {
        $('#divEvents').trigger('listemails', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Client note requests
    primus.on
    (
      'listclientnotes',
      function(data)
      {
        $('#divEvents').trigger('listclientnotes', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newclientnote',
      function(data)
      {
        $('#divEvents').trigger('newclientnote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on('listnewclientnote', (data) =>
    {
      $('#divEvents').trigger('listnewclientnote', {data: data, pdata: $.extend(data.pdata, {})});
    });

    primus.on
    (
      'saveclientnote',
      function(data)
      {
        $('#divEvents').trigger('saveclientnote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'searchclientnote',
      function(data)
      {
        $('#divEvents').trigger('searchclientnote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Client attachment requests
    primus.on
    (
      'listclientattachments',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs)) {
          cache_clientattachments = [];
          data.rs.forEach(
            function (p) {
              var node = {
                id: doNiceId(p.id),
                name: doNiceString(p.name),
                description: doNiceString(p.description),
                mimetype: doNiceString(p.mimetype),
                size: doNiceString(p.size),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                parentid: doNiceId(p.parentid),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };
              if (node.mimetype == 'Folder' && node.parentid != null)
                node.state = 'closed';

              if (_.isNull(p.parentid))
                cache_clientattachments.push(node);
              else {
                var parent = doFindParentNode(cache_clientattachments, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );
          // cache_clientattachments.forEach(e => {
          //   if(e.mimetype == 'Folder')
          //     e.state = 'closed';
          // });
        }
        
        $('#divEvents').trigger('listclientattachments', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveclientattachment',
      function(data)
      {
        $('#divEvents').trigger('clientattachmentsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeclientattachmentparent',
      function(data)
      {
        $('#divEvents').trigger('clientattachmentsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );


    primus.on
    (
      'expireclientattachment',
      function(data)
      {
        $('#divEvents').trigger('expireclientattachment', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newfolderclientattachment',
      function(data)
      {
        $('#divEvents').trigger('newfolderclientattachment', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Supplier requests
    primus.on
    (
      'loadsupplier',
      function(data)
      {
        $('#divEvents').trigger('loadsupplier', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listsuppliers',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_suppliers = [];

          data.rs.forEach
          (
            function(c)
            {
              var name = doNiceString(c.name);
              var node =
              {
                id: doNiceId(c.id),
                parentid: doNiceId(c.parentid),
                parentname: doNiceString(c.parentname),
                code: doNiceString(c.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                isactive: c.isactive,
                isclient: c.isclient,
                date: doNiceDateModifiedOrCreated(c.datemodified, c.datecreated),
                by: doNiceModifiedBy(c.datemodified, c.usermodified, c.usercreated),
                children: []
              };

              if (_.isNull(c.parentid))
                cache_suppliers.push(node);
              else
              {
                var parent = doFindParentNode(cache_suppliers, c.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listsuppliers', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'newsupplier',
      function(data)
      {
        $('#divEvents').trigger('newsupplier', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savesupplier',
      function(data)
      {
        $('#divEvents').trigger('savesupplier', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changesupplierparent',
      function(data)
      {
        $('#divEvents').trigger('changesupplierparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expiresupplier',
      function(data)
      {
        $('#divEvents').trigger('expiresupplier', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checksuppliercode',
      function(data)
      {
        $('#divEvents').trigger('checksuppliercode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Supplier note requests
    primus.on
    (
      'listsuppliernotes',
      function(data)
      {
        $('#divEvents').trigger('listsuppliernotes', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newsuppliernote',
      function(data)
      {
        $('#divEvents').trigger('newsuppliernote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savesuppliernote',
      function(data)
      {
        $('#divEvents').trigger('savesuppliernote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Supplier attachment requests
    primus.on
    (
      'listsupplierattachments',
      function(data)
      {
        $('#divEvents').trigger('listsupplierattachments', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savesupplierattachment',
      function(data)
      {
        $('#divEvents').trigger('savesupplierattachment', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expiresupplierattachment',
      function(data)
      {
        $('#divEvents').trigger('expiresupplierattachment', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Employee requests
    primus.on
    (
      'listemployees',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_employees = [];

          data.rs.forEach
          (
            function(e)
            {
              var node =
              {
                id: doNiceId(e.id),
                parentid: doNiceId(e.parentid),
                code: doNiceString(e.code),
                altcode: doNiceString(e.altcode),
                lastname: doNiceTitleizeString(e.lastname),
                firstname: doNiceTitleizeString(e.firstname),
                // Text property used in combotree.... arghhh inconsistent property names...
                text: doNiceTitleizeString(e.firstname + ' ' + e.lastname),
                email1: doNiceString(e.email1),
                phone1: doNiceString(e.phone1),
                gender: (e.gender == 'F') ? 1 : 0,
                date: doNiceDateModifiedOrCreated(e.datemodified, e.datecreated),
                by: doNiceModifiedBy(e.datemodified, e.usermodified, e.usercreated),
                children: []
              };

              if (_.isNull(e.parentid))
                cache_employees.push(node);
              else
              {
                var parent = doFindParentNode(cache_employees, e.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listemployees', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loademployee',
      function(data)
      {
        $('#divEvents').trigger('loademployee', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newemployee',
      function(data)
      {
        $('#divEvents').trigger('newemployee', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveemployee',
      function(data)
      {
        $('#divEvents').trigger('saveemployee', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireemployee',
      function(data)
      {
        $('#divEvents').trigger('expireemployee', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkemployeecode',
      function(data)
      {
        $('#divEvents').trigger('checkemployeecode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeemployeeparent',
      function(data)
      {
        $('#divEvents').trigger('changeemployeeparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'nextemployeecode',
      function(data)
      {
        $('#divEvents').trigger('nextemployeecode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Payroll requests
    primus.on
    (
      'listpayrollemployees',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_employees = [];

          data.rs.forEach
          (
            function(e)
            {
              cache_employees.push
              (
                {
                  id: doNiceId(e.id),
                  parentid: doNiceId(e.parentid),
                  code: doNiceString(e.code),
                  name: doNiceString(e.name),
                  employmenttype: _.formatinteger(e.employmenttype),
                  date: doNiceDateModifiedOrCreated(e.datemodified, e.datecreated),
                  by: doNiceModifiedBy(e.datemodified, e.usermodified, e.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listpayrollemployees', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // User requests
    primus.on
    (
      'newuser',
      function(data)
      {
        $('#divEvents').trigger('newuser', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveuser',
      function(data)
      {
        $('#divEvents').trigger('saveuser', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireuser',
      function(data)
      {
        $('#divEvents').trigger('expireuser', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkuseruid',
      function(data)
      {
        $('#divEvents').trigger('checkuseruid', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changepassword',
      function(data)
      {
        $('#divEvents').trigger('changepassword', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'loaduser',
      function(data)
      {
        $('#divEvents').trigger('loaduser', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listusers',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_users = [];

          data.rs.forEach
          (
            function(u)
            {
              var imgstatus = (u.uuid == uuid) ? mapUserStatusToImage('online') : mapUserStatusToImage('unknown');

              cache_users.push
              (
                {
                  uuid: doNiceString(u.uuid),
                  name: doNiceString(u.uname),
                  username: doNiceString(u.uid),
                  email: doNiceString(u.email),
                  phone: doNiceString(u.phone),
                  isadmin: u.isadmin,
                  isclient: u.isclient,
                  avatar: doNiceString(u.avatar),
                  canvieworders: u.canvieworders,
                  cancreateorders: u.cancreateorders,
                  canviewinvoices: u.canviewinvoices,
                  cancreateinvoices: u.cancreateinvoices,
                  canviewinventory: u.canviewinventory,
                  cancreateinventory: u.cancreateinventory,
                  canviewpayroll: u.canviewpayroll,
                  cancreatepayroll: u.cancreatepayroll,
                  canviewproducts: u.canviewproducts,
                  cancreateproducts: u.cancreateproducts,
                  canviewclients: u.canviewclients,
                  cancreateclients: u.cancreateclients,
                  canviewcodes: u.canviewcodes,
                  cancreatecodes: u.cancreatecodes,
                  canviewusers: u.canviewusers,
                  cancreateusers: u.cancreateusers,
                  canviewbuilds: u.canviewbuilds,
                  cancreatebuilds: u.cancreatebuilds,
                  canviewtemplates: u.canviewtemplates,
                  cancreatetemplates: u.cancreatetemplates,
                  canviewbanking: u.canviewbanking,
                  cancreatebanking: u.cancreatebanking,
                  canviewpurchasing: u.canviewpurchasing,
                  cancreatepurchasing: u.cancreatepurchasing,
                  canviewalerts: u.canviewalerts,
                  cancreatealerts: u.cancreatealerts,
                  canviewdashboard: u.canviewdashboard,
                  cancreatedashboard: u.cancreatedashboard,
                  lastlogin: u.lastlogindate,
                  lastlogout: u.lastlogoutdate,
                  lastip: u.lastloginip,
                  clientid: u.clientid,
                  date: doNiceDateModifiedOrCreated(u.datemodified, u.datecreated),
                  by: doNiceModifiedBy(u.datemodified, u.usermodified, u.usercreated),
                  status: imgstatus
                }
              );
            }
          );

          $('#divEvents').trigger('listusers', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'listconnectedusers',
      function(data)
      {
        $('#divEvents').trigger('listconnectedusers', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveuserpermissions',
      function(data)
      {
        $('#divEvents').trigger('saveuserpermissions', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Superfund requests
    primus.on
    (
      'listsuperfunds',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_superfunds = [];

          data.rs.forEach
          (
            function(s)
            {
              cache_superfunds.push
              (
                {
                  id: doNiceId(s.id),
                  name: doNiceString(s.name),
                  date: doNiceDateModifiedOrCreated(s.datemodified, s.datecreated),
                  by: doNiceModifiedBy(s.datemodified, s.usermodified, s.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listsuperfunds', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'newsuperfund',
      function(data)
      {
        $('#divEvents').trigger('newsuperfund', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savesuperfund',
      function(data)
      {
        $('#divEvents').trigger('savesuperfund', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expiresuperfund',
      function(data)
      {
        $('#divEvents').trigger('expiresuperfund', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checksuperfundname',
      function(data)
      {
        $('#divEvents').trigger('checksuperfundname', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Invoice requests
    primus.on
    (
      'listinvoices',
      function(data)
      {
        $('#divEvents').trigger('listinvoices', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listunpaidordersbyclient',
      function(data)
      {
        $('#divEvents').trigger('listunpaidordersbyclient', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listunpaidpordersbyclient',
      function(data)
      {
        $('#divEvents').trigger('listunpaidpordersbyclient', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'payinvoices',
      function(data)
      {
        $('#divEvents').trigger('payinvoices', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'paypurchaseorders',
      function(data)
      {
        $('#divEvents').trigger('paypurchaseorders', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'printinvoices',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/di?no=' + f.invoiceno + '&fguid=' + fguid;
              //console.log(url);
              var w = window.open(url, '_blank');
              //console.log(w);

              if (w)
                w.print();

              doShowSuccess('Invoice [' + f.invoiceno + '] has been downloaded');
            }
          );

          // Get updated display of #copies printed for invoice(s)
          //primus.emit('listinvoices', {fguid: fguid, uuid: uuid, session: session, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'printorders',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/do?no=' + f.orderno + '&fguid=' + fguid;
              //console.log(url);
              //var w = window.open(url, '_blank');
              //console.log(w);

              //if (w)
                //w.print();
            }
          );
        }
      }
    );

    primus.on
    (
      'printdeliverydockets',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/do?filename=' + f;
              var w = window.open(url, '_blank');

              if (w)
                w.print();
            }
          );
        }
      }
    );

    primus.on
    (
      'printquotes',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/do?filename=' + f;
              var w = window.open(url, '_blank');

              if (w)
                w.print();
            }
          );
        }
      }
    );

    primus.on
    (
      'emailorder',
      function(data)
      {
        $('#divEvents').trigger('emailorder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'emailinvoice',
      function(data)
      {
        $('#divEvents').trigger('emailinvoice', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'searchinvoices',
      function(data)
      {
        $('#divEvents').trigger('listinvoices', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Config requests
    primus.on
    (
      'loadconfig',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && (data.rs.length == 1))
        {
          cache_config =
          {
            statusid: data.rs[0].statusid,
            inventoryadjustaccountid: data.rs[0].inventoryadjustaccountid,
            currentorderno: data.rs[0].currentorderno,
            currentporderno: data.rs[0].currentporderno,
            currentinvoiceno: data.rs[0].currentinvoiceno,
            currentjournalno: data.rs[0].currentjournalno,
            currentclientno: data.rs[0].currentclientno,
            currentsupplierno: data.rs[0].currentsupplierno,
            currentempno: data.rs[0].currentempno,
            currentjobsheetno: data.rs[0].currentjobsheetno,
            currentbarcodeno: data.rs[0].currentbarcodeno,
            orderasquote: doNiceIntToBool(data.rs[0].orderasquote),
            inventoryusefifo: doNiceIntToBool(data.rs[0].inventoryusefifo),
            defaultinventorylocationid: data.rs[0].defaultinventorylocationid,
            gstpaidaccountid: data.rs[0].gstpaidaccountid,
            gstcollectedaccountid: data.rs[0].gstcollectedaccountid,
            invoiceprinttemplateid: data.rs[0].invoiceprinttemplateid,
            orderprinttemplateid: data.rs[0].orderprinttemplateid,
            quoteprinttemplateid: data.rs[0].quoteprinttemplateid,
            deliverydocketprinttemplateid: data.rs[0].deliverydocketprinttemplateid,
            araccountid: data.rs[0].araccountid,
            apaccountid: data.rs[0].apaccountid,
            productcostofgoodsaccountid: data.rs[0].productcostofgoodsaccountid,
            productincomeaccountid: data.rs[0].productincomeaccountid,
            productassetaccountid: data.rs[0].productassetaccountid,
            productbuytaxcodeid: data.rs[0].productbuytaxcodeid,
            productselltaxcodeid: data.rs[0].productselltaxcodeid,
            fyearstart: data.rs[0].fyearstart,
            fyearend: data.rs[0].fyearend,
            companyname: data.rs[0].companyname,
            address1: data.rs[0].address1,
            address2: data.rs[0].address2,
            address3: data.rs[0].address3,
            address4: data.rs[0].address4,
            city: data.rs[0].city,
            state: data.rs[0].state,
            postcode: data.rs[0].postcode,
            country: data.rs[0].country,
            bankname: data.rs[0].bankname,
            bankbsb: data.rs[0].bankbsb,
            bankaccountno: data.rs[0].bankaccountno,
            bankaccountname: data.rs[0].bankaccountname,
            expressfee: _.sanitiseAsNumeric(data.rs[0].expressfee, 2),
            autosyncbuildtemplates: data.rs[0].autosyncbuildtemplates,
            posclientid: data.rs[0].posclientid,

            date: doNiceDateModifiedOrCreated(data.rs[0].datemodified, data.rs[0].datecreated),
            by: doNiceModifiedBy(data.rs[0].datemodified, data.rs[0].usermodified, data.rs[0].usercreated)
          };

          $('#divEvents').trigger('loadconfig', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'saveconfig',
      function(data)
      {
        $('#divEvents').trigger('saveconfig', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'loademailtemplates',
      function(data)
      {
        $('#divEvents').trigger('loademailtemplates', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveemailtemplates',
      function(data)
      {
        $('#divEvents').trigger('saveemailtemplates', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listprinttemplates',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_printtemplates = [];

          data.rs.forEach
          (
            function(t)
            {
              cache_printtemplates.push
              (
                {
                  id: doNiceId(t.id),
                  name: doNiceString(t.name),
                  description: doNiceString(t.description),
                  mimetype: '<a href="javascript:void(0);" onClick="doThrowPrintTemplate(' + t.id + ');">' + mapMimeTypeToImage(t.mimetype) + '</a>',
                  size: doNiceString(t.size),
                  date: doNiceDateModifiedOrCreated(t.datemodified, t.datecreated),
                  by: doNiceModifiedBy(t.datemodified, t.usermodified, t.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listprinttemplates', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'saveprinttemplate',
      function(data)
      {
        $('#divEvents').trigger('saveprinttemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireprinttemplate',
      function(data)
      {
        $('#divEvents').trigger('expireprinttemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product category requests
    primus.on
    (
      'listproductcategories',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_productcategories = [];

          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceTitleizeString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceId(p.parentname),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_productcategories.push(node);
              else
              {
                var parent = doFindParentNode(cache_productcategories, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listproductcategories', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loadproductcategory',
      function(data)
      {
        $('#divEvents').trigger('loadproductcategory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newproductcategory',
      function(data)
      {
        $('#divEvents').trigger('newproductcategory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveproductcategory',
      function(data)
      {
        $('#divEvents').trigger('saveproductcategory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeproductcategoryparent',
      function(data)
      {
        $('#divEvents').trigger('changeproductcategoryparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireproductcategory',
      function(data)
      {
        $('#divEvents').trigger('expireproductcategory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkproductcategorycode',
      function(data)
      {
        $('#divEvents').trigger('checkproductcategorycode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product requests
    primus.on
    (
      'listproducts',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_products = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_products.push
              (
                {
                  id: doNiceId(p.id),
                  productcategoryid: doNiceId(p.productcategoryid),
                  productcategoryname: doNiceString(p.productcategoryname),
                  name: doNiceString(p.name),
                  code: doNiceString(p.code),
                  altcode: doNiceString(p.altcode),
                  barcode: doNiceString(p.barcode),
                  costprice: _.formatnumber(p.costprice, 4),
                  costgst: _.formatnumber(p.costgst, 4),
                  sellprice: _.formatnumber(p.sellprice, 4),
                  sellgst: _.formatnumber(p.sellgst, 4),
                  buytaxcodeid: doNiceId(p.buytaxcodeid),
                  selltaxcodeid: doNiceId(p.selltaxcodeid),
                  costofgoodsaccountid: doNiceId(p.costofgoodsaccountid),
                  incomeaccountid: doNiceId(p.incomeaccountid),
                  assetaccountid: doNiceId(p.assetaccountid),
                  uom: doNiceString(p.uom).toUpperCase(),
                  uomsize: _.formatnumber(p.uomsize, 4),
                  buildtemplateid: doNiceId(p.buildtemplateid),
                  minstock: _.formatnumber(p.minstockqty, 4),
                  stockwarn: _.formatnumber(p.stockqtywarnthreshold, 4),
                  width: _.formatnumber(p.width, 4),
                  length: _.formatnumber(p.length, 4),
                  height: _.formatnumber(p.height, 4),
                  weight: _.formatnumber(p.weight, 4),
                  attrib1: doNiceString(p.attrib1),
                  attrib2: doNiceString(p.attrib2),
                  attrib3: doNiceString(p.attrib3),
                  attrib4: doNiceString(p.attrib4),
                  attrib5: doNiceString(p.attrib5),
                  isactive: p.isactive,
                  clientid: doNiceId(p.clientid),
                  discountcodeid: doNiceId(p.discountcodeid),
                  productaliasid: doNiceId(p.productaliasid),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );
          console.log("list products");
          console.log(cache_products.length);
          cache_products = removeDuplicates(cache_products,'id');
          console.log(cache_products.length);

          $('#divEvents').trigger('listproducts', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'listproductsbycategory',
      function(data)
      {
        //console.log("primus on listproductsbycategory");
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_productsbycategory = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_productsbycategory.push
              (
                {
                  id: doNiceId(p.id),
                  productcategoryid: doNiceId(p.productcategoryid),
                  name: doNiceString(p.name),
                  code: doNiceString(p.code),
                  altcode: doNiceString(p.altcode),
                  barcode: doNiceString(p.barcode),
                  costprice: _.formatnumber(p.costprice, 4),
                  costgst: _.formatnumber(p.costgst, 4),
                  sellprice: _.formatnumber(p.sellprice, 4),
                  sellgst: _.formatnumber(p.sellgst, 4),
                  buytaxcodeid: doNiceId(p.buytaxcodeid),
                  selltaxcodeid: doNiceId(p.selltaxcodeid),
                  costofgoodsaccountid: doNiceId(p.costofgoodsaccountid),
                  incomeaccountid: doNiceId(p.incomeaccountid),
                  assetaccountid: doNiceId(p.assetaccountid),
                  uom: doNiceString(p.uom).toUpperCase(),
                  uomsize: _.formatnumber(p.uomsize, 4),
                  buildtemplateid: doNiceId(p.buildtemplateid),
                  minstock: _.formatnumber(p.minstockqty, 4),
                  stockwarn: _.formatnumber(p.stockqtywarnthreshold, 4),
                  width: _.formatnumber(p.width, 4),
                  length: _.formatnumber(p.length, 4),
                  height: _.formatnumber(p.height, 4),
                  weight: _.formatnumber(p.weight, 4),
                  attrib1: doNiceString(p.attrib1),
                  attrib2: doNiceString(p.attrib2),
                  attrib3: doNiceString(p.attrib3),
                  attrib4: doNiceString(p.attrib4),
                  attrib5: doNiceString(p.attrib5),
                  inventoryqty: _.formatnumber(p.inventoryqty, 4),
                  orderqty: _.formatnumber(p.orderqty, 4),
                  isactive: p.isactive,
                  clientid: p.clientid,
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );
          console.log(cache_productsbycategory.length);
          cache_productsbycategory = removeDuplicates(cache_productsbycategory,'id');
          console.log(cache_productsbycategory.length);
          $('#divEvents').trigger('listproductsbycategory', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loadproduct',
      function(data)
      {
        $('#divEvents').trigger('loadproduct', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newproduct',
      function(data)
      {
        $('#divEvents').trigger('newproduct', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveproduct',
      function(data)
      {
        $('#divEvents').trigger('updateproduct', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeproductparent',
      function(data)
      {
        $('#divEvents').trigger('updateproduct', {data: data, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'expireproduct',
      function(data)
      {
        $('#divEvents').trigger('updateproduct', {data: data, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'duplicateproduct',
      function(data)
      {
        $('#divEvents').trigger('updateproduct', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkproductcode',
      function(data)
      {
        $('#divEvents').trigger('checkproductcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productsearch',
      function(data)
      {
        $('#divEvents').trigger('productsearch', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeproductcategory',
      function(data)
      {
        $('#divEvents').trigger('changeproductcategory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product code requests
    primus.on
    (
      'newproductcode',
      function(data)
      {
        $('#divEvents').trigger('newproductcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listproductcodes',
      function(data)
      {
        $('#divEvents').trigger('listproductcodes', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireproductcode',
      function(data)
      {
        $('#divEvents').trigger('expireproductcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product pricing requests
    primus.on
    (
      'listproductpricing',
      function(data)
      {
        $('#divEvents').trigger('listproductpricing', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newproductpricing',
      function(data)
      {
        $('#divEvents').trigger('productpricingupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveproductpricing',
      function(data)
      {
        $('#divEvents').trigger('productpricingupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireproductpricing',
      function(data)
      {
        $('#divEvents').trigger('productpricingupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'getproductprices',
      function(data)
      {
        $('#divEvents').trigger('getproductprices', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'getprice',
      function(data)
      {
        // console.log("primus.on getprice");
        $('#divEvents').trigger('getprice', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listdiscountcode',
      function(data)
      {
        //console.log(data);
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_discountcode = [];

          data.rs.forEach
          (
            function(p)
           {
               //console.log(p);
               cache_discountcode.push
               (
                   {
                   id: doNiceId(p.id),
                   full_name:p.full_name,
                   short_name:p.short_name,
                   level_1: p.level_1,
                   level_2: p.level_2,
                   level_3: p.level_3,
                   level_4: p.level_4,
                   level_5: p.level_5,
                   level_6: p.level_6,
                   level_7: p.level_7,
                   level_8: p.level_8,
                   level_9: p.level_9,
                   level_10: p.level_10,
                   level_11: p.level_11,
                   level_12: p.level_12,
                   level_13: p.level_13,
                   level_14: p.level_14,
                   level_15: p.level_15,
                   date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                   by: doNiceModifiedBy(p.datemodified,p.usermodified, p.usercreated)
                   }
               );
           }
          );

          // console.log("primus.on, listdiscountcode, cache_discountcode");
          // console.log(cache_discountcode);

          $('#divEvents').trigger('listdiscountcode', {data: data, pdata: $.extend(data.pdata, {})});
        }
        // $('#divEvents').trigger('listdiscountcode',{data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newdiscountcode',
      function(data)
      {
        $('#divEvents').trigger('discountcodeupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savediscountcode',
      function(data)
      {
        $('#divEvents').trigger('discountcodeupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expirediscountcode',
      function(data)
      {
        $('#divEvents').trigger('discountcodeupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    )

    // Build template requests
    primus.on
    (
      'searchrootbuildtemplates_bycodeandname',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_buildtemplates = [];
          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('searchrootbuildtemplates_bycodeandname', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );
    
    primus.on
    (
      // 'listbuildtemplates',
      'listbuildtemplates_search',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_buildtemplates = [];

          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          // $('#divEvents').trigger('listbuildtemplates', {data: data, pdata: $.extend(data.pdata, {})});
          $('#divEvents').trigger('listbuildtemplates_search', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'searchbuilttemplates_bycodeandname',
      function(data)
      {
        // doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_buildtemplates = [];
          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('searchbuilttemplates_bycodeandname', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'listbuildtemplates_pagination',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_buildtemplates = [];
          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listbuildtemplates_pagination', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'syncbuildtemplatefromproducttemplate',
      function(data)
      {
        $('#divEvents').trigger('syncbuildtemplatesaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );


    primus.on
    (
      'buildtemplategetchildren',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('buildtemplategetchildren', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'newbuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('newbuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savebuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('savebuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkbuildtemplatecode',
      function(data)
      {
        $('#divEvents').trigger('checkbuildtemplatecode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changebuildtemplateparent',
      function(data)
      {
        $('#divEvents').trigger('changebuildtemplateparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'duplicatebuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('duplicatebuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expirebuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('expirebuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'syncbuildtemplatestomaster',
      function(data)
      {
        $('#divEvents').trigger('syncbuildtemplatestomaster', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildtemplatesearch',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatesearch', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Build template detail requests
    primus.on
    (
      'listproductsbybuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('listproductsbybuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newbuildtemplatedetail',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatedetailupdated', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savebuildtemplatedetail',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatedetailupdated', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expirebuildtemplatedetail',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatedetailupdated', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    // Product template requests
    primus.on
    (
      'listproducttemplates',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_producttemplates = [];

          data.rs.forEach
          (
            function(p)
            {
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                name: doNiceString(p.name),
                code: doNiceString(p.code),
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isNull(p.parentid))
                cache_producttemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_producttemplates, p.parentid);
                // Find parent...
                if (!_.isNull(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listproducttemplates', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'newproducttemplate',
      function(data)
      {
        $('#divEvents').trigger('newproducttemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveproducttemplate',
      function(data)
      {
        $('#divEvents').trigger('saveproducttemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'changeproducttemplateparent',
      function(data)
      {
        $('#divEvents').trigger('changeproducttemplateparent', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireproducttemplate',
      function(data)
      {
        $('#divEvents').trigger('expireproducttemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'duplicateproducttemplate',
      function(data)
      {
        $('#divEvents').trigger('duplicateproducttemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildproducttemplate',
      function(data)
      {
      }
    );

    // Product template detail requests
    primus.on
    (
      'listproductsbytemplate',
      function(data)
      {
        $('#divEvents').trigger('listproductsbytemplate', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listproductsforbuild',
      function(data)
      {
        $('#divEvents').trigger('listproductsforbuild', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newproducttemplatedetail',
      function(data)
      {
        $('#divEvents').trigger('newproducttemplatedetail', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveproducttemplatedetail',
      function(data)
      {
        $('#divEvents').trigger('saveproducttemplatedetail', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireproducttemplatedetail',
      function(data)
      {
        $('#divEvents').trigger('expireproducttemplatedetail', {data: data, pdata:  $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'syncproducttemplate',
      function(data)
      {
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Inventory requests
    primus.on
    (
      'liststock',
      function(data)
      {
        $('#divEvents').trigger('liststock', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'inventoryjournal',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_invstock = [];

          data.rs.forEach
          (
            function(i)
            {
              // Real inventory entries append to list of locations we just populated...
              cache_invstock.push
              (
                {
                  id: i.id,
                  locationid: doNiceId(i.locationid),
                  locationname: doNiceString(i.locationname),
                  productid: doNiceString(i.productid),
                  productcode: doNiceString(i.productcode),
                  productname: doNiceString(i.productname),
                  costprice: _.formatnumber(i.costprice, 4),
                  qty: _.formatnumber(i.qty, 4),
                  type: doGetStringFromIdInObjArray(inventorytypes, i.type),
                  batchno: doNiceString(i.batchno),
                  dateexpiry: doNiceDate(i.dateexpiry),
                  dateproduction: doNiceDate(i.dateproduction),
                  comments: doNiceString(i.comments),
                  created: doNiceDate(i.datecreated),
                  by: doNiceTitleizeString(i.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('inventoryjournal', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'addinventory',
      function(data)
      {
        $('#divEvents').trigger('addinventory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildinventory',
      function(data)
      {
        $('#divEvents').trigger('buildinventory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'getinventoryproducttotals',
      function(data)
      {
        if (!_.isUndefined(data.total) && !_.isNull(data.total))
        {
          var selectedproductid = doGetDropDownListValue('fldInventoryProduct');

          if (!_.isNull(selectedproductid) && (data.total.productid == selectedproductid))
            $('#spnInventoryQty').html('<strong>Total</strong> in inventory: ' + _.formatnumber(data.total.qty, 4));
        }
      }
    );

    primus.on
    (
      'getinventoryproductlocationtotals',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          var loc = '';
          var html = '<table border="0" cellpadding="2" style="color: #888; font-style: italic; font-size: small">';

          data.rs.forEach
          (
            function(t)
            {
              // No assigned location?
              loc = _.isNull(t.locationid) ? '' : t.locationname;
              html += '<tr><td align="left">' + loc + ':</td><td align="right">' + _.formatnumber(t.qty, 4) + '</td></tr>';
            }
          );

          html += '</table>';
          $('#spnInventoryLocationQty').html(html);
        }
      }
    );

    primus.on
    (
      'saveinventory',
      function(data)
      {
        doClearInventory();
      }
    );

    primus.on
    (
      'transferinventory',
      function(data)
      {
        $('#divEvents').trigger('transferinventory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listbuilds',
      function(data)
      {
        $('#divEvents').trigger('listbuilds', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expirebuild',
      function(data)
      {
        $('#divEvents').trigger('expirebuild', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order build requests
    primus.on
    (
      'listorderbuilds',
      function(data)
      {
        $('#divEvents').trigger('listorderbuilds', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Status alert requests
    primus.on
    (
      'liststatusalerts',
      function(data)
      {
        doUpdateInitTasksProgress();

        $('#divEvents').trigger('liststatusalerts', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'loadstatusalert',
      function(data)
      {
        $('#divEvents').trigger('loadstatusalert', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newstatusalert',
      function(data)
      {
        $('#divEvents').trigger('newstatusalert', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'savestatusalert',
      function(data)
      {
        $('#divEvents').trigger('savestatusalert', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expirestatusalert',
      function(data)
      {
        $('#divEvents').trigger('expirestatusalert', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // POrder requests
    primus.on
    (
      'listporders',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_porders = [];

          data.rs.forEach
          (
            function(o)
            {
              cache_porders.push
              (
                {
                  id: doNiceId(o.id),
                  clientid: doNiceId(o.clientid),
                  porderno: doNiceString(o.porderno),
                  name: doNiceString(o.name),
                  invoiceno: doNiceString(o.invoiceno),
                  refno: doNiceString(o.refno),
                  totalprice: _.sanitiseAsNumeric(o.totalprice, 4),
                  totalqty: _.sanitiseAsNumeric(o.totalqty, 4),
                  /*
                  shiptoname: doNiceString(o.shiptoname),
                  shiptoaddress1: doNiceString(o.shiptoaddress1),
                  shiptoaddress2: doNiceString(o.shiptoaddress2),
                  shiptocity: doNiceString(o.shiptocity),
                  shiptostate: doNiceString(o.shiptostate),
                  shiptopostcode: doNiceString(o.shiptopostcode),
                  shiptocountry: _.isBlank(o.shiptocountry) ? defaultCountry : doNiceString(o.shiptocountry),
                  invoicetoname: doNiceString(o.invoicetoname),
                  invoicetoaddress1: doNiceString(o.invoicetoaddress1),
                  invoicetoaddress2: doNiceString(o.invoicetoaddress2),
                  invoicetocity: doNiceString(o.invoicetocity),
                  invoicetostate: doNiceString(o.invoicetostate),
                  invoicetopostcode: doNiceString(o.invoicetopostcode),
                  invoicetocountry: _.isBlank(o.shiptocountry) ? defaultCountry : doNiceString(o.invoicetocountry),
                  */
                  inventorycommitted: o.inventorycommitted,
                  completed: doNiceDate(o.datecompleted),
                  completedby: doNiceTitleizeString(o.usercompleted),
                  paid: _.formatnumber(o.paid, 2),
                  balance: _.formatnumber(o.balance, 2),
                  date: doNiceDateModifiedOrCreated(o.datemodified, o.datecreated),
                  by: doNiceModifiedBy(o.datemodified, o.usermodified, o.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listporders', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'loadporder',
      function(data)
      {
        $('#divEvents').trigger('loadporder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newporder',
      function(data)
      {
        $('#divEvents').trigger('newporder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveporder',
      function(data)
      {
        $('#divEvents').trigger('saveporder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'completeporder',
      function(data)
      {
        $('#divEvents').trigger('completeporder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // POrder detail requests
    primus.on
    (
      'listporderdetails',
      function(data)
      {
        $('#divEvents').trigger('listporderdetails', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order requests
    primus.on
    (
      'listorders',
      function(data)
      {
        doUpdateInitTasksProgress();

        $('#divEvents').trigger('listorders', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'loadorder',
      function(data)
      {
        $('#divEvents').trigger('loadorder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'neworder',
      function(data)
      {
        $('#divEvents').trigger('neworder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveorder',
      function(data)
      {
        $('#divEvents').trigger('saveorder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireorder',
      function(data)
      {
        $('#divEvents').trigger('expireorder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'checkorderpo',
      function(data)
      {
        $('#divEvents').trigger('checkorderpo', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'duplicateorder',
      function(data)
      {
        $('#divEvents').trigger('duplicateorder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newversionorder',
      function(data)
      {
        $('#divEvents').trigger('newversionorder', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'createinvoicefromorder',
      function(data)
      {
        //doClearOrder();
      }
    );

    // Order attachment requests
    primus.on
    (
      'listorderattachments',
      function(data)
      {
        $('#divEvents').trigger('listorderattachments', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveorderattachment',
      function(data)
      {
        $('#divEvents').trigger('saveorderattachment', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireorderattachment',
      function(data)
      {
        $('#divEvents').trigger('expireorderattachment', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'getorderthumbnail',
      function(data)
      {
        $('#divEvents').trigger('getorderthumbnail', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order note requests
    primus.on
    (
      'listordernotes',
      function(data)
      {
        $('#divEvents').trigger('listordernotes', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newordernote',
      function(data)
      {
        $('#divEvents').trigger('newordernote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveordernote',
      function(data)
      {
        $('#divEvents').trigger('newordernote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'searchordernote',
      function(data)
      {
        $('#divEvents').trigger('searchordernote', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order status requests
    primus.on
    (
      'listorderstatuses',
      function(data)
      {
        $('#divEvents').trigger('listorderstatuses', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'neworderstatus',
      function(data)
      {
        $('#divEvents').trigger('neworderstatus', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // TPCC requests
    primus.on
    (
      'tpccaddstatus',
      function(data)
      {
        $('#divEvents').trigger('tpccaddstatus', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccbuild',
      function(data)
      {
        $('#divEvents').trigger('tpccbuild', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccorderbuilds',
      function(data)
      {
        $('#divEvents').trigger('tpccorderbuilds', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccloadjobsheet',
      function(data)
      {
        $('#divEvents').trigger('tpccloadjobsheet', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpcclistjobsheetdetails',
      function(data)
      {
        $('#divEvents').trigger('tpcclistjobsheetdetails', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccsavejobsheet',
      function(data)
      {
        $('#divEvents').trigger('tpccsavejobsheet', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccjobsheetimagecreated',
      function(data)
      {
        $('#divEvents').trigger('tpccjobsheetimagecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccjobsheetdetailadded',
      function(data)
      {
        $('#divEvents').trigger('tpccjobsheetdetailadded', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccproductcategoryfrombuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('tpccproductcategoryfrombuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpcccreateproductfrombuildtemplate',
      function(data)
      {
        $('#divEvents').trigger('tpcccreateproductfrombuildtemplate', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccprintjobsheet',
      function(data)
      {
        if (!_.isUndefined(data.jobsheetno) && !_.isNull(data.jobsheetno))
        {
          var url = '/js?no=' + data.jobsheetno + '&fguid=' + fguid;
          var w = window.open(url, '_blank');

          if (w)
            w.print();
        }
      }
    );

    // Order detail requests
    primus.on
    (
      'listorderdetails',
      function(data)
      {
        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_orderproducts = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_orderproducts.push
              (
                {
                  id: doNiceId(p.id),
                  productid: doNiceId(p.productid),
                  name: doNiceString(p.productname),
                  price: _.sanitiseAsNumeric(p.price),
                  qty: _.niceformatqty(p.qty),
                  discount: _.niceformatqty(p.discount, 2),
                  expressfee: _.niceformatqty(p.expressfee, 2),
                  isrepeat: doNiceIntToBool(p.isrepeat),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listorderdetails', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    primus.on
    (
      'neworderdetail',
      function(data)
      {
        $('#divEvents').trigger('neworderdetail', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'saveorderdetail',
      function(data)
      {
        $('#divEvents').trigger('saveorderdetail', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'expireorderdetail',
      function(data)
      {
        $('#divEvents').trigger('expireorderdetail', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Gov requests
    primus.on
    (
      'abnlookup',
      function(data)
      {
        $('#divEvents').trigger('abnlookup', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // POS requests
    primus.on
    (
      'posgetproduct',
      function(data)
      {
        $('#divEvents').trigger('posgetproduct', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'posgenbarcode',
      function(data)
      {
        $('#divEvents').trigger('posgenbarcode', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'poscashsale',
      function(data)
      {
        $('#divEvents').trigger('poscashsale', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'poscreditsale',
      function(data)
      {
        $('#divEvents').trigger('poscreditsale', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'possplitsale',
      function(data)
      {
        $('#divEvents').trigger('possplitsale', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'possearchsale',
      function(data)
      {
        $('#divEvents').trigger('possearchsale', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'posloadsale',
      function(data)
      {
        $('#divEvents').trigger('posloadsale', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'posnewcust',
      function(data)
      {
        $('#divEvents').trigger('posnewcust', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'possalestotal',
      function(data)
      {
        $('#divEvents').trigger('possalestotal', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // MDM requests
    primus.on
    (
      'lastuserpoll',
      function(data)
      {
        $('#divEvents').trigger('lastuserpoll', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Message requests
    primus.on
    (
      'listchatsforme',
      function(data)
      {
        $('#divEvents').trigger('listchatsforme', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'listalertsforme',
      function(data)
      {
        $('#divEvents').trigger('listalertsforme', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'chatmsg',
      function(data)
      {
        $('#divEvents').trigger('chatmsg', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'emailhistory',
      function(data)
      {
        $('#divEvents').trigger('emailhistory', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Report requests
    primus.on
    (
      'report',
      function(data)
      {
        $('#divEvents').trigger(data.pdata.report, {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // ************************************************************************************************************************************************************************************************
    // Server notification events... usually a broadcast of results from server requests...
    // ************************************************************************************************************************************************************************************************

    primus.on
    (
      'eventerror',
      function(data)
      {
        showIdle();
        if (!_.isUndefined(data.rc) && !_.isNull(data.rc) && !_.isUndefined(data.msg) && !_.isNull(data.msg))
        {
          switch (parseInt(data.rc))
          {
            case errcode_nodata:
            {
              noty({text: 'No data or no matching data', type: 'information', timeout: 4000});
              break;
            }
            case errcode_notloggedin:
            {
              // Ignore...
              break;
            }
            case errcode_usernotregistered:
            case errcode_invalidlogin:
            {
              noty({text: 'Login failed, please try again', type: 'error', timeout: 4000, force: true, killer: true});
              $('#fldUid').focus();
              break;
            }
            default:
            {
              noty({text: 'Error ' + data.rc + ': ' + data.msg, type: 'error', timeout: 10000});
              break;
            }
          }
        }
      }
    );

    // Account events
    primus.on
    (
      'accountcreated',
      function(data)
      {
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'accountsaved',
      function(data)
      {
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'accountparentchanged',
      function(data)
      {
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'accountexpired',
      function(data)
      {
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Journal events
    primus.on
    (
      'journaladded',
      function(data)
      {
        primus.emit('listjournals', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Product category events
    primus.on
    (
      'productcategorycreated',
      function(data)
      {
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productcategorysaved',
      function(data)
      {
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productcategoryparentchanged',
      function(data)
      {
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productcategoryexpired',
      function(data)
      {
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Superfund events
    primus.on
    (
      'superfundcreated',
      function(data)
      {
        primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'superfundsaved',
      function(data)
      {
        primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'superfundexpired',
      function(data)
      {
        primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Exchange rate events
    primus.on
    (
      'exchangeratecreated',
      function(data)
      {
        // Someone created superfund, reload cache and display...
        primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'exchangeratesaved',
      function(data)
      {
        // Someone changed superfund, reload cache and display...
        primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'exchangerateexpired',
      function(data)
      {
        // Someone removed superfund, reload cache and display...
        primus.emit('listexchangerates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Taxcode events
    primus.on
    (
      'taxcodecreated',
      function(data)
      {
        primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'taxcodesaved',
      function(data)
      {
        primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'taxcodeexpired',
      function(data)
      {
        primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Location events
    primus.on
    (
      'locationcreated',
      function(data)
      {
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'locationsaved',
      function(data)
      {
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'locationparentchanged',
      function(data)
      {
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'locationexpired',
      function(data)
      {
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Client events
    primus.on
    (
      'clientcreated',
      function(data)
      {
        $('#divEvents').trigger('clientcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'clientsaved',
      function(data)
      {
        $('#divEvents').trigger('clientsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'clientparentchanged',
      function(data)
      {
        $('#divEvents').trigger('clientparentchanged', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'clientexpired',
      function(data)
      {
        $('#divEvents').trigger('clientexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Client note events
    primus.on
    (
      'clientnotecreated',
      function(data)
      {
        $('#divEvents').trigger('clientnotecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'clientnotesaved',
      function(data)
      {
        $('#divEvents').trigger('clientnotesaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Client attachment events
    primus.on
    (
      'clientattachmentcreated',
      function(data)
      {
        $('#divEvents').trigger('clientattachmentcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'clientattachmentsaved',
      function(data)
      {
        $('#divEvents').trigger('clientattachmentsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'clientattachmentexpired',
      function(data)
      {
        $('#divEvents').trigger('clientattachmentexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Supplier events
    primus.on
    (
      'suppliercreated',
      function(data)
      {
        $('#divEvents').trigger('suppliercreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'suppliersaved',
      function(data)
      {
        $('#divEvents').trigger('suppliersaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'supplierparentchanged',
      function(data)
      {
        $('#divEvents').trigger('supplierparentchanged', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'supplierexpired',
      function(data)
      {
        $('#divEvents').trigger('supplierexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Supplier note events
    primus.on
    (
      'suppliernotecreated',
      function(data)
      {
        $('#divEvents').trigger('suppliernotecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'suppliernotesaved',
      function(data)
      {
        $('#divEvents').trigger('suppliernotesaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Supplier attachment events
    primus.on
    (
      'supplierattachmentcreated',
      function(data)
      {
        $('#divEvents').trigger('supplierattachmentcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'supplierattachmentsaved',
      function(data)
      {
        $('#divEvents').trigger('supplierattachmentsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'supplierattachmentexpired',
      function(data)
      {
        $('#divEvents').trigger('supplierattachmentexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Employee events
    primus.on
    (
      'employeecreated',
      function(data)
      {
        $('#divEvents').trigger('employeecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'employeesaved',
      function(data)
      {
        $('#divEvents').trigger('employeesaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'employeeexpired',
      function(data)
      {
        $('#divEvents').trigger('employeeexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'employeeparentchanged',
      function(data)
      {
        $('#divEvents').trigger('employeeparentchanged', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product events
    primus.on
    (
      'productcreated',
      function(data)
      {
        $('#divEvents').trigger('productupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productsaved',
      function(data)
      {
        $('#divEvents').trigger('productupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productparentchanged',
      function(data)
      {
        $('#divEvents').trigger('productupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productexpired',
      function(data)
      {
        $('#divEvents').trigger('productupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product code events
    primus.on
    (
      'productcodecreated',
      function(data)
      {
        $('#divEvents').trigger('productcodecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productcodeexpired',
      function(data)
      {
        $('#divEvents').trigger('productcodeexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product pricing events
    primus.on
    (
      'productpricingcreated',
      function(data)
      {
        $('#divEvents').trigger('productpricingupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productpricingsaved',
      function(data)
      {
        $('#divEvents').trigger('productpricingupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'productpricingexpired',
      function(data)
      {
        $('#divEvents').trigger('productpricingupdated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Build template events
    primus.on
    (
      'buildtemplatecreated',
      function(data)
      {
        primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'buildtemplatesaved',
      function(data)
      {
        // primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listbuildtemplates_search', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'buildtemplateduplicated',
      function(data)
      {
        // primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listbuildtemplates_search', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});

      }
    );

    primus.on
    (
      'buildtemplateexpired',
      function(data)
      {
        // primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listbuildtemplates_search', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'buildtemplateparentchanged',
      function(data)
      {
        // primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listbuildtemplates_search', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'buildtemplatesyncedtomaster',
      function(data)
      {
        // primus.emit('listbuildtemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listbuildtemplates_search', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Build template detail events
    primus.on
    (
      'buildtemplatedetailcreated',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatedetailcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildtemplatedetailsaved',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatedetailsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildtemplateparentchanged',
      function(data)
      {
        $('#divEvents').trigger('buildtemplateparentchanged', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildtemplateduplicated',
      function(data)
      {
        $('#divEvents').trigger('buildtemplateduplicated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildtemplatedetailexpired',
      function(data)
      {
        $('#divEvents').trigger('buildtemplatedetailexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Product template events
    primus.on
    (
      'producttemplatecreated',
      function(data)
      {
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplatesaved',
      function(data)
      {
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplateparentchanged',
      function(data)
      {
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplateexpired',
      function(data)
      {
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplateduplicated',
      function(data)
      {
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Product template detail events
    primus.on
    (
      'producttemplatedetailcreated',
      function(data)
      {
        $('#divEvents').trigger('producttemplatedetailcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'producttemplatedetailsaved',
      function(data)
      {
        $('#divEvents').trigger('producttemplatedetailsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'producttemplatedetailexpired',
      function(data)
      {
        $('#divEvents').trigger('producttemplatedetailsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'producttemplatesynced',
      function(data)
      {
        $('#divEvents').trigger('producttemplatesynced', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Invoice events
    primus.on
    (
      'invoicecreated',
      function(data)
      {
        $('#divEvents').trigger('invoicecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'invoicespaid',
      function(data)
      {
        $('#divEvents').trigger('invoicespaid', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'porderspaid',
      function(data)
      {
        $('#divEvents').trigger('porderspaid', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // POrder events
    primus.on
    (
      'pordercreated',
      function(data)
      {
        $('#divEvents').trigger('pordercreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'porderexpired',
      function(data)
      {
        console.log('porder expired');
        $('#divEvents').trigger('porderexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'pordercompleted',
      function(data)
      {
        $('#divEvents').trigger('pordercompleted', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order events
    primus.on
    (
      'ordercreated',
      function(data)
      {
        $('#divEvents').trigger('ordercreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'ordersaved',
      function(data)
      {
        $('#divEvents').trigger('ordersaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderexpired',
      function(data)
      {
        $('#divEvents').trigger('orderexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderduplicated',
      function(data)
      {
        $('#divEvents').trigger('orderduplicated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'ordernewversion',
      function(data)
      {
        $('#divEvents').trigger('ordernewversion', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderinvoicetosaved',
      function(data)
      {
        $('#divEvents').trigger('orderinvoicetosaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderpaid',
      function(data)
      {
        $('#divEvents').trigger('orderpaid', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order status events
    primus.on
    (
      'orderstatuscreated',
      function(data)
      {
        $('#divEvents').trigger('orderstatuscreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Alert events
    primus.on
    (
      'orderstatusalert',
      function(data)
      {
        $('#divEvents').trigger('orderstatusalert', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order note events
    primus.on
    (
      'ordernotecreated',
      function(data)
      {
        $('#divEvents').trigger('ordernotecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'ordernotesaved',
      function(data)
      {
        $('#divEvents').trigger('ordernotesaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order attachment events
    primus.on
    (
      'orderattachmentcreated',
      function(data)
      {
        $('#divEvents').trigger('orderattachmentcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderattachmentsaved',
      function(data)
      {
        $('#divEvents').trigger('orderattachmentsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderattachmentexpired',
      function(data)
      {
        $('#divEvents').trigger('orderattachmentexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Order detail events
    primus.on
    (
      'orderdetailcreated',
      function(data)
      {
        $('#divEvents').trigger('orderdetailcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderdetailsaved',
      function(data)
      {
        $('#divEvents').trigger('orderdetailsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'orderdetailexpired',
      function(data)
      {
        $('#divEvents').trigger('orderdetailexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Inventory events
    primus.on
    (
      'inventoryadded',
      function(data)
      {
        $('#divEvents').trigger('inventoryadded', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'inventorybuilt',
      function(data)
      {
        $('#divEvents').trigger('inventorybuilt', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'buildexpired',
      function(data)
      {
        $('#divEvents').trigger('buildexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Status alert events
    primus.on
    (
      'statusalertcreated',
      function(data)
      {
        $('#divEvents').trigger('statusalertcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'statusalertsaved',
      function(data)
      {
        $('#divEvents').trigger('statusalertsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'statusalertexpired',
      function(data)
      {
        $('#divEvents').trigger('statusalertexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Data events
    primus.on
    (
      'accountsimported',
      function(data)
      {
        noty({text: 'Imported account file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped, type: 'success', timeout: 10000});
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'employeesimported',
      function(data)
      {
        noty({text: 'Imported employees file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped, type: 'success', timeout: 10000});
        primus.emit('listemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientsimported',
      function(data)
      {
        noty({text: 'Imported clients file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped, type: 'success', timeout: 10000});
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'suppliersimported',
      function(data)
      {
        noty({text: 'Imported suppliers file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped, type: 'success', timeout: 10000});
        primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productsimported',
      function(data)
      {
        noty({text: 'Imported products file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped, type: 'success', timeout: 10000});
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Rfid events...
    primus.on
    (
      'newrtap',
      function(data)
      {
        $('#divEvents').trigger('newrtap', {data: data, pdata: 'none'});
      }
    );

    primus.on
    (
      'insertrtap',
      function(data)
      {
        $('#divEvents').trigger('insertrtap', {data: data, pdata: 'none'});
      }
    );

    primus.on
    (
      'rtapinserted',
      function(data)
      {
        $('#divEvents').trigger('rtapinserted', {data: data, pdata: 'none'});
      }
    );

    primus.on
    (
      'listrtaps',
      function(data)
      {
        $('#divEvents').trigger('listrtaps', {data: data, pdata: 'none'});
      }
    );

    // Printing events
    primus.on
    (
      'emailsent',
      function(data)
      {
        $('#divEvents').trigger('emailsent', {data: data, pdata: 'none'});
      }
    );

    // User events
    primus.on
    (
      'usercreated',
      function(data)
      {
        primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'usersaved',
      function(data)
      {
        primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'userexpired',
      function(data)
      {
        primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'userpermissionssaved',
      function(data)
      {
        $('#divEvents').trigger('userpermissionssaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // TPCC events
    primus.on
    (
      'tpccjobsheetcreated',
      function(data)
      {
        $('#divEvents').trigger('tpccjobsheetcreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccjobsheetexpired',
      function(data)
      {
        $('#divEvents').trigger('tpccjobsheetexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'tpccjobsheetsaved',
      function(data)
      {
        $('#divEvents').trigger('tpccjobsheetsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // Config events
    primus.on
    (
      'configsaved',
      function(data)
      {
        $('#divEvents').trigger('configsaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'printtemplatecreated',
      function(data)
      {
        $('#divEvents').trigger('printtemplatecreated', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'printtemplatesaved',
      function(data)
      {
        $('#divEvents').trigger('printtemplatesaved', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'printtemplateexpired',
      function(data)
      {
        $('#divEvents').trigger('printtemplateexpired', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // POS events
    primus.on
    (
      'poscustcreated',
      function(data)
      {
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Message events
    primus.on
    (
      'emailfeedback',
      function(data)
      {
        $('#divEvents').trigger('emailfeedback', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newchatmsg',
      function(data)
      {
        $('#divEvents').trigger('newchatmsg', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // MDM events
    primus.on
    (
      'useronline',
      function(data)
      {
        $('#divEvents').trigger('useronline', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'useroffline',
      function(data)
      {
        $('#divEvents').trigger('useroffline', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'userlogout',
      function(data)
      {
        $('#divEvents').trigger('userlogout', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'userpolled',
      function(data)
      {
        $('#divEvents').trigger('userpolled', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'userpaused',
      function(data)
      {
        $('#divEvents').trigger('userpaused', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'userweather',
      function(data)
      {
        $('#divEvents').trigger('userweather', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    primus.on
    (
      'newpoll',
      function(data)
      {
        $('#divEvents').trigger('newpoll', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    console.log('***** Primus initialised...');
  }

  catch (err)
  {
    console.log('****************** Primus exception: ' + err);
  }
}
