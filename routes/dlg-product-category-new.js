function doDlgProductCategoryNew(parentid, productcategoryid)
{
  var isnew = _.isUndefined(productcategoryid) || _.isNull(productcategoryid);
  var productcategory = {};

  function doReset()
  {
    $('#cbNewProductCategoryParent').combotree('setValue', parentid);

    if (isnew)
    {
      $('#fldNewProductCategoryName').textbox('clear');
      $('#fldNewProductCategoryCode').textbox('clear');

      $('#btnProductCategoryNewAdd').linkbutton('disable');
    }
    else
    {
      if (!_.isEmpty(productcategory))
      {
        $('#fldNewProductCategoryName').textbox('setValue', productcategory.name);
        $('#fldNewProductCategoryCode').textbox('setValue', productcategory.code);

        $('#btnProductCategoryNewAdd').linkbutton('enable');
        $('#dlgProductCategoryNew').dialog('setTitle', 'Modify ' + productcategory.name);
      }
    }

    doTextboxFocus('fldNewProductCategoryName');
  }

  function doCheckCode(ev, args)
  {
    // Code already exists?
    if (args.data.rs.length > 0)
      $('#btnProductCategoryNewAdd').linkbutton('disable');
    else
      $('#btnProductCategoryNewAdd').linkbutton('enable');
  }

  function doSaved(ev, args)
  {
    $('#dlgProductCategoryNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    productcategory = (args.data.productcategory);
    doReset();
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('checkproductcategorycode', doCheckCode);
  $('#divEvents').on('newproductcategory', doSaved);
  $('#divEvents').on('saveproductcategory', doSaved);
  $('#divEvents').on('loadproductcategory', doLoad);

  $('#dlgProductCategoryNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checkproductcategorycode', doCheckCode);
        $('#divEvents').off('newproductcategory', doSaved);
        $('#divEvents').off('saveproductcategory', doSaved);
        $('#divEvents').off('loadproductcategory', doLoad);
      },
      onOpen: function()
      {
        $('#cbNewProductCategoryParent').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_productcategories
          }
        );

        $('#fldNewProductCategoryCode').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checkproductcategorycode', {productcategoryid: productcategoryid, code: newValue}, {type: 'refresh'});
              }
              else
                $('#btnProductCategoryNewAdd').linkbutton('disable');
            }
          }
        );

        if (isnew)
          $('#btnProductCategoryNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnProductCategoryNewAdd').linkbutton({text: 'Save'});

        if (!_.isUndefined(productcategoryid) && !_.isNull(productcategoryid))
          doServerDataMessage('loadproductcategory', {productcategoryid: productcategoryid}, {type: 'refresh'});
        else
          doReset();

      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnProductCategoryNewAdd',
          handler: function()
          {
            var parentid = doGetComboTreeSelectedId('cbNewProductCategoryParent');
            var name = $('#fldNewProductCategoryName').textbox('getValue');
            var code = $('#fldNewProductCategoryCode').textbox('getValue');

            if (!_.isBlank(name))
            {
              if (!_.isBlank(code))
              {
                if (isnew)
                  doServerDataMessage('newproductcategory', {parentid: parentid, name: name, code: code}, {type: 'refresh'});
                else
                  doServerDataMessage('saveproductcategory', {productcategoryid: productcategoryid, name: name, code: code}, {type: 'refresh'});
              }
              else
                doMandatoryTextbox('Please enter a unique category code', 'fldNewProductCategoryCode');
            }
            else
              doMandatoryTextbox('Please enter an category name', 'fldNewProductCategoryName');
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
            $('#dlgProductCategoryNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
