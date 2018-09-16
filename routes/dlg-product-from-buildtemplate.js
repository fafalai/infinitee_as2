function doDlgProductFromBuildTemplate(buildtemplateid, buildtemplate_code, buildtemplate_name, clientid)
{
  function doReset()
  {
    $('#cbProductCategoryFromBuildTemplate').combotree('clear');
    $('#fldNewProductCodeFromBuildTemplate').textbox('clear');
    $('#fldNewProductNameFromBuildTemplate').textbox('clear');
  }

  function doProductCategory(ev, args)
  {
    if (!_.isNull(args.data.productcategoryid))
      $('#cbProductCategoryFromBuildTemplate').combotree('setValue', args.data.productcategoryid);

    $('#fldNewProductCodeFromBuildTemplate').textbox('setValue', buildtemplate_code + '-');
    $('#fldNewProductNameFromBuildTemplate').textbox('setValue', buildtemplate_name);
  }

  function doSaved(ev, args)
  {
    $('#dlgNewProductFromBuildTemplate').dialog('close');
  }

  $('#divEvents').on('tpccproductcategoryfrombuildtemplate', doProductCategory);
  $('#divEvents').on('tpcccreateproductfrombuildtemplate', doSaved);

  $('#dlgNewProductFromBuildTemplate').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('tpccproductcategoryfrombuildtemplate', doProductCategory);
        $('#divEvents').off('tpcccreateproductfrombuildtemplate', doSaved);
      },
      onOpen: function()
      {
        $('#cbProductCategoryFromBuildTemplate').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_productcategories,
            limitToList: true
          }
        );

        doTextboxFocus('fldNewProductCodeFromBuildTemplate');
        doServerDataMessage('tpccproductcategoryfrombuildtemplate', {buildtemplateid: buildtemplateid}, {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Add',
          handler: function()
          {
            var categoryid = $('#cbProductCategoryFromBuildTemplate').combotree('getValue');
            var code = $('#fldNewProductCodeFromBuildTemplate').textbox('getValue');
            var name = $('#fldNewProductNameFromBuildTemplate').textbox('getValue');

            if (!_.isBlank(categoryid))
            {
              if (!_.isBlank(code))
              {
                if (!_.isBlank(name))
                {
                  doServerDataMessage('tpcccreateproductfrombuildtemplate', {productcategoryid: categoryid, clientid: clientid, code: code, name: name, buildtemplateid: buildtemplateid}, {type: 'refresh'});
                }
              }
            }
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            doReset();
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgNewProductFromBuildTemplate').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
