function doDlgProductChangeCategory(product)
{
  function doSaved(ev, args)
  {
    // Get here if we've successfully changed category....
    $('#dlgProductChangeCategory').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('changeproductcategory', doSaved);

  $('#dlgProductChangeCategory').dialog
  (
    {
      title: 'Change Category for ' + product.name,
      onClose: function()
      {
        $('#divEvents').off('changeproductcategory', doSaved);
      },
      onOpen: function()
      {
        $('#cbProductChangeCategory').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_productcategories,
            limitToList: true
          }
        );

        doTextboxFocus('cbProductChangeCategory');
      },
      buttons:
      [
        {
          text: 'Change',
          handler: function()
          {
            var categoryid = doGetComboTreeSelectedId('cbProductChangeCategory');

            if (!_.isBlank(categoryid))
              doServerDataMessage('changeproductcategory', {productid: product.id, productcategoryid: categoryid}, {type: 'refresh'});
            else
              doMandatoryTextbox('Please select a category', 'cbProductChangeCategory');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgProductChangeCategory').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

