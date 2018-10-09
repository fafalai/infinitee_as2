let permissiontemplatesTabWidgetsLoaded = false;

function doPermissionTemplatesTabWidgets() {
    if (permissiontemplatesTabWidgetsLoaded)
        return;

    permissiontemplatesTabWidgetsLoaded = true;

    // doServerMessage('listpermissiontemplates', {type: 'refresh'});

    $('#divEvents').on('listpermissiontemplates', (ev, args) => {
        $('#divPermissionTemplates').datagrid('reload', cache_permissiontemplates);
    });

    $('#divEvents').on('newpermissiontemplates', doSaved);
    $('#divEvents').on('permissiontemplatessaved', doSaved);
    $('#divEvents').on('savepermissiontemplates', doSaved);
    $('#divEvents').on('removepermissiontemplatebyid', doSaved);
    

    $('#divEvents').on('permissiontemplatespopup',
        function (ev, args) {
            if (args == 'new')
                doNew();
            else if (args == 'clear')
                doClear();
            else if (args == 'edit')
                doEdit();
            else if (args == 'cancel')
                doCancel();
            else if (args == 'save')
                doSave();
            else if (args == 'remove')
                doRemove();
        }
    );

    function doNew() {
        let row = {
                name: '',
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
        doDlgPermissionTemplates(row);
    }

    function doClear() {}

    function doEdit() {
        if (!doGridGetSelectedRowData(
                'divPermissionTemplates',
                function (row) {
                    doDlgPermissionTemplates(row);
                }
            )) {
            doShowError('Please select a user to view/edit permissions');
        }
    }

    function doCancel() {}

    function doSave() {}

    function doRemove() {
        if (!doGridGetSelectedRowData(
                'divPermissionTemplates',
                function (row) {
                    doPromptOkCancel(
                            'Remove ' + row.name + '?',
                            function (result) {
                                if (result)
                                    doServerDataMessage('removepermissiontemplatebyid', {permissiontemplate_id: row.id}, {type: 'refresh'});
                            });
                }
            )) {
            doShowError('Please select a template to delete');
        }
    }

    function doSaved(ev, args)
    {
      doServerMessage('listpermissiontemplates', {type: 'refresh'});
    }

    $('#divPermissionTemplates').datagrid({
        idField: 'id',
        treeField: 'name',
        lines: true,
        collapsible: true,
        fitColumns: false,
        autoRowHeight: false,
        rownumbers: true,
        striped: true,
        singleSelect: true,
        toolbar: '#tbPermissionTemplates',
        showFooter: true,
        sortName: 'name',
        sortOrder: 'asc',
        loader: function (param, success, error) {
            success({
                total: cache_permissiontemplates.length,
                rows: cache_permissiontemplates,
                footer: [{name: '<span class="totals_footer">' + cache_permissiontemplates.length + ' Templates</span>'}]
            });
        },
        frozenColumns: [
            [{
                    title: 'Name',
                    field: 'name',
                    width: 150,
                    align: 'right',
                    resizable: true,
                    sortable: true
                },
                {
                    title: 'Modified',
                    field: 'date',
                    width: 200,
                    align: 'right',
                    resizable: true,
                    sortable: true
                },
                {
                    title: 'By',
                    field: 'by',
                    width: 100,
                    align: 'left',
                    resizable: true,
                    sortable: true
                },
            ]
        ],
        columns: [
            [
                {field:'canvieworders',title:'canvieworders',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreateorders',title:'cancreateorders',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewinvoices',title:'canviewinvoices',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreateinvoices',title:'cancreateinvoices',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewinventory',title:'canviewinventory',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreateinventory',title:'cancreateinventory',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewpayroll',title:'canviewpayroll',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatepayroll',title:'cancreatepayroll',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewproducts',title:'canviewproducts',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreateproducts',title:'cancreateproducts',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewclients',title:'canviewclients',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreateclients',title:'cancreateclients',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewcodes',title:'canviewcodes',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatecodes',title:'cancreatecodes',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewusers',title:'canviewusers',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreateusers',title:'cancreateusers',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewbuilds',title:'canviewbuilds',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatebuilds',title:'cancreatebuilds',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewtemplates',title:'canviewtemplates',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatetemplates',title:'cancreatetemplates',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewbanking',title:'canviewbanking',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatebanking',title:'cancreatebanking',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewpurchasing',title:'canviewpurchasing',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatepurchasing',title:'cancreatepurchasing',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewalerts',title:'canviewalerts',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatealerts',title:'cancreatealerts',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'canviewdashboard',title:'canviewdashboard',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}},
                {field:'cancreatedashboard',title:'cancreatedashboard',width:100, formatter: function(value, row, index){return mapBoolToImage(value);}}
            ]
        ],
        onLoadSuccess: function (row) {},
        onDblClickRow: function (index,row) {
            doDlgPermissionTemplates(row);
        }
    })

}