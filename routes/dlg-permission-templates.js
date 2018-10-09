function doDlgPermissionTemplates(row) {

    $('#divEvents').on('newpermissiontemplates', doSaved);
    $('#divEvents').on('permissiontemplatessaved', doSaved);
    $('#divEvents').on('savepermissiontemplates', doSaved);

    function doSave() {
        let rows = $('#divPermissionsPG').propertygrid('getRows');
        let name = rows[0].value;
        let permissions = {
            canvieworders: rows[1].value,
            cancreateorders: rows[2].value,
            canviewinvoices: rows[3].value,
            cancreateinvoices: rows[4].value,
            canviewinventory: rows[5].value,
            cancreateinventory: rows[6].value,
            canviewpayroll: rows[7].value,
            cancreatepayroll: rows[8].value,
            canviewproducts: rows[9].value,
            cancreateproducts: rows[10].value,
            canviewclients: rows[11].value,
            cancreateclients: rows[12].value,
            canviewcodes: rows[13].value,
            cancreatecodes: rows[14].value,
            canviewusers: rows[15].value,
            cancreateusers: rows[16].value,
            canviewbuilds: rows[17].value,
            cancreatebuilds: rows[18].value,
            canviewtemplates: rows[19].value,
            cancreatetemplates: rows[20].value,
            canviewbanking: rows[21].value,
            cancreatebanking: rows[22].value,
            canviewpurchasing: rows[23].value,
            cancreatepurchasing: rows[24].value,
            canviewalerts: rows[25].value,
            cancreatealerts: rows[26].value,
            canviewdashboard: rows[27].value,
            cancreatedashboard: rows[28].value
        };

        if(row.name !== '')
            doServerDataMessage('savepermissiontemplates', {permissiontemplate_id: row.id, name: name, permissions: permissions}, {type: 'refresh'});
        else
            doServerDataMessage('newpermissiontemplates', {name: name, permissions: permissions}, {type: 'refresh'});
    }

    function doMakeRowProperty(name, value, group) {
        var row = {
            name: name,
            value: value,
            group: group,
            editor: {
                type: 'checkbox',
                options: {
                    on: 1,
                    off: 0
                }
            }
        };

        return row;
    }

    function doSaved(ev, args) {
        $('#dlgUserPermissions').dialog('close');
    }

    //   $('#divEvents').on('saveuserpermissions', doSaved);

    $('#dlgUserPermissions').dialog({
        //   title: 'Permissions for ' + user.name,
        onClose: function () {
            // $('#divEvents').off('saveuserpermissions', doSaved);
            $('#divEvents').off('newpermissiontemplates', doSaved);
            $('#divEvents').off('permissiontemplatessaved', doSaved);
            $('#divEvents').off('savepermissiontemplates', doSaved);
        },
        onOpen: function () {
            $('#divPermissionsPG').propertygrid({
                showGroup: true,
                scrollbarSize: 0,
                // toolbar: tb,
                loader: function (param, success, error) {
                    cache_permissions = [];

                    cache_permissions.push( {name:'Name', value: row.name, group: 'Name', editor: 'textbox'})
                    cache_permissions.push(doMakeRowProperty('Can View', row.canvieworders, 'Orders'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreateorders, 'Orders'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewinvoices, 'Invoices'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreateinvoices, 'Invoices'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewinventory, 'Inventory'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreateinventory, 'Inventory'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewpayroll, 'Payroll'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatepayroll, 'Payroll'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewproducts, 'Products'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreateproducts, 'Products'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewclients, 'Clients'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreateclients, 'Clients'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewcodes, 'Codes'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatecodes, 'Codes'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewusers, 'Users'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreateusers, 'Users'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewbuilds, 'Builds'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatebuilds, 'Builds'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewtemplates, 'Templates'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatetemplates, 'Templates'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewbanking, 'Banking'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatebanking, 'Banking'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewpurchasing, 'Purchasing'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatepurchasing, 'Purchasing'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewalerts, 'Alerts'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatealerts, 'Alerts'));
                    cache_permissions.push(doMakeRowProperty('Can View', row.canviewdashboard, 'Dashboard'));
                    cache_permissions.push(doMakeRowProperty('Can Create', row.cancreatedashboard, 'Dashboard'));

                    success({
                        total: cache_permissions.length,
                        rows: cache_permissions
                    });
                },
                columns: [
                    [{
                            field: 'name',
                            title: 'Name',
                            width: 80
                        },
                        {
                            field: 'value',
                            title: 'Value',
                            width: 100,
                            formatter: function (value, row, index) {
                                if (row.editor.type == 'checkbox')
                                    return mapBoolToImage(value);
                                else {
                                    return value;
                                }
                            }
                        }
                    ]
                ]
            });
        },
        buttons: [
            {
                text: 'Create',
                id: 'btnCreatePermissionTemplates',
                handler: doSave
            },
            {
                text: 'Close',
                handler: function () {
                    $('#dlgUserPermissions').dialog('close');
                }
            }
        ]
    }).dialog('center').dialog('open');

    if (row.name !== '')
        $('#btnCreatePermissionTemplates').linkbutton({text: 'Save'});
    else
        $('#btnCreatePermissionTemplates').linkbutton({text: 'Create'});

}
