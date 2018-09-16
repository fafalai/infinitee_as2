function doDlgTemplateDetails(template)
{
  var editingIndex = null;
  var tb =
  [
    {
      text: 'New',
      iconCls: 'icon-add',
      handler: doNew
    },
    {
      text: 'Clear',
      iconCls: 'icon-clear',
      handler: doClear
    },
    {
      text: 'Edit',
      iconCls: 'icon-edit',
      handler: doEdit
    },
    {
      text: 'Cancel',
      iconCls: 'icon-cancel',
      handler: doCancel
    },
    {
      text: 'Save',
      iconCls: 'icon-save',
      handler: doSave
    },
    {
      text: 'Remove',
      iconCls: 'icon-remove',
      handler: doRemove
    },
    {
      text: 'Sync Subtemplates',
      iconCls: 'icon-sync',
      handler: doSync
    }
  ];

  function doNew()
  {
    doDlgProductSelect
    (
      template.clientid,
      false,
      true,
      function(productid, productname, qty, price)
      {
        doServerDataMessage('newproducttemplatedetail', {producttemplateid: template.id, productid: productid, qty: qty, price: price}, {type: 'refresh'});
      }
    );
  }

  function doClear()
  {
    $('#divTemplateProductsG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridStartEdit
    (
      'divTemplateProductsG',
      editingIndex,
      function(row, index)
      {
        editingIndex = index;

        doGridGetEditor
        (
          'divTemplateProductsG',
          editingIndex,
          'name',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divTemplateProductsG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divTemplateProductsG',
      editingIndex,
      function(row)
      {
        var qty = row.qty;

        if (row.pertemplateqty == 1)
        {
          qty = _.toBigNum(qty).ceil().toFixed(0);

          $('#divTemplateProductsG').datagrid('updateRow', {index: editingIndex, row: {qty: qty}});
        }

        doServerDataMessage('saveproducttemplatedetail', {producttemplatedetailid: row.id, productid: row.productid, taxcodeid: row.taxcodeid, price: row.price, qty: qty, pertemplateqty: row.pertemplateqty}, {type: 'refresh'});
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divTemplateProductsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + doGetStringFromIdInObjArray(cache_products, row.productid) + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expireproducttemplatedetail', {producttemplatedetailid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a product to remove');
    }
  }

  function doSync()
  {
    doPromptOkCancel
    (
      'This will replace all products of all sub-templates with the products from this template. Are you sure?',
      function(result)
      {
        if (result)
          doServerDataMessage('syncproducttemplate', {producttemplateid: template.id,}, {type: 'refresh'});
      }
    );
  }

  function doViewProduct()
  {
    doGridGetSelectedRowData
    (
      'divTemplateProductsG',
      function(row)
      {
        doSelectInventoryTab(0);
        $('#divEvents').trigger('gotoproduct', {productcategoryid: row.productcategoryid, productid: row.productid});
        $('#dlgTemplateDetails').dialog('close');
      }
    );
  }

  function doLoad(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(p)
      {
        data.push
        (
          {
            id: doNiceId(p.id),
            productid: doNiceId(p.productid),
            productcategoryid: doNiceId(p.productcategoryid),
            taxcodeid: doNiceId(p.taxcodeid),
            price: doNiceString(p.price),
            gst: doNiceString(p.gst),
            qty: doNiceString(p.qty),
            pertemplateqty: p.pertemplateqty,
            date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
            by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
          }
        );
      }
    );

    $('#divTemplateProductsG').datagrid('loadData', data);

    doGridCalcTotals('divTemplateProductsG', 'price', 'qty');

    if (!_.isUndefined(args.pdata.producttemplatedetailid) && !_.isNull(args.pdata.producttemplatedetailid))
      $('#divTemplateProductsG').datagrid('selectRecord', args.pdata.producttemplatedetailid);
  }

  function doSaved(ev, args)
  {
    if (args.data.producttemplateid == template.id)
      doServerDataMessage('listproductsbytemplate', {producttemplateid: template.id}, {type: 'refresh', producttemplatedetailid: args.data.producttemplatedetailid});
  }

  function doEventsHandler(ev, args)
  {
    if (args == 'new')
      doNew();
    else if (args == 'edit')
      doEdit();
    else if (args == 'remove')
      doRemove();
    else if (args == 'viewproduct')
      doViewProduct();
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('listproductsbytemplate', doLoad);
  $('#divEvents').on('newproducttemplatedetail', doSaved);
  $('#divEvents').on('saveproducttemplatedetail', doSaved);
  $('#divEvents').on('expireproducttemplatedetail', doSaved);
  $('#divEvents').on('producttemplatedetailcreated', doSaved);
  $('#divEvents').on('producttemplatedetailsaved', doSaved);
  $('#divEvents').on('producttemplatedetailexpired', doSaved);
  $('#divEvents').on('productupdated', doSaved);
  $('#divEvents').on('templatedetailspopup', doEventsHandler);

  $('#dlgTemplateDetails').dialog
  (
    {
      title: 'Template ' + template.name,
      onClose: function()
      {
        $('#divEvents').off('listproductsbytemplate', doLoad);
        $('#divEvents').off('newproducttemplatedetail', doSaved);
        $('#divEvents').off('saveproducttemplatedetail', doSaved);
        $('#divEvents').off('expireproducttemplatedetail', doSaved);
        $('#divEvents').off('producttemplatedetailcreated', doSaved);
        $('#divEvents').off('producttemplatedetailsaved', doSaved);
        $('#divEvents').off('producttemplatedetailexpired', doSaved);
        $('#divEvents').off('productupdated', doSaved);
        $('#divEvents').off('templatedetailspopup', doEventsHandler);
      },
      onOpen: function()
      {
        $('#divTemplateProductsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            toolbar: tb,
            showFooter: true,
            columns:
            [
              [
                {
                  title: 'Product',
                  field: 'productid',
                  width: 200,
                  align: 'left',
                  resizable: true,
                  editor:
                  {
                    type: 'combobox',
                    options:
                    {
                      valueField: 'id',
                      textField: 'code',
                      groupField: 'productcategoryname',
                      data: cache_products,
                      onSelect: function(record)
                      {
                        doGridChangeCellLabelValue('divTemplateProductsG', editingIndex, 'price', record.costprice);
                      }
                    }
                  },
                  formatter: function(value, row)
                  {
                    return doGetCodeFromIdInObjArray(cache_products, value);
                  }
                },
                {
                  title: 'Tax Code',
                  field: 'taxcodeid',
                  width: 200,
                  align: 'left',
                  resizable: true,
                  editor:
                  {
                    type: 'combobox',
                    options:
                    {
                      valueField: 'id',
                      textField: 'name',
                      data: cache_taxcodes,
                      onSelect: function(record)
                      {
                      }
                    }
                  },
                  formatter: function(value, row)
                  {
                    return doGetStringFromIdInObjArray(cache_taxcodes, value);
                  }
                },
                {title: 'Price',      field: 'price',          width: 100, align: 'right',  resizable: true, editor: 'label', formatter: function(value, row, index) {if (_.isUndefined(row.id)) return value; return _.niceformatnumber(value);}},
                {title: 'Qty',        field: 'qty',            width: 100, align: 'right',  resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 4}}, formatter: function(value, row, index) {if (_.isUndefined(row.id)) return value; return _.niceformatqty(value);}},
                {title: 'Whole/Tmpl', field: 'pertemplateqty', width: 100, align: 'center', resizable: true, editor: {type: 'checkbox', options: {on: 1, off: 0}}, formatter: function(value, row) {return mapBoolToImage(value);}},
                {title: 'Modified',   field: 'date',           width: 150, align: 'right',  resizable: true},
                {title: 'By',         field: 'by',             width: 200, align: 'left',   resizable: true}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divTemplateProductsG', 'divTemplatesDetailsMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divTemplateProductsG',
                editingIndex,
                function(row, index)
                {
                  editingIndex = index;

                  if (['qty'].indexOf(field) != -1)
                    field = 'qty';

                  doGridGetEditor
                  (
                    'divTemplateProductsG',
                    editingIndex,
                    field,
                    function(ed)
                    {
                    }
                  );
                }
              );
            }
          }
        );

        doServerDataMessage('listproductsbytemplate', {producttemplateid: template.id}, {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgTemplateDetails').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
