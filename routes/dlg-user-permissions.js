function doDlgUserPermissions(user)
{
  var tb =
  [
    {
      text: 'Save',
      iconCls: 'icon-save',
      handler: doSave
    }
  ];

  function doSave()
  {
    var rows = $('#divPermissionsPG').propertygrid('getRows');
    var permissions =
    {
      canvieworders: rows[0].value,
      cancreateorders: rows[1].value,
      canviewinvoices: rows[2].value,
      cancreateinvoices: rows[3].value,
      canviewinventory: rows[4].value,
      cancreateinventory: rows[5].value,
      canviewpayroll: rows[6].value,
      cancreatepayroll: rows[7].value,
      canviewproducts: rows[8].value,
      cancreateproducts: rows[9].value,
      canviewclients: rows[10].value,
      cancreateclients: rows[11].value,
      canviewcodes: rows[12].value,
      cancreatecodes: rows[13].value,
      canviewusers: rows[14].value,
      cancreateusers: rows[15].value,
      canviewbuilds: rows[16].value,
      cancreatebuilds: rows[17].value,
      canviewtemplates: rows[18].value,
      cancreatetemplates: rows[19].value,
      canviewbanking: rows[20].value,
      cancreatebanking: rows[21].value,
      canviewpurchasing: rows[22].value,
      cancreatepurchasing: rows[23].value,
      canviewalerts: rows[24].value,
      cancreatealerts: rows[25].value,
      canviewdashboard: rows[26].value,
      cancreatedashboard: rows[27].value
    };

    doServerDataMessage('saveuserpermissions', {useruuid: user.uuid, permissions: permissions}, {type: 'refresh'});
  }

  function doMakeRowProperty(name, value, group)
  {
    var row =
    {
      name: name,
      value: value,
      group: group,
      editor:
      {
        type: 'checkbox',
        options:
        {
          on: 1,
          off: 0
        }
      }
    };

    return row;
  }

  function doSaved(ev, args)
  {
    $('#dlgUserPermissions').dialog('close');
  }

  $('#divEvents').on('saveuserpermissions', doSaved);

  $('#dlgUserPermissions').dialog
  (
    {
      title: 'Permissions for ' + user.name,
      onClose: function()
      {
        $('#divEvents').off('saveuserpermissions', doSaved);
      },
      onOpen: function()
      {
        $('#divPermissionsPG').propertygrid
        (
          {
            showGroup: true,
            scrollbarSize: 0,
            toolbar: tb,
            loader: function(param, success, error)
            {
              cache_userpermissions = [];

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canvieworders, 'Orders'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreateorders, 'Orders'));
              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewinvoices, 'Invoices'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreateinvoices, 'Invoices'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewinventory, 'Inventory'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreateinventory, 'Inventory'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewpayroll, 'Payroll'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatepayroll, 'Payroll'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewproducts, 'Products'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreateproducts, 'Products'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewclients, 'Clients'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreateclients, 'Clients'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewcodes, 'Codes'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatecodes, 'Codes'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewusers, 'Users'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreateusers, 'Users'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewbuilds, 'Builds'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatebuilds, 'Builds'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewtemplates, 'Templates'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatetemplates, 'Templates'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewbanking, 'Banking'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatebanking, 'Banking'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewpurchasing, 'Purchasing'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatepurchasing, 'Purchasing'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewalerts, 'Alerts'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatealerts, 'Alerts'));

              cache_userpermissions.push(doMakeRowProperty('Can View', user.canviewdashboard, 'Dashboard'));
              cache_userpermissions.push(doMakeRowProperty('Can Create', user.cancreatedashboard, 'Dashboard'));

              success({total: cache_userpermissions.length, rows: cache_userpermissions});
            },
            columns:
            [
              [
                {field: 'name', title: 'Action', width: 100},
                {
                  field: 'value',
                  title: 'Permission',
                  width: 80,
                  formatter: function(value, row, index)
                  {
                    return mapBoolToImage(value);
                  }
                }
              ]
            ]
          }
        );
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgUserPermissions').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
