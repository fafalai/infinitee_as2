function doDlgTemplateBuild(template)
{
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
            id: doNiceId(p.productid),
            code: doNiceString(p.productcode),
            name: doNiceString(p.productname),
            qty: doNiceString(p.qty),
            pertemplateqty: p.pertemplateqty
          }
        );
      }
    );

    $('#divBuildProductsG').datagrid('loadData', data);
  }

  function doSaved(ev, args)
  {
    doServerDataMessage('listproductsforbuild', {buildtemplateid: template.id}, {type: 'refresh'});
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('listproductsforbuild', doLoad);
  $('#divEvents').on('expirebuild', doSaved);
  $('#divEvents').on('buildexpired', doSaved);

  $('#dlgBuildTemplate').dialog
  (
    {
      title:'Building Template ' + template.name,
      onClose: function()
      {
        $('#divBuildProductsG').datagrid('loadData', []);

        $('#divEvents').off('listproductsforbuild', doLoad);
        $('#divEvents').off('expirebuild', doSaved);
        $('#divEvents').off('buildexpired', doSaved);
      },
      onOpen: function()
      {
        $('#fldBuildQty').numberbox('setValue', template.qty);

        $('#cbBuildProducts').combobox
        (
          {
            valueField: 'id',
            textField: 'code',
            groupField: 'productcategoryname',
            data: cache_products
          }
        );

        $('#divBuildProductsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            striped: true,
            columns:
            [
              [
                {title: 'Code',       field: 'code',           width: 200, align: 'left',   resizable: true},
                {title: 'Name',       field: 'name',           width: 200, align: 'left',   resizable: true},
                {title: 'Qty',        field: 'qty',            width: 100, align: 'right',  resizable: true, formatter: function(value, row, index) {return _.niceformatnumber(value);}},
                {title: 'Whole/Tmpl', field: 'pertemplateqty', width: 100, align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}}
              ]
            ]
          }
        );

        doServerDataMessage('listproductsforbuild', {buildtemplateid: template.id}, {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Build',
          handler: function()
          {
            var productid = $('#cbBuildProducts').combobox('getValue');
            var qty = $('#fldBuildQty').numberbox('getValue');

            if (_.isBlank(productid))
            {
              doMandatoryTextbox('Please select a target product to build', 'cbBuildProducts');
              return;
            }

            if (_.isBlank(qty) || (qty <= 0))
            {
              doMandatoryTextbox('Quantity must be greater than 0', 'fldBuildQty');
              return;
            }

            if (data.length <= 0)
            {
              doShowError('No component products');
              return;
            }

            doServerDataMessage('buildinventory', {buildtemplateid: template.id, productid: productid, qty: qty}, {type: 'refresh'});
            $('#dlgBuildTemplate').dialog('close');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgBuildTemplate').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
