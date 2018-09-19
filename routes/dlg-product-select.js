function doDlgProductSelect(clientid,pricelevel, enableprice, usecostprice, callback)
{
  console.log(clientid);
  //console.log(usecostprice);
  console.log(pricelevel);
  // console.log($('#divEvents'));
  // Filtered products (by client)
  var fp = [];

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('productpricingupdated', doProductUpdated);
  $('#divEvents').on('getprice', doGetPrice);;
  $('#divEvents').on('productpricespopup', doEventsHandler);

  function doEventsHandler(ev, args)
  {
    if (args == 'new')
      doNew();
    else if (args == 'edit')
      doEdit();
    else if (args == 'remove')
      doRemove();
  }

  function doProductUpdated(ev, args)
  {
    // console.log("doProductUpdated");
    var productid = $('#cbProductSelectProducts').combobox('getValue');

    if (args.data.productid == productid)
    {
      var qty = $('#fldProductSelectQty').numberbox('getValue');

      doServerDataMessage('getprice', {clientid: clientid, productid: productid, qty: qty}, {type: 'refresh'});
    }
  }

  //var n = 1;
  function doGetPrice(ev, args)
  {
    
    // console.log("doGetPrice");
    console.log(Object.keys(args.data.price).length);
    console.log(args.data.price);
    //console.log(ev);
    //console.log(n);
    //n++;
    if (usecostprice)
    {
      console.log("find cost price");
      if(Object.keys(args.data.price).length == 3)
      {
        console.log("couldn't find any match price results,no records at all");
        $('#fldProductSelectPrice').numberbox('initValue', args.data.price.price);
        doShowWarning('Could not find a cost price for this product');
      }
      else
      {
        $('#fldProductSelectPrice').numberbox('setValue', args.data.price.costprice);
      }
      
      return;
    }
    else
    {
      console.log("find sales price");
      if(Object.keys(args.data.price).length == 3)
      {
        console.log("couldn't find any match price results,no records at all");
        $('#fldProductSelectPrice').numberbox('initValue', args.data.price.price);
        doShowWarning('Could not find a matching price for this product');
      }
      else
      {
       
        if(!_.isNull(args.data.price.discountcode_id))
        {
          console.log("product have discount code, need to use the price level match client's");
          if(pricelevel == 0)
          {
            pricelevel = 1;
          }
          var uselevel = 'price' + pricelevel;
          console.log(uselevel);
          var useprice = args.data.price[uselevel];
          console.log(useprice);
          $('#fldProductSelectPrice').numberbox('setValue', useprice);  
        }
        else
        {
          console.log("product doesn't have discount code, use the traditional price matching");
          $('#fldProductSelectPrice').numberbox('setValue', args.data.price.price);  
          var qty = $('#fldProductSelectQty').numberbox('getValue');
    
            // Check if this has a min qty...
            if (!_.isNull(args.data.price.minqty))
            {
              var m = _.toBigNum(args.data.price.minqty);
  
              // If user has no qty, set it to min...
              // If user has a qty, check it's at least the min...
              if (_.isBlank(qty) || m.greaterThan(qty))
              {
                console.log("entered qty is empty, or entered qty is less than the recored required min qty");
                doShowWarning('the minimum quantity for this product is ' + args.data.price.minqty);
                // $('#fldProductSelectQty').numberbox('setValue', args.data.price.minqty);
                $('#fldProductSelectQty').numberbox('initValue', args.data.price.minqty);
              }
            }
        }
  
       
  
      }
    }
    

    

    
    // else if (!_.isNull(args.data.price.maxqty))
    // {
    //   var max = _.toBigNum(args.data.price.maxqty);
    //   if(max.lessThan(qty))
    //   {
    //     doShowWarning('Could not find a matching price for this product under this quantity');
    //     $('#fldProductSelectPrice').numberbox('setValue', 0.0000);
    //   }
    // }

    // if(args.data.price.price == 0)
    // {
    //   console.log("no match prices find");
    //   doShowWarning('Could not find a matching price for this product under this quantity');
    //   $('#fldProductSelectPrice').numberbox('initValue', 0.0000);
    // }

  }

  console.log('cache_products');
  console.log(cache_products.length);

  // Show products for this client and products that don't belong to any client...
  cache_products.forEach
  (
    function(p)
    {
      if (_.isNull(p.clientid) || (p.clientid == clientid))
      {
        fp.push
        (
          {
            id: p.id,
            code: p.code,
            discount:p.discountcodeid,
            productcategoryname: p.productcategoryname
          }
        );
      }
    }
  );

  console.log(fp.length);
  //console.log(fp[0].discount);

  $('#dlgProductSelect').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('productpricingupdated', doProductUpdated);
        $('#divEvents').off('getprice', doGetPrice)
        $('#divEvents').off('productpricespopup', doEventsHandler);
        $('#cbProductSelectProducts').combobox('clear');
        $('#fldProductSelectQty').numberbox('clear');
        $('#fldProductSelectPrice').numberbox('clear');
      },
      onOpen: function()
      {
        $('#cbProductSelectProducts').combobox
        (
          {
            valueField: 'id',
            textField: 'code',
            groupField: 'productcategoryname',
            data: fp,
            limitToList: true,
            onSelect: function(record)
            {
              var qty = $('#fldProductSelectQty').numberbox('getValue');
              console.log("product select box fire getprice event");
              console.log(record.discount);
              primus.emit('getprice', {fguid: fguid, uuid: uuid, session: session, clientid: clientid, productid: record.id, qty: qty, pricelevel:pricelevel,discountcode:record.discount, pdata: {type: 'refresh'}});

              doTextboxFocus('fldProductSelectQty');
            }
          }
        );

        $('#fldProductSelectQty').numberbox
        (
          $.extend
          (
            numberboxParseObj,
            {
              onChange: function(newValue, oldValue)
              {
                // console.log("qty numberbox onchange event");
                // console.log("new value: " + newValue);
                // console.log("old value: " + oldValue);
                var productid = $('#cbProductSelectProducts').combobox('getValue');

                if(typeof newValue === 'undefined')
                {
                  console.log("newValue is undefined,don't fire events");
                  $('#fldProductSelectQty').numberbox('initValue', 0.0000);
                }
                else
                {
                  if (!_.isBlank(productid))
                  {
                    console.log("newValue is defined and product id is not blank, qty number box fire getprice event");
                    primus.emit('getprice', {fguid: fguid, uuid: uuid, session: session, clientid: clientid, productid: productid, qty: newValue, pdata: {type: 'refresh'}});
  
                  }
                }
  
                
              }
            }
          )
        );

        $('#fldProductSelectPrice').numberbox
        (
          {
            disabled: !enableprice
          }
        );

        $('#cbProductSelectIsRepeat').switchbutton
        (
          {
            onText: 'Repeat',
            offText: 'New',
            checked: false
          }
        );

        $('#cbProductSelectIsNewArtwork').switchbutton
        (
          {
            onText: 'Yes',
            offText: 'No',
            checked: false
          }
        );

        $('#cbProductSelectProducts').combobox('loadData', fp);

        doProductSelectReset();
      },
      buttons:
      [
        {
          text: 'Select',
          handler: function()
          {
            var productid = $('#cbProductSelectProducts').combobox('getValue');
            var productname = $('#cbProductSelectProducts').combobox('getText');
            var qty = $('#fldProductSelectQty').numberbox('getValue');
            var price = $('#fldProductSelectPrice').numberbox('getValue');
            isrepeat = doSwitchButtonChecked('cbProductSelectIsRepeat');
            isnewartwork = doSwitchButtonChecked('cbProductSelectIsNewArtwork');

            if (_.isBlank(productid))
            {
              doMandatoryTextbox('Please select a product...', 'cbProductSelectProducts');
              return;
            }

            if (_.isBlank(qty) || (_.toBigNum(qty).lessThanOrEqualTo(0.0)))
            {
              doMandatoryTextbox('Please enter a non-zero quantity...', 'fldProductSelectQty');
              return;
            }

            if (callback)
              callback(productid, productname, qty, price, isrepeat, isnewartwork);

            $('#dlgProductSelect').dialog('close');
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            doProductSelectReset();
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            // $('#cbProductSelectProducts').combobox('clear');
            // $('#fldProductSelectQty').numberbox('clear');
            // $('#fldProductSelectPrice').numberbox('clear');
            $('#dlgProductSelect').dialog('close');
            
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

function doProductSelectReset()
{
  $('#cbProductSelectProducts').combobox('clear');
  $('#fldProductSelectQty').numberbox('clear');
  $('#fldProductSelectPrice').numberbox('clear');

  doTextboxFocus('cbProductSelectProducts');
}
