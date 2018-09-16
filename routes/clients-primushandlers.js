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
          /*
          if (annyang)
            noty({text: 'Your browser supports speech recognition - Click Allow Microphone Access, then say "Orders Dashboard"', type: 'success', timeout: 5000});
          */
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
      }
    );

    primus.on
    (
      'end',
      function()
      {
      }
    );

    primus.on
    (
      'reconnecting',
      function(opts)
      {
        var s = opts.timeout / 1000;
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64searching + '" width="24" height="24"/> Sending search party for server in ' + s.toFixed(0) + 's, retry ' + opts.attempt + ' of ' + opts.retries);
      }
    );

    primus.on
    (
      'reconnect',
      function()
      {
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64gears + '" width="24" height="24"/> Looking for server now...');
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
        addChannels(data.channel);
        showIdle();
      }
    );

    primus.on
    (
      'join',
      function(data)
      {
        var pdata = data.pdata || '';
      }
    );

    primus.on
    (
      'login',
      function(data)
      {
        uid = data.uid;
        uname = data.uname;
        uuid = data.uuid;
        isadmin = data.isadmin;
        isclient = data.isclient;
        clientid = data.clientid;
        myperms = data.permissions;
        session = data.session;

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
        $('#spnMenu').html('Logged in as <strong>' + _.titleize(uname) + '</strong>');
        $('#spnServer').text(server);

        // Trigger refresh/load of all data and close login dialog...
        $('#divEvents').trigger('refresh-all', {pdata: 'none'});
        $('#dlgLogin').dialog('close');

        // Close TABs where user permissions deny viewing
        // Can't handle creation permissions here since TAB panels are not yet loaded...

        doOrdersTabWidgets();
        //doInvoicesTabWidgets();
      }
    );

    // ************************************************************************************************************************************************************************************************
    // Application responses
    // ************************************************************************************************************************************************************************************************

    // Client requests

    primus.on
    (
      'getclient',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.client) && !_.isNull(data.client))
        {
          if (!_.isUndefined(pdata.callback) && !_.isNull(pdata.callback))
          {
            var callback = window[pdata.callback];
            if (_.isFunction(callback))
            {
              var client =
              {
                id: doNiceId(data.client.id),
                parentid: doNiceId(data.client.parentid),
                parentname: doNiceString(data.client.parentname),
                code: doNiceString(data.client.code),
                name: doNiceString(data.client.name),
                url1: doNiceString(data.client.url1),
                email1: doNiceString(data.client.email1),
                phone1: doNiceString(data.client.phone1),
                fax1: doNiceString(data.client.fax1),
                contact1: doNiceString(data.client.contact1),
                address1: doNiceString(data.client.address1),
                address2: doNiceString(data.client.address2),
                city: doNiceString(data.client.city),
                state: doNiceString(data.client.state),
                postcode: doNiceString(data.client.postcode),
                country: doNiceString(data.client.country),
                contact2: doNiceString(data.client.contact2),
                shipaddress1: doNiceString(data.client.shipaddress1),
                shipaddress2: doNiceString(data.client.shipaddress2),
                shipcity: doNiceString(data.client.shipcity),
                shipstate: doNiceString(data.client.shipstate),
                shippostcode: doNiceString(data.client.shippostcode),
                shipcountry: doNiceString(data.client.shipcountry),
                bankname: doNiceString(data.client.banekname),
                bankbsb: doNiceString(data.client.bankbsb),
                bankaccountno: doNiceString(data.client.bankaccountno),
                bankaccountname: doNiceString(data.client.bankaccountname),
                dayscredit: data.client.dayscredit,
                linelimit: _.formatnumber(data.client.linelimit, 4),
                orderlimit: _.formatnumber(data.client.orderlimit, 4),
                creditlimit: _.formatnumber(data.client.creditlimit, 4),
                invoicetemplateid : doNiceId(data.client.invoicetemplateid),
                ordertemplateid : doNiceId(data.client.ordertemplateid),
                quotetemplateid : doNiceId(data.client.quotetemplateid),
                deliverydockettemplateid : doNiceId(data.deliverydockettemplateid),
                labeltemplateid : doNiceId(data.labeltemplateid),
                isactive: data.client.isactive,
                date: doNiceDateModifiedOrCreated(data.client.datemodified, data.client.datecreated),
                by: doNiceModifiedBy(data.client.datemodified, data.client.usermodified, data.client.usercreated)
              };

              callback(client, pdata);
            }
          }
        }
      }
    );

    primus.on
    (
      'listemails',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          if (!_.isUndefined(pdata.callback) && !_.isNull(pdata.callback))
          {
            var callback = window[pdata.callback];
            if (_.isFunction(callback))
              callback(data.rs, pdata);
          }
        }
      }
    );

    // Client note requests

    primus.on
    (
      'listclientnotes',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_clientnotes = [];

          data.rs.forEach
          (
            function(n)
            {
              cache_clientnotes.push
              (
                {
                  id: doNiceId(n.id),
                  notes: doNiceString(n.notes),
                  date: doNiceDateModifiedOrCreated(n.datemodified, n.datecreated),
                  by: doNiceModifiedBy(n.datemodified, n.usermodified, n.usercreated)
                }
              );
            }
          );
          refreshFromCacheClientNotes(pdata);
        }
      }
    );

    primus.on
    (
      'newclientnote',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listclientnotes', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh', clientnoteid: data.clientnoteid}});
      }
    );

    primus.on
    (
      'saveclientnote',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listclientnotes', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh', clientnoteid: data.clientnoteid}});
      }
    );

    // Client attachment requests

    primus.on
    (
      'listclientattachments',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_clientattachments = [];

          data.rs.forEach
          (
            function(a)
            {
              cache_clientattachments.push
              (
                {
                  id: doNiceId(a.id),
                  name: doNiceString(a.name),
                  description: doNiceString(a.description),
                  mimetype: '<a href="javascript:void(0);" onClick="doThrowClientAttachment(' + a.id + ');">' + mapMimeTypeToImage(a.mimetype) + '</a>',
                  size: doNiceString(a.size),
                  image: doNiceString(a.image),
                  date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
                  by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
                }
              );
            }
          );
          refreshFromCacheClientAttachments(pdata);
        }
      }
    );

    primus.on
    (
      'saveclientattachment',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listclientattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'expireclientattachment',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listclientattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    // User requests

    primus.on
    (
      'newuser',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', useruuid: data.useruuid}});
        noty({text: 'User created with password <strong>' + data.pwd + '</strong>', type: 'success'});
        //window.prompt("Copy password to clipboard: Ctrl+C (Windows) or Cmd+C (Mac), Enter", data.pwd);
      }
    );

    primus.on
    (
      'saveuser',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', useruuid: data.useruuid}});
      }
    );

    primus.on
    (
      'expireuser',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', useruuid: data.useruuid}});
      }
    );

    primus.on
    (
      'changpassword',
      function(data)
      {
        var pdata = data.pdata || '';

        noty({text: 'Password successfully changed', type: 'success', timeout: 4000});
      }
    );

    primus.on
    (
      'listusers',
      function(data)
      {
        var pdata = data.pdata || '';

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
                  date: doNiceDateModifiedOrCreated(u.datemodified, u.datecreated),
                  by: doNiceModifiedBy(u.datemodified, u.usermodified, u.usercreated),
                  status: imgstatus
                }
              );
            }
          );
          refreshFromCacheUsers(pdata);
        }
        primus.emit('listconnectedusers', {fguid: fguid, uuid: uuid, session: session, pdata: 'refresh-all'});
      }
    );

    primus.on
    (
      'listconnectedusers',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          data.rs.forEach
          (
            function(u)
            {
              //$('#divUsersGrid').jqxTreeGrid('setCellValue', u.uuid, 'status', mapUuidToImage(u.uuid));
            }
          );
        }
      }
    );

    primus.on
    (
      'saveuserpermissions',
      function(data)
      {
        var pdata = data.pdata || '';
      }
    );

    // Invoice requests

    primus.on
    (
      'listinvoices',
      function(data)
      {
        var pdata = data.pdata || '';

        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_invoices = [];

          data.rs.forEach
          (
            function(i)
            {
              if (i.clientid != theclientid)
                return;

              cache_invoices.push
              (
                {
                  id: doNiceId(i.id),
                  clientid: doNiceId(i.clientid),
                  clientname: doNiceString(i.clientname),
                  name: doNiceString(i.name),
                  pono: doNiceString(i.pono),
                  invoiceno: doNiceString(i.invoiceno),
                  orderno: doNiceString(i.orderno),
                  copyno: i.copyno,
                  totalprice: _.sanitiseAsNumeric(i.totalprice, 4),
                  dayscredit: i.dayscredit,
                  orderlimit: _.formatnumber(i.orderlimit, 4),
                  creditlimit: _.formatnumber(i.creditlimit, 4),
                  date: doNiceDate(i.invoicedate),
                  by: _.titleize(i.userinvoiced)
                }
              );
            }
          );
          //refreshFromCacheInvoices(pdata);
        }
      }
    );

    primus.on
    (
      'listinvoicesbyclient',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_clientinvoices = [];

          data.rs.forEach
          (
            function(i)
            {
              cache_clientinvoices.push
              (
                {
                  id: doNiceId(i.id),
                  clientid: doNiceId(i.clientid),
                  clientname: doNiceString(i.clientname),
                  name: doNiceString(i.name),
                  pono: doNiceString(i.pono),
                  invoiceno: doNiceString(i.invoiceno),
                  orderno: doNiceString(i.orderno),
                  totalprice: _.formatnumber(i.totalprice, 4),
                  totalgst: _.formatnumber(i.totalgst, 4),
                  date: doNiceDate(i.invoicedate)
                }
              );
            }
          );
          refreshFromCacheClientInvoices(pdata);
        }
      }
    );

    primus.on
    (
      'printinvoices',
      function(data)
      {
        var pdata = data.pdata || '';

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

              noty({text: 'File [' + f + '] has been downloaded', type: 'success', timeout: 4000});
            }
          );

          // Get updated display of #copies printed for invoice(s)
          primus.emit('listinvoices', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        }
      }
    );

    primus.on
    (
      'printorders',
      function(data)
      {
        var pdata = data.pdata || '';

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
      'printdeliverydockets',
      function(data)
      {
        var pdata = data.pdata || '';

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
        var pdata = data.pdata || '';

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
        var pdata = data.pdata || '';

        if (!_.isUndefined(pdata.callback) && !_.isNull(pdata.callback))
        {
          var callback = window[pdata.callback];
          if (_.isFunction(callback))
            callback(pdata);
        }
        primus.emit('emailhistory', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'searchinvoices',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_invoices = [];

          data.rs.forEach
          (
            function(i)
            {
              cache_invoices.push
              (
                {
                  id: doNiceId(i.id),
                  clientname: doNiceString(i.clientname),
                  name: doNiceString(i.name),
                  pono: doNiceString(i.pono),
                  invoiceno: doNiceString(i.invoiceno),
                  orderno: doNiceString(i.orderno),
                  totalprice: _.formatnumber(i.totalprice, 4),
                  copyno: i.copyno,
                  date: doNiceDate(i.invoicedate),
                  by: doNiceTitleizeString(i.userinvoiced)
                }
              );
            }
          );

          refreshFromCacheInvoices(pdata);
        }
      }
    );

    // Config requests

    primus.on
    (
      'loadconfig',
      function(data)
      {
        var pdata = data.pdata || '';

        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.config) && !_.isNull(data.config))
        {
          cache_config =
          {
            statusid: data.config.statusid,
            inventoryadjustaccountid: data.config.inventoryadjustaccountid,
            currentorderno: data.config.currentorderno,
            currentinvoiceno: data.config.currentinvoiceno,
            currentjournalno: data.config.currentjournalno,
            orderasquote: doNiceIntToBool(data.config.orderasquote),
            inventoryusefifo: doNiceIntToBool(data.config.inventoryusefifo),
            defaultinventorylocationid: data.config.defaultinventorylocationid,
            invoiceprinttemplateid: data.config.invoiceprinttemplateid,
            orderprinttemplateid: data.config.orderprinttemplateid,
            quoteprinttemplateid: data.config.quoteprinttemplateid,
            deliverydocketprinttemplateid: data.config.deliverydocketprinttemplateid,
            date: doNiceDateModifiedOrCreated(data.config.datemodified, data.config.datecreated),
            by: doNiceModifiedBy(data.config.datemodified, data.config.usermodified, data.config.usercreated)
          };
          //refreshFromCacheConfig(pdata);
        }
      }
    );

    primus.on
    (
      'saveconfig',
      function(data)
      {
        var pdata = data.pdata || '';
      }
    );

    // Product category requests

    primus.on
    (
      'listproductcategories',
      function(data)
      {
        var pdata = data.pdata || '';

        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_productcategories = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_productcategories.push
              (
                {
                  id: doNiceId(p.id),
                  parentid: doNiceId(p.parentid),
                  parentname: doNiceId(p.parentname),
                  code: doNiceString(p.code),
                  name: doNiceString(p.name),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );
          //refreshFromCacheProductCategories(pdata);
        }
      }
    );

    primus.on
    (
      'newproductcategory',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', productcategoryid: data.productcategoryid}});
      }
    );

    primus.on
    (
      'saveproductcategory',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', productcategoryid: data.productcategoryid}});
      }
    );

    primus.on
    (
      'changeproductcategoryparent',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', productcategoryid: data.productcategoryid}});
      }
    );

    primus.on
    (
      'expireproductcategory',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Product requests

    primus.on
    (
      'listproducts',
      function(data)
      {
        var pdata = data.pdata || '';

        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_products = [];

          data.rs.forEach
          (
            function(p)
            {
              if (p.clientid != theclientid)
                return;

              cache_products.push
              (
                {
                  id: doNiceId(p.id),
                  productcategoryid: doNiceId(p.productcategoryid),
                  productcategoryname: doNiceString(p.productcategoryname),
                  name: doNiceString(p.name),
                  code: doNiceString(p.code),
                  barcode: doNiceString(p.altcode),
                  costprice: _.formatnumber(p.costprice, 4),
                  costgst: _.formatnumber(p.costgst, 4),
                  taxcodeid: doNiceId(p.taxcodeid),
                  salesaccountid: doNiceId(p.salesaccountid),
                  incomeaccountid: doNiceId(p.incomeaccountid),
                  assetaccountid: doNiceId(p.assetaccountid),
                  uom: doNiceString(p.uom).toUpperCase(),
                  uomsize: _.formatnumber(p.uomsize, 4),
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
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );
         //refreshFromCacheProducts(pdata);
        }
      }
    );

    primus.on
    (
      'listproductsbycategory',
      function(data)
      {
        var pdata = data.pdata || '';

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
                  barcode: doNiceString(p.altcode),
                  costprice: _.formatnumber(p.costprice, 4),
                  costgst: _.formatnumber(p.costgst, 4),
                  taxcodeid: doNiceId(p.taxcodeid),
                  salesaccountid: doNiceId(p.salesaccountid),
                  incomeaccountid: doNiceId(p.incomeaccountid),
                  assetaccountid: doNiceId(p.assetaccountid),
                  uom: doNiceString(p.uom).toUpperCase(),
                  uomsize: _.formatnumber(p.uomsize, 4),
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
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );
          refreshFromCacheProductsByCategory(pdata);
        }
      }
    );

    primus.on
    (
      'newproduct',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh', productid: data.productid}});
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'saveproduct',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh', productid: data.productid}});
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'changeproductparent',
      function(data)
      {
        var pdata = data.pdata || '';
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'expireproduct',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh'}});
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'duplicateproduct',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh'}});
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'checkproductcode',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          if (!_.isUndefined(pdata.callback) && !_.isNull(pdata.callback))
          {
            var callback = window[pdata.callback];
            if (_.isFunction(callback))
              callback(data.rs);
          }
        }
      }
    );

    primus.on
    (
      'productsearch',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          if (!_.isUndefined(pdata.callback) && !_.isNull(pdata.callback))
          {
            var callback = window[pdata.callback];
            if (_.isFunction(callback))
              callback(data.rs);
          }
        }
      }
    );

    // Product pricing requests

    primus.on
    (
      'listproductpricing',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_productprices = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_productprices.push
              (
                {
                  id: doNiceId(p.id),
                  clientid: doNiceId(p.clientid),
                  minqty: _.formatnumber(p.minqty, 4),
                  maxqty: _.formatnumber(p.maxqty, 4),
                  price: _.formatnumber(p.price, 4),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );

          refreshFromCacheProductPrices(pdata);
        }
      }
    );

    primus.on
    (
      'newproductpricing',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductpricing', {fguid: fguid, uuid: uuid, session: session, productid: data.productid, pdata: {type: 'refresh', priceid: data.priceid}});
      }
    );

    primus.on
    (
      'saveproductpricing',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductpricing', {fguid: fguid, uuid: uuid, session: session, productid: data.productid, pdata: {type: 'refresh', priceid: data.priceid}});
      }
    );

    primus.on
    (
      'expireproductpricing',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listproductpricing', {fguid: fguid, uuid: uuid, session: session, productid: data.productid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'getproductprices',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_productpriceselection = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_productpriceselection.push
              (
                {
                  id: doNiceId(p.id),
                  clientid: p.clientid,
                  price: _.formatnumber(p.price, 4),
                  minqty: _.formatnumber(p.minqty, 4),
                  maxqty: _.formatnumber(p.maxqty, 4)
                }
              );
            }
          );
          refreshFromCacheProductSelectPrice(pdata);
        }
      }
    );

    primus.on
    (
      'getprice',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.price) && !_.isNull(data.price))
        {
          if (!_.isUndefined(pdata.callback) && !_.isNull(pdata.callback))
          {
            var callback = window[pdata.callback];
            if (_.isFunction(callback))
              callback(data.price, pdata.rowIndex);
          }
        }
      }
    );

    // Status alert requests

    primus.on
    (
      'liststatusalerts',
      function(data)
      {
        console.log(data);
        var pdata = data.pdata || '';

        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_statusalerts = [];

          data.rs.forEach
          (
            function(a)
            {
              cache_statusalerts.push
              (
                {
                  id: doNiceId(a.id),
                  uuid: doNiceId(a.uuid),
                  status: a.status,
                  email: doNiceString(a.email),
                  mobile: doNiceString(a.mobile),
                  date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
                  by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
                }
              );
            }
          );
          refreshFromCacheStatusAlerts(pdata);
        }
      }
    );

    primus.on
    (
      'newstatusalert',
      function(data)
      {
        console.log(data);

        var pdata = data.pdata || '';

        primus.emit('liststatusalerts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', statusalertid: data.statusalertid}});
      }
    );

    primus.on
    (
      'savestatusalert',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('liststatusalerts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', statusalertid: data.statusalertid}});
      }
    );

    primus.on
    (
      'expirestatusalert',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('liststatusalerts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Order requests

    primus.on
    (
      'listorders',
      function(data)
      {
        var pdata = data.pdata || '';

        doUpdateInitTasksProgress();

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_orders = [];

          data.rs.forEach
          (
            function(o)
            {
              if (o.clientid != theclientid)
                return;

              cache_orders.push
              (
                {
                  id: doNiceId(o.id),
                  clientid: doNiceId(o.clientid),
                  orderno: doNiceString(o.orderno),
                  invoiceno: doNiceString(o.invoiceno),
                  name: doNiceString(o.name),
                  pono: doNiceString(o.pono),
                  numversions: o.numversions,
                  activeversion: o.activeversion,
                  startdate: o.startdate,
                  enddate: o.enddate,
                  accountid: doNiceId(o.accountid),
                  totalprice: _.sanitiseAsNumeric(o.totalprice, 4),
                  totalqty: _.sanitiseAsNumeric(o.totalqty, 4),
                  invoicetemplateid: doNiceId(o.invoicetemplateid),
                  ordertemplateid : doNiceId(o.ordertemplateid),
                  quotetemplateid : doNiceId(o.quotetemplateid),
                  shiptoclientid: doNiceId(o.shiptoclientid),
                  shiptoname: doNiceString(o.shiptoname),
                  shiptoaddress1: doNiceString(o.shiptoaddress1),
                  shiptoaddress2: doNiceString(o.shiptoaddress2),
                  shiptocity: doNiceString(o.shiptocity),
                  shiptostate: doNiceString(o.shiptostate),
                  shiptopostcode: doNiceString(o.shiptopostcode),
                  shiptocountry: doNiceString(o.shiptocountry),
                  invoicetoclientid: doNiceId(o.invoicetoclientid),
                  invoicetoname: doNiceString(o.invoicetoname),
                  invoicetoaddress1: doNiceString(o.invoicetoaddress1),
                  invoicetoaddress2: doNiceString(o.invoicetoaddress2),
                  invoicetocity: doNiceString(o.invoicetocity),
                  invoicetostate: doNiceString(o.invoicetostate),
                  invoicetopostcode: doNiceString(o.invoicetopostcode),
                  invoicetocountry: doNiceString(o.invoicetocountry),
                  inventorycommitted: o.inventorycommitted,
                  status: doGetStringFromIdInObjArray(orderstatustypes, o.status),
                  majorstatus: doGetStringFromIdInObjArray(orderstatustypes, o.majorstatus),
                  attachmentid: doNiceId(o.attachmentid),
                  attachmentname: doNiceString(o.attachmentname),
                  attachmentimage: doNiceString(o.attachmentimage),
                  date: doNiceDateModifiedOrCreated(o.datemodified, o.datecreated),
                  by: doNiceModifiedBy(o.datemodified, o.usermodified, o.usercreated)
                }
              );
            }
          );

          refreshFromCacheOrders(pdata);
        }
      }
    );

    primus.on
    (
      'neworder',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', orderid: data.orderid}});
      }
    );

    primus.on
    (
      'saveorder',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', orderid: data.orderid}});
      }
    );

    primus.on
    (
      'expireorder',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'duplicateorder',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', orderid: data.orderid}});
      }
    );

    primus.on
    (
      'newversionorder',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh', orderid: data.orderid}});
      }
    );

    primus.on
    (
      'createinvoicefromorder',
      function(data)
      {
        var pdata = data.pdata || '';

        doClearOrder();
      }
    );

    primus.on
    (
      'searchorders',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_orders = [];

          data.rs.forEach
          (
            function(o)
            {
              console.log(o);
              cache_orders.push
              (
                {
                  id: doNiceId(o.id),
                  clientid: doNiceId(o.clientid),
                  orderno: doNiceString(o.orderno),
                  invoiceno: doNiceString(o.invoiceno),
                  name: doNiceString(o.name),
                  pono: doNiceString(o.pono),
                  numversions: o.numversions,
                  activeversion: o.activeversion,
                  startdate: o.startdate,
                  enddate: o.enddate,
                  accountid: doNiceId(o.accountid),
                  totalprice: _.formatnumber(o.totalprice, 4),
                  totalqty: _.formatnumber(o.totalqty, 4),
                  invoicetemplateid: doNiceId(o.invoicetemplateid),
                  shiptoclientid: doNiceId(o.shiptoclientid),
                  shiptoname: doNiceString(o.shiptoname),
                  shiptoaddress1: doNiceString(o.shiptoaddress1),
                  shiptoaddress2: doNiceString(o.shiptoaddress2),
                  shiptocity: doNiceString(o.shiptocity),
                  shiptostate: doNiceString(o.shiptostate),
                  shiptopostcode: doNiceString(o.shiptopostcode),
                  shiptocountry: doNiceString(o.shiptocountry),
                  invoicetoclientid: doNiceId(o.invoicetoclientid),
                  invoicetoname: doNiceString(o.invoicetoname),
                  invoicetoaddress1: doNiceString(o.invoicetoaddress1),
                  invoicetoaddress2: doNiceString(o.invoicetoaddress2),
                  invoicetocity: doNiceString(o.invoicetocity),
                  invoicetostate: doNiceString(o.invoicetostate),
                  invoicetopostcode: doNiceString(o.invoicetopostcode),
                  invoicetocountry: doNiceString(o.invoicetocountry),
                  status: doGetStringFromIdInObjArray(orderstatustypes, o.status),
                  majorstatus: doGetStringFromIdInObjArray(orderstatustypes, o.majorstatus),
                  date: doNiceDateModifiedOrCreated(o.datemodified, o.datecreated),
                  by: doNiceModifiedBy(o.datemodified, o.usermodified, o.usercreated)
                }
              );
            }
          );

          refreshFromCacheOrders(pdata);
        }
      }
    );

    // Order attachment requests

    primus.on
    (
      'listorderattachments',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_orderattachments = [];

          data.rs.forEach
          (
            function(a)
            {
              cache_orderattachments.push
              (
                {
                  id: doNiceId(a.id),
                  name: doNiceString(a.name),
                  description: doNiceString(a.description),
                  mimetype: '<a href="javascript:void(0);" onClick="doThrowOrderAttachment(' + a.id + ');">' + mapMimeTypeToImage(a.mimetype) + '</a>',
                  size: doNiceString(a.size),
                  isthumbnail: a.isthumbnail,
                  image: doNiceString(a.image),
                  date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
                  by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
                }
              );
            }
          );
          refreshFromCacheOrderAttachments(pdata);
        }
      }
    );

    primus.on
    (
      'saveorderattachment',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorderattachments', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'expireorderattachment',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorderattachments', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    // Order note requests

    primus.on
    (
      'listordernotes',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_ordernotes = [];

          data.rs.forEach
          (
            function(n)
            {
              cache_ordernotes.push
              (
                {
                  id: doNiceId(n.id),
                  notes: doNiceString(n.notes),
                  date: doNiceDateModifiedOrCreated(n.datemodified, n.datecreated),
                  by: doNiceModifiedBy(n.datemodified, n.usermodified, n.usercreated)
                }
              );
            }
          );
          refreshFromCacheOrderNotes(pdata);
        }
      }
    );

    primus.on
    (
      'newordernote',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listordernotes', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh', ordernoteid: data.ordernoteid}});
      }
    );

    primus.on
    (
      'saveordernote',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listordernotes', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh', ordernoteid: data.ordernoteid}});
      }
    );

    // Order status requests

    primus.on
    (
      'listorderstatuses',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          cache_orderstatuses = [];

          data.rs.forEach
          (
            function(s)
            {
              cache_orderstatuses.push
              (
                {
                  id: doNiceId(s.id),
                  status: s.status,
                  carriername: doNiceString(s.carriername),
                  connote: doNiceString(s.connote),
                  date: doNiceDateModifiedOrCreated(s.datemodified, s.datecreated),
                  by: doNiceModifiedBy(s.datemodified, s.usermodified, s.usercreated)
                }
              );
            }
          );
          refreshFromCacheOrderStatuses(pdata);
        }
      }
    );

    primus.on
    (
      'neworderstatus',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorderstatuses', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh', orderstatusid: data.orderstatusid}});
      }
    );

    // Order detail requests

    primus.on
    (
      'listorderdetails',
      function(data)
      {
        var pdata = data.pdata || '';

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
                  price: doNiceString(p.price),
                  qty: doNiceString(p.qty),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );
          //
          refreshFromCacheOrderDetails(pdata);
        }
      }
    );

    primus.on
    (
      'neworderdetail',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorderdetails', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, version: data.version, pdata: {type: 'refresh', orderdetailid: data.orderdetailid}});
      }
    );

    primus.on
    (
      'saveorderdetail',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorderdetails', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, version: data.version, pdata: {type: 'refresh', orderdetailid: data.orderdetailid}});
      }
    );

    primus.on
    (
      'expireorderdetail',
      function(data)
      {
        var pdata = data.pdata || '';

        primus.emit('listorderdetails', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, version: data.version, pdata: {type: 'refresh', orderdetailid: data.orderdetailid}});
      }
    );

    // Message requests

    primus.on
    (
      'emailhistory',
      function(data)
      {
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rs) && !_.isNull(data.rs))
        {
          doUpdateInitTasksProgress();
          cache_emails = [];

          data.rs.forEach
          (
            function(e)
            {
              cache_emails.push
              (
                {
                  id: doNiceId(e.id),
                  copyno: e.copyno,
                  orderno: doNiceString(e.orderno),
                  recipients: doNiceString(e.recipients),
                  subject: doNiceString(e.subject),
                  orderid: doNiceId(e.orderid),
                  datesent: doNiceDate(e.datesent),
                  datecreated: doNiceDate(e.datecreated),
                  by: doNiceTitleizeString(e.usercreated)
                }
              );
            }
          );
          //
          refreshFromCacheEmails(pdata);
        }
      }
    );

    // Reoprt requests

    primus.on
    (
      'report',
      function(data)
      {
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
        var pdata = data.pdata || '';

        if (!_.isUndefined(data.rc) && !_.isNull(data.rc) && !_.isUndefined(data.msg) && !_.isNull(data.msg))
        {
          switch (data.rc)
          {
            case errcode_nodata:
            {
              noty({text: 'No data or no matching data', type: 'information', timeout: 4000});
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
        // Someone created account, reload cache and display...
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'accountsaved',
      function(data)
      {
        // Someone changed account data, reload cache and display...
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'accountparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'accountexpired',
      function(data)
      {
        // Someone removed account data, reload cache and display...
        primus.emit('listaccounts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Journal events

    primus.on
    (
      'journalcreated',
      function(data)
      {
        // Someone created journal, reload cache and display...
        primus.emit('listjournals', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Product category events

    primus.on
    (
      'productcategorycreated',
      function(data)
      {
        // Someone created product category, reload cache and display...
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productcategorysaved',
      function(data)
      {
        // Someone changed product category data, reload cache and display...
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productcategoryparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productcategoryexpired',
      function(data)
      {
        // Someone removed product category data, reload cache and display...
        primus.emit('listproductcategories', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Superfund events

    primus.on
    (
      'superfundcreated',
      function(data)
      {
        // Someone created superfund, reload cache and display...
        primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'superfundsaved',
      function(data)
      {
        // Someone changed superfund data, reload cache and display...
        primus.emit('listsuperfunds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'superfundexpired',
      function(data)
      {
        // Someone removed superfund data, reload cache and display...
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
        // Someone created account, reload cache and display...
        primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'taxcodesaved',
      function(data)
      {
        // Someone changed account data, reload cache and display...
        primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'taxcodeexpired',
      function(data)
      {
        // Someone removed taxcode data, reload cache and display...
        primus.emit('listtaxcodes', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Location events

    primus.on
    (
      'locationcreated',
      function(data)
      {
        // Someone created location, reload cache and display...
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'locationsaved',
      function(data)
      {
        // Someone changed location data, reload cache and display...
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'locationparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'locationexpired',
      function(data)
      {
        // Someone removed location data, reload cache and display...
        primus.emit('listlocations', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Client events

    primus.on
    (
      'clientcreated',
      function(data)
      {
        // Someone created client, reload cache and display...
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientsaved',
      function(data)
      {
        // Someone changed client data, reload cache and display...
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientexpired',
      function(data)
      {
        // Someone removed client data, reload cache and display...
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Client note events

    primus.on
    (
      'clientnotecreated',
      function(data)
      {
        // Someone added client note, reload cache and display...
        primus.emit('listclientnotes', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientnotesaved',
      function(data)
      {
        // Someone changed client note, reload cache and display...
        primus.emit('listclientnotes', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    // Client attachment events

    primus.on
    (
      'clientattachmentcreated',
      function(data)
      {
        // Someone created client attachment, reload cache and display...
        primus.emit('listclientattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientattachmentsaved',
      function(data)
      {
        // Someone changed client attachment, reload cache and display...
        primus.emit('listclientattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'clientattachmentexpired',
      function(data)
      {
        // Someone removed client attachment, reload cache and display...
        primus.emit('listclientattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    // Supplier events

    primus.on
    (
      'suppliercreated',
      function(data)
      {
        // Someone created supplier, reload cache and display...
        primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'suppliersaved',
      function(data)
      {
        // Someone changed supplier data, reload cache and display...
        primus.emit('listclients', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'supplierparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'supplierexpired',
      function(data)
      {
        // Someone removed supplier data, reload cache and display...
        primus.emit('listsuppliers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Supplier note events

    primus.on
    (
      'suppliernotecreated',
      function(data)
      {
        // Someone added supplier note, reload cache and display...
        primus.emit('listsuppliernotes', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'suppliernotesaved',
      function(data)
      {
        // Someone changed supplier note, reload cache and display...
        primus.emit('listsuppliernotes', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    // Supplier attachment events

    primus.on
    (
      'supplierattachmentcreated',
      function(data)
      {
        // Someone created supplier attachment, reload cache and display...
        primus.emit('listsupplierattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'supplierattachmentsaved',
      function(data)
      {
        // Someone changed supplier attachment, reload cache and display...
        primus.emit('listsupplierattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'supplierattachmentexpired',
      function(data)
      {
        // Someone removed supplier attachment, reload cache and display...
        primus.emit('listsupplierattachments', {fguid: fguid, uuid: uuid, session: session, clientid: data.clientid, pdata: {type: 'refresh'}});
      }
    );

    // Employee events

    primus.on
    (
      'employeecreated',
      function(data)
      {
        // Someone created employee, reload cache and display...
        primus.emit('listemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'employeesaved',
      function(data)
      {
        // Someone changed employee data, reload cache and display...
        primus.emit('listemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'employeeexpired',
      function(data)
      {
        // Someone removed employee data, reload cache and display...
        primus.emit('listemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'employeeparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listemployees', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Product events

    primus.on
    (
      'productcreated',
      function(data)
      {
        // Someone created product, reload cache and display...
        if ($('#cbProductsCategories').combobox('getValue') == data.productcategoryid)
          primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh'}});

        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productsaved',
      function(data)
      {
        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productparentchanged',
      function(data)
      {
        // Is this a selected product category?
        if ($('#cbProductsCategories').combobox('getValue') == data.productcategoryid)
          primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh'}});

        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productexpired',
      function(data)
      {
        // Someone removed product data, reload cache and display...
        // Is this a selected product category?
        if ($('#cbProductsCategories').combobox('getValue') == data.productcategoryid)
          primus.emit('listproductsbycategory', {fguid: fguid, uuid: uuid, session: session, productcategoryid: data.productcategoryid, pdata: {type: 'refresh'}});

        primus.emit('listproducts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Product pricing events

    primus.on
    (
      'productpricingcreated',
      function(data)
      {
        // Someone created product price, reload cache and display...
        if (viewingProductId == data.productid)
          primus.emit('listproductpricing', {fguid: fguid, uuid: uuid, session: session, productid: data.productid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productpricingsaved',
      function(data)
      {
        // Someone created product price, reload cache and display...
        if (viewingProductId == data.productid)
          primus.emit('listproductpricing', {fguid: fguid, uuid: uuid, session: session, productid: data.productid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'productpricingexpired',
      function(data)
      {
        // Someone removed product pricing data, reload cache and display...
        primus.emit('listproductpricing', {fguid: fguid, uuid: uuid, session: session, productid: data.productid, pdata: {type: 'refresh'}});
      }
    );

    // Product template events

    primus.on
    (
      'producttemplatecreated',
      function(data)
      {
        // Someone created template, reload cache and display...
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplatesaved',
      function(data)
      {
        // Someone changed template data, reload cache and display...
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplateparentchanged',
      function(data)
      {
        // Someone changed parent from drag and drop, reload cache and display...
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplateexpired',
      function(data)
      {
        // Someone removed product template data, reload cache and display...
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplateduplicated',
      function(data)
      {
        // Someone duplicated product template same as creating new one...
        primus.emit('listproducttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplatebuilt',
      function(data)
      {
        // Whole bunch inventory changes probably happened, so just refresh inventory...
        primus.emit('liststock', {fguid: fguid, uuid: uuid, session: session, pdata: 'refresh-all'});
      }
    );

    // Product template detail events

    primus.on
    (
      'producttemplatedetailcreated',
      function(data)
      {
        primus.emit('listproductsbytemplate', {fguid: fguid, uuid: uuid, session: session, producttemplateid: data.producttemplateid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplatedetailsaved',
      function(data)
      {
        primus.emit('listproductsbytemplate', {fguid: fguid, uuid: uuid, session: session, producttemplateid: data.producttemplateid, pdata:  {type: 'refresh'}});
      }
    );

    primus.on
    (
      'producttemplatedetailexpired',
      function(data)
      {
        // Someone removed product template detail data, reload cache and display...
        primus.emit('listproductsbytemplate', {fguid: fguid, uuid: uuid, session: session, producttemplateid: data.producttemplateid, pdata: {type: 'refresh'}});
      }
    );

    // Invoice events

    primus.on
    (
      'invoicecreated',
      function(data)
      {
        if (!_.isUndefined(data.orderid) && !_.isNull(data.orderid))
        {
          // Need to remove order from orders grid as it's now an invoice...
          primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
          primus.emit('listinvoices', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        }
      }
    );

    // Order events

    primus.on
    (
      'ordercreated',
      function(data)
      {
        // Someone created order, reload cache and display...
        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'ordersaved',
      function(data)
      {
        // Someone changed order data, reload cache and display...
        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'orderexpired',
      function(data)
      {
        // Someone removed order data, reload cache and display...
        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'orderduplicated',
      function(data)
      {
        // Someone duplicated order data, reload cache and display...
        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'ordernewversion',
      function(data)
      {
        // Someone created order version, reload cache and display...
        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'orderinvoicetosaved',
      function(data)
      {
      }
    );

    // Order status events

    primus.on
    (
      'orderstatuscreated',
      function(data)
      {
        // Someone created order status, reload cache and display...
        primus.emit('listorderstatuses', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
        primus.emit('listorders', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Alert events
    primus.on
    (
      'orderstatusalert',
      function(data)
      {
        if (!_.isUndefined(data.orderid) && !_.isNull(data.orderid))
          doStatusAlert(data);
      }
    );

    // Order note events

    primus.on
    (
      'ordernotecreated',
      function(data)
      {
        // Someone added order note, reload cache and display...
        primus.emit('listordernotes', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'ordernotesaved',
      function(data)
      {
        // Someone changed order note, reload cache and display...
        primus.emit('listordernotes', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    // Order attachment events

    primus.on
    (
      'orderattachmentcreated',
      function(data)
      {
        // Someone added order attachment, reload cache and display...
        primus.emit('listorderattachments', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'orderattachmentsaved',
      function(data)
      {
        // Someone changed order attachment, reload cache and display...
        primus.emit('listorderattachments', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'orderattachmentexpired',
      function(data)
      {
        // Someone removed order attachment, reload cache and display...
        primus.emit('listorderattachments', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, pdata: {type: 'refresh'}});
      }
    );

    // Order detail events

    primus.on
    (
      'orderdetailcreated',
      function(data)
      {
        // Someone created order detail, reload cache and display...
        primus.emit('listorderdetails', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, version: data.version, pdata: {type: 'refresh', orderdetailid: data.orderdetailid, orderid: data.orderid, version: data.version}});
      }
    );

    primus.on
    (
      'orderdetailsaved',
      function(data)
      {
        // Someone changed order detail, reload cache and display...
        primus.emit('listorderdetails', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, version: data.version, pdata: {type: 'refresh', orderdetailid: data.orderdetailid, orderid: data.orderid, version: data.version}});
      }
    );

    primus.on
    (
      'orderdetailexpired',
      function(data)
      {
        // Someone removed order detail, reload cache and display...
        primus.emit('listorderdetails', {fguid: fguid, uuid: uuid, session: session, orderid: data.orderid, version: data.version, pdata: {type: 'refresh'}});
      }
    );

    // Inventory events

    primus.on
    (
      'inventoryadded',
      function(data)
      {
        // Someone creates inventory, reload cache and display...
        primus.emit('liststock', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'inventorybuilt',
      function(data)
      {
        // Someone built product and added to inventory, reload cache and display...
        primus.emit('liststock', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'buildexpired',
      function(data)
      {
        // Someone reversed a build, reload cache and display...
        primus.emit('listbuilds', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        primus.emit('liststock', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Status alert events

    primus.on
    (
      'statusalertcreated',
      function(data)
      {
        // Someone created status alert, reload cache and display...
        primus.emit('liststatusalerts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'statusalertsaved',
      function(data)
      {
        // Someone changed status alert, reload cache and display...
        primus.emit('liststatusalerts', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Data events

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

    // Printing events

    primus.on
    (
      'emailsent',
      function(data)
      {
        // Refresh...
        primus.emit('emailhistory', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // User events

    primus.on
    (
      'usercreated',
      function(data)
      {
        if (!_.isUndefined(data.uuid) && !_.isNull(data.uuid))
        {
          // Refresh...
          primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        }
      }
    );

    primus.on
    (
      'usersaved',
      function(data)
      {
        if (!_.isUndefined(data.uuid) && !_.isNull(data.uuid))
        {
          // Refresh...
          primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        }
      }
    );

    primus.on
    (
      'userpermissionssaved',
      function(data)
      {
        if (!_.isUndefined(data.uuid) && !_.isNull(data.uuid))
        {
          // Refresh...
          primus.emit('listusers', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
        }
      }
    );

    // Config events

    primus.on
    (
      'configsaved',
      function(data)
      {
        primus.emit('loadconfig', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'printtemplatecreated',
      function(data)
      {
        // Someone created print template, reload cache and display...
        primus.emit('listprinttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'printtemplatesaved',
      function(data)
      {
        // Someone changed print template, reload cache and display...
        primus.emit('listprinttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    primus.on
    (
      'printtemplateexpired',
      function(data)
      {
        // Someone removed print template, reload cache and display...
        primus.emit('listprinttemplates', {fguid: fguid, uuid: uuid, session: session, pdata: {type: 'refresh'}});
      }
    );

    // Message events

    primus.on
    (
      'newchatmsg',
      function(data)
      {
        doAddNewChatMsg(data);
      }
    );

    // MDM events

    primus.on
    (
      'useronline',
      function(data)
      {
        //userOnline(data.uuid);
      }
    );

    primus.on
    (
      'useroffline',
      function(data)
      {
        //userOffline(data.uuid);
      }
    );

    primus.on
    (
      'userlogout',
      function(data)
      {
        //userLogout(data.uuid);
      }
    );
  }
  catch (err)
  {
    console.log('****************** Primus exception: ' + err);
  }
}
