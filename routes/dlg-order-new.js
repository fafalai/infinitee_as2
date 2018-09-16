var selectedClientPriceLevel = 0;
var selectedOrderIdAttachmentId = null;

function doDlgOrderNew(orderid)
{
  var isnew = _.isUndefined(orderid) || _.isNull(orderid);
  var editingIndex = null;
  var order = {};
  var invoicetostates = [];
  var shiptostates = [];
  var versions = [];
  // For notes editor
  var editorIndex = null;
  var originalContents = null;
  var editorPanel = null;
  var editorId = null;
  // For attachments
  var attachmentIndex = null;

  // Notes editor methods...
  function doEditorNew()
  {
    doServerDataMessage('newordernote', {orderid: orderid}, {type: 'refresh'});
  }

  function doEditorClear()
  {
    $('#divNewOrderNotesG').datagrid('clearSelections');
  }

  function doEditorEdit()
  {
    doGridGetSelectedRowData
    (
      'divNewOrderNotesG',
      function(row, rowIndex)
      {
        if (_.isNull(editorIndex))
        {
          editorIndex = rowIndex;

          editorId = 'divOrderNote-id-' + row.id;
          originalContents = $('#' + editorId).html();
          editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance(editorId, {hasPanel: true});
        }
      }
    );
  }

  function doEditorCancel()
  {
    editorIndex = doGridCancelEdit
    (
      'divNewOrderNotesG',
      editorIndex,
      function()
      {
        editorPanel.removeInstance(editorId);

        // Perform manual cancel since editor replaces text directly into DIV...
        $('#' + editorId).html(originalContents);

        originalContents = null;
        editorPanel = null;
      }
    );
  }

  function doEditorSave()
  {
    doGridEndEditGetRow
    (
      'divNewOrderNotesG',
      editorIndex,
      function(row)
      {
        var notes = nicEditors.findEditor(editorId).getContent();

        if(orderid == null){
          doServerDataMessage('saveordernote_neworder', {ordernoteid: row.id, notes: notes}, {type: 'refresh'});
        }
        else
          doServerDataMessage('saveordernote', {ordernoteid: row.id, notes: notes}, {type: 'refresh'});

        editorPanel.removeInstance(editorId);
        originalContents = null;
        editorPanel = null;
        editorIndex = null;
      }
    );
  }

  function doEditorSearch()
  {
    doDlgNoteSearch
    (
      function(text)
      {
        doServerDataMessage('searchordernote', {orderid: orderid, words: text}, {type: 'refresh'});
      },
      function()
      {
        doServerDataMessage('listordernotes', {orderid: orderid}, {type: 'refresh'});
      }
    );
  }

  function doEditorSaved(ev, args)
  {
    if (orderid == args.data.orderid)
      doServerDataMessage('listordernotes', {orderid: orderid}, {ordernoteid: args.data.ordernoteid, type: 'refresh'});
  }

  function doCleanOrderNoteLocally(){
    doServerMessage('cleanOrdernoteLocally',{type: 'refresh'});
  }
   function doEditorList_newOrder(ev, args){
    var data = [];
    args.data.note_List.forEach((n) => {
      data.push(
        {
          id: n.note_id,
          notes: doNiceString(n.ordernote),
          date: doNiceDateModifiedOrCreated(n.datecreated),
          by: n.usercreated
        }
      );
    });
    
    $('#divNewOrderNotesG').datagrid('loadData', data);
  }

  function doEditorList(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(n)
      {
        data.push
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

    $('#divNewOrderNotesG').datagrid('loadData', data);

    if (!_.isUndefined(args.pdata.ordernoteid) && !_.isNull(args.pdata.ordernoteid))
      $('#divNewOrderNotesG').datagrid('selectRecord', args.pdata.ordernoteid);
  }

  // Attachments methods
  function doAttachmentClear()
  {
    $('#divNewOrderAttachmentsG').datagrid('clearSelections');
  }

  function doAttachmentEdit()
  {
    doGridStartEdit
    (
      'divNewOrderAttachmentsG',
      editingIndex,
      function(row, index)
      {
        attachmentIndex = index;

        doGridGetEditor
        (
          'divNewOrderAttachmentsG',
          attachmentIndex,
          'description',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doAttachmentCancel()
  {
    attachmentIndex = doGridCancelEdit('divNewOrderAttachmentsG', editingIndex);
  }

  function doAttachmentSave()
  {
    doGridEndEditGetRow
    (
      'divNewOrderAttachmentsG',
      attachmentIndex,
      function(row)
      {
        doServerDataMessage('saveorderattachment', {orderattachmentid: row.id, description: row.description, isthumbnail: row.isthumbnail}, {type: 'refresh'});
      }
    );

    attachmentIndex = null;
  }

  function doAttachmentRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divNewOrderAttachmentsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove attachment ' + row.description + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expireorderattachment', {orderattachmentid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select an attachment to remove');
    }
  }

  function doAttachmentDownload()
  {
    doGridGetSelectedRowData
    (
      'divNewOrderAttachmentsG',
      function(row)
      {
        doThrowOrderAttachment(row.id);
      }
    );
  }

  function doAttachmentSaved(ev, args)
  {
    if (orderid == args.data.orderid)
      doServerDataMessage('listorderattachments', {orderid: orderid}, {type: 'refresh'});
  }

  function doAttachmentList(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(a)
      {
        var image = _.isNull(a.image) || _.isUndefined(a.image) ? '' : '<image src="' + a.image + '" width="35px">';

        data.push
        (
          {
            id: doNiceId(a.id),
            name: doNiceString(a.name),
            description: doNiceString(a.description),
            mimetype: '<a href="javascript:void(0);" onClick="doThrowOrderAttachment(' + a.id + ');">' + mapMimeTypeToImage(a.mimetype) + '</a>',
            size: doNiceString(a.size),
            isthumbnail: a.isthumbnail,
            image: image,
            date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
            by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
          }
        );
      }
    );

    $('#divNewOrderAttachmentsG').datagrid('loadData', data);
  }

  // Orders methods
  function doReset()
  {
    $('#cbNewOrderInvoiceAddress').combotree('clear');
    $('#cbNewOrderShiptoAddress').combotree('clear');
    $('#divOrderNewProductsG').datagrid('loadData', []);

    $('#cbNewOrderStatusesStatus').combobox('clear');
    $('#fldNewOrderStatusesConnote').textbox('clear');
    $('#fldNewOrderStatusesCarrier').textbox('clear');
    $('#fldNewOrderStatusesComment').textbox('clear');
    $('#fldNewOrderStatusesBatchno').textbox('clear');

    if (isnew)
    {
      $('#fldNewOrderPONo').textbox('clear');
      $('#fldNewOrderOrderName').textbox('clear');
      $('#cbNewOrderClients').combotree('clear');
      $('#cbNewOrderVersions').combobox('clear');
      $('#fldNewOrderFreight').numberbox('clear');

      $('#fldNewOrderName').textbox('clear');
      $('#fldNewOrderAddress1').textbox('clear');
      $('#fldNewOrderAddress2').textbox('clear');
      $('#fldNewOrderAddress3').textbox('clear');
      $('#fldNewOrderAddress4').textbox('clear');
      $('#fldNewOrderCity').textbox('clear');
      $('#fldNewOrderPostcode').textbox('clear');
      $('#cbNewOrderCountry').combobox('clear');
      $('#cbNewOrderState').combobox('clear');

      $('#fldNewOrderShiptoName').textbox('clear');
      $('#fldNewOrderShiptoAddress1').textbox('clear');
      $('#fldNewOrderShiptoAddress2').textbox('clear');
      $('#fldNewOrderShiptoAddress3').textbox('clear');
      $('#fldNewOrderShiptoAddress4').textbox('clear');
      $('#fldNewOrderShiptoCity').textbox('clear');
      $('#fldNewOrderShiptoPostcode').textbox('clear');
      $('#cbNewOrderShiptoCountry').combobox('clear');
      $('#cbNewOrderShiptoState').combobox('clear');
      $('#fldNewOrderShiptoNote').textbox('clear');

      $('#cbNewOrderCountry').combobox('setValue', defaultCountry);
      $('#cbNewOrderShiptoCountry').combobox('setValue', defaultCountry);

      $('#cbNewOrderTemplateQuote').combobox('clear');
      $('#cbNewOrderTemplateOrder').combobox('clear');
      $('#cbNewOrderTemplateInvoice').combobox('clear');

      $('#dtNewOrderStartDate').datebox('clear');
      $('#dtNewOrderEndDate').datebox('clear');

      $('#btnOrderNewAdd').linkbutton('disable');

      $('#tbOrderNewNew').linkbutton('enable');
      $('#tbOrderNewClear').linkbutton('enable');
      $('#tbOrderNewEdit').linkbutton('enable');
      $('#tbOrderNewCancel').linkbutton('enable');
      $('#tbOrderNewSave').linkbutton('enable');
      $('#tbOrderNewRemove').linkbutton('enable');

      $('#cbNewOrderClients').combotree('enable');
      $('#fldNewOrderPONo').textbox('enable');
      $('#fldNewOrderOrderName').textbox('enable');
    }
    else
    {
      if (!_.isEmpty(order))
      {
        $('#fldNewOrderPONo').textbox('setValue', order.pono);
        $('#fldNewOrderOrderName').textbox('setValue', order.name);
        $('#cbNewOrderClients').combotree('setValue', order.clientid);
        $('#fldNewOrderFreight').numberbox('setValue', order.freightprice);

        //
        versions = [];
        for (var v = 1; v <= order.numversions; v++)
          versions.push({name: v});

        $('#cbNewOrderVersions').combobox('loadData', versions);
        $('#cbNewOrderVersions').combobox('setValue', order.activeversion);
        //

        $('#fldNewOrderName').textbox('setValue', order.invoicetoname);
        $('#fldNewOrderAddress1').textbox('setValue', order.invoicetoaddress1);
        $('#fldNewOrderAddress2').textbox('setValue', order.invoicetoaddress2);
        $('#fldNewOrderAddress3').textbox('setValue', order.invoicetoaddress3);
        $('#fldNewOrderAddress4').textbox('setValue', order.invoicetoaddress4);
        $('#fldNewOrderCity').textbox('setValue', order.invoicetocity);
        $('#fldNewOrderPostcode').textbox('setValue', order.invoicetopostcode);
        $('#cbNewOrderCountry').combobox('setValue', order.invoicetocountry);
        $('#cbNewOrderState').combobox('setValue', order.invoicetostate);

        $('#fldNewOrderShiptoName').textbox('setValue', order.shiptoname);
        $('#fldNewOrderShiptoAddress1').textbox('setValue', order.shiptoaddress1);
        $('#fldNewOrderShiptoAddress2').textbox('setValue', order.shiptoaddress2);
        $('#fldNewOrderShiptoAddress3').textbox('setValue', order.shiptoaddress3);
        $('#fldNewOrderShiptoAddress4').textbox('setValue', order.shiptoaddress4);
        $('#fldNewOrderShiptoCity').textbox('setValue', order.shiptocity);
        $('#fldNewOrderShiptoPostcode').textbox('setValue', order.shiptopostcode);
        $('#cbNewOrderShiptoCountry').combobox('setValue', order.shiptocountry);
        $('#cbNewOrderShiptoState').combobox('setValue', order.shiptostate);
        $('#fldNewOrderShiptoNote').textbox('setValue', order.shiptonote);

        $('#cbNewOrderTemplateQuote').combobox('setValue', order.quotetemplateid);
        $('#cbNewOrderTemplateOrder').combobox('setValue', order.ordertemplateid);
        $('#cbNewOrderTemplateInvoice').combobox('setValue', order.invoicetemplateid);

        $('#dtNewOrderStartDate').datebox('setValue', order.startdate);
        $('#dtNewOrderEndDate').datebox('setValue', order.enddate);

        if (_.isBlank(order.invoiceno))
        {
          $('#fldNewOrderPONo').textbox('enable');
          $('#fldNewOrderOrderName').textbox('enable');

          $('#btnOrderNewAdd').linkbutton('enable');

          $('#tbOrderNewNew').linkbutton('enable');
          $('#tbOrderNewClear').linkbutton('enable');
          $('#tbOrderNewEdit').linkbutton('enable');
          $('#tbOrderNewCancel').linkbutton('enable');
          $('#tbOrderNewSave').linkbutton('enable');
          $('#tbOrderNewRemove').linkbutton('enable');
        }
        else
        {
          $('#fldNewOrderPONo').textbox('disable');
          $('#fldNewOrderOrderName').textbox('disable');

          $('#btnOrderNewAdd').linkbutton('disable');

          $('#tbOrderNewNew').linkbutton('disable');
          $('#tbOrderNewClear').linkbutton('disable');
          $('#tbOrderNewEdit').linkbutton('disable');
          $('#tbOrderNewCancel').linkbutton('disable');
          $('#tbOrderNewSave').linkbutton('disable');
          $('#tbOrderNewRemove').linkbutton('disable');
        }

        $('#cbNewOrderClients').combotree('disable');
        $('#dlgOrderNew').dialog('setTitle', 'Modify ' + order.orderno + ', version ' + order.activeversion);

        doServerDataMessage('listorderdetails', {orderid: orderid, version: order.activeversion}, {type: 'refresh'});
      }
    }

    doTextboxFocus('fldNewOrderPONo');
  }

  function doProductChanged(record)
  {
    doGridGetSelectedRowData
    (
      'divOrderNewProductsG',
      function(row, rowindex)
      {
        var clientid = doGetComboTreeSelectedId('cbNewOrderClients');

        // Get latest row data from editors...
        doGridGetEditor
        (
          'divOrderNewProductsG',
          rowindex,
          'productid',
          function(ed)
          {
            var qty = $(ed.target).numberbox('getValue');

            doServerDataMessage('getprice', {clientid: clientid, productid: record.id, qty: qty}, {type: 'refresh', rowindex: rowindex});
          }
        );
      }
    );
  }

  function doQtyChanged(newqty)
  {
    doGridGetSelectedRowData
    (
      'divOrderNewProductsG',
      function(row, rowindex)
      {
        var clientid = doGetComboTreeSelectedId('cbNewOrderClients');

        // Get latest row data from editors...
        doGridGetEditor
        (
          'divOrderNewProductsG',
          rowindex,
          'productid',
          function(ed)
          {
            var productid = $(ed.target).combobox('getValue');

            doServerDataMessage('getprice', {clientid: clientid, productid: productid, qty: newqty}, {type: 'refresh', rowindex: rowindex});
          }
        );
      }
    );
  }

  function doReCalcTotals()
  {
    doGridCalcTotals('divOrderNewProductsG', 'price', 'qty', 'discount', 'expressfee');
  }

  function doNew()
  {
    var clientid = doGetComboTreeSelectedId('cbNewOrderClients');

    doDlgProductSelect
    (
      clientid,
      selectedClientPriceLevel,
      true,
      false,
      function(productid, productname, qty, price, isrepeat)
      {
        if (isnew)
        {
          $('#divOrderNewProductsG').datagrid
          (
            'appendRow',
            {
              id: productid,
              productid: productid,
              qty: qty,
              price: price,
              isrepeat: isrepeat
            }
          );

          doReCalcTotals();
        }
        else
        {
          var v = $('#cbNewOrderVersions').combobox('getValue');
          doServerDataMessage('neworderdetail', {orderid: orderid, version: v, productid: productid, qty: qty, price: price, discount: null, expressfee: null}, {type: 'refresh'});
        }
      }
    );
  }

  function doClear()
  {
    $('#divOrderNewProductsG').datagrid('clearSelections');
  }

  function doEdit()
  {
    doGridGetSelectedRowData
    (
      'divOrderNewProductsG',
      function(row)
      {
        doGridStartEdit
        (
          'divOrderNewProductsG',
          editingIndex,
          function(row, index)
          {
            editingIndex = index;

            doGridGetEditor
            (
              'divOrderNewProductsG',
              editingIndex,
              'price',
              function(ed)
              {
              }
            );
          }
        );
      }
    );
  }

  function doCancel()
  {
    editingIndex = doGridCancelEdit('divOrderNewProductsG', editingIndex);
  }

  function doSave()
  {
    doGridEndEditGetRow
    (
      'divOrderNewProductsG',
      editingIndex,
      function(row)
      {
        if (isnew)
          doReCalcTotals();
        else
        {
          var v = $('#cbNewOrderVersions').combobox('getValue');

          doServerDataMessage
          (
            'saveorderdetail',
            {
              orderdetailid: row.id,
              productid: row.productid,
              price: row.price,
              qty: row.qty,
              discount: row.discount,
              expressfee: row.expressfee,
              isrepeat: row.isrepeat,
              version: v
            },
            {type: 'refresh'}
          );
        }
      }
    );

    editingIndex = null;
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divOrderNewProductsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove ' + doGetCodeFromIdInObjArray(cache_products, row.productid) + '?',
            function(result)
            {
              if (result)
              {
                if (isnew)
                {
                  doGridRemoveRow('divOrderNewProductsG', row);
                  doReCalcTotals();
                }
                else
                  doServerDataMessage('expireorderdetail', {orderdetailid: row.id}, {type: 'refresh'});
              }
            }
          );
        }
      ))
    {
      doShowError('Please select a product to remove');
    }
  }

  function doCheckOrderPO(ev, args)
  {
    // PO already exists?
    if (args.data.rs.length > 0)
    {
      var o = args.data.rs[0];
      var msg = 'P.O. [' + o.pono + '] belongs to order [' + o.orderno + ']';

      if (!_.isUndefined(o.clientname))
        msg += ' for client ['+ o.clientname +  ']';

      doShowError(msg);
    }
  }

  function doOrderSaved(ev, args)
  {
    console.log("do order saved");
    $('#dlgOrderNew').dialog('close');
  }

  function doGetPrice(ev, args)
  {
    doGridGetEditor
    (
      'divOrderNewProductsG',
      args.pdata.rowindex,
      'price',
      function(edprice)
      {
        doGridGetEditor
        (
          'divOrderNewProductsG',
          args.pdata.rowindex,
          'qty',
          function(edqty)
          {
            var qty = $(edqty.target).numberbox('getValue');

            // Check if this has a min qty...
            if (!_.isNull(args.data.price.minqty))
            {
              var m = _.toBigNum(args.data.price.minqty);

              // If user has no qty, set it to min...
              // If user has a qty, check it's at least the min...
              if (_.isBlank(qty) || m.greaterThan(qty))
                $(edqty.target).numberbox('setValue', args.data.price.minqty);
            }

            $(edprice.target).numberbox('setValue', args.data.price.unitprice);
          }
        );
      }
    );
  }

  function doLoadClient(ev, args)
  {
    if(!_.isNull(args.data.client.pricelevel))
    {
      selectedClientPriceLevel = args.data.client.pricelevel
    }
    else
    {
      selectedClientPriceLevel = 0;
    }
    console.log("price level: " + selectedClientPriceLevel);
    switch (args.pdata.type)
    {
      case 'refresh':
      {
        $('#fldNewOrderOrderName').textbox('setValue', args.data.client.name);
        $('#btnOrderNewAdd').linkbutton('enable');
        // Fall through...
         //Trigger shipping address combotree
         let shiptree = $('#cbNewOrderShiptoAddress').combotree('tree');
         let shipnode = shiptree.tree('find',args.data.client.id);
         if(shipnode){
           shiptree.tree('select',shipnode.target);
           $(shipnode.target).trigger('click');
         }
 
         //Trigger invoice address combotree
         let invoicetree = $('#cbNewOrderInvoiceAddress').combotree('tree');
         let invoicenode = invoicetree.tree('find',args.data.client.id);
         if(invoicenode){
           invoicetree.tree('select',invoicenode.target);
           $(invoicenode.target).trigger('click');
         }
         
         // Fall through...
         break;
        
      }
      case 'invoiceto':
      {
        $('#fldNewOrderName').textbox('setValue', args.data.client.name);
        $('#fldNewOrderAddress1').textbox('setValue', args.data.client.address1);
        $('#fldNewOrderAddress2').textbox('setValue', args.data.client.address2);
        $('#fldNewOrderAddress3').textbox('setValue', args.data.client.address3);
        $('#fldNewOrderAddress4').textbox('setValue', args.data.client.address4);
        $('#fldNewOrderCity').textbox('setValue', args.data.client.city);
        $('#fldNewOrderPostcode').textbox('setValue', args.data.client.postcode);
        $('#cbNewOrderCountry').combobox('setValue', args.data.client.country);
        $('#cbNewOrderState').combobox('setValue', args.data.client.state);
        break;
        // Fall through...
      }
      default:
      {
        $('#fldNewOrderShiptoName').textbox('setValue', args.data.client.name);
        $('#fldNewOrderShiptoAddress1').textbox('setValue', !_.isBlank(args.data.client.shipaddress1) ? args.data.client.shipaddress1 : args.data.client.address1);
        $('#fldNewOrderShiptoAddress2').textbox('setValue', !_.isBlank(args.data.client.shipaddress2) ? args.data.client.shipaddress2 : args.data.client.address2);
        $('#fldNewOrderShiptoAddress3').textbox('setValue', !_.isBlank(args.data.client.shipaddress3) ? args.data.client.shipaddress3 : args.data.client.address3);
        $('#fldNewOrderShiptoAddress4').textbox('setValue', !_.isBlank(args.data.client.shipaddress4) ? args.data.client.shipaddress4 : args.data.client.address4);

        $('#fldNewOrderShiptoCity').textbox('setValue', !_.isBlank(args.data.client.shipcity) ? args.data.client.shipcity : args.data.client.city);
        $('#fldNewOrderShiptoPostcode').textbox('setValue', !_.isBlank(args.data.client.shippostcode) ? args.data.client.shippostcode : args.data.client.postcode);
        $('#cbNewOrderShiptoCountry').textbox('setValue', !_.isBlank(args.data.client.shipcountry) ? args.data.client.shipcountry : args.data.client.country);
        $('#cbNewOrderShiptoState').textbox('setValue', !_.isBlank(args.data.client.shipstate) ? args.data.client.shipstate : args.data.client.state);
      }
    }
  }

  function doNewVersion()
  {
    doPromptOkCancel
    (
      'Create new version from version ' + order.activeversion + '?',
      function(result)
      {
        if (result)
          doServerDataMessage('newversionorder', {orderid: orderid, version: order.activeversion}, {type: 'refresh'});
      }
    );
  }

  function doReload(ev, args)
  {
    if (!_.isNull(orderid))
      doServerDataMessage('loadorder', {orderid: orderid}, {type: 'refresh'});
  }

  function doLoadOrder(ev, args)
  {
    order = (args.data.order);
    doReset();
  }

  function doListOrderDetails(ev, args)
  {
    $('#divOrderNewProductsG').datagrid('loadData', args.data.rs);
    doReCalcTotals();
  }

  function doSavedOrderDetails()
  {
    var v = $('#cbNewOrderVersions').combobox('getValue');

    doServerDataMessage('listorderdetails', {orderid: orderid, version: v}, {type: 'refresh'});
  }

  function doDiscountChanged(newdiscount)
  {
    doGridGetSelectedRowData
    (
      'divOrderNewProductsG',
      function(row, index)
      {
        var eds = $('#divOrderNewProductsG').datagrid('getEditors', index);
        var expressfee = $(eds[4].target).numberbox('getValue');

        // Can't have fee and discount at same time...
        if ((newdiscount != 0.0) && !_.isBlank(newdiscount) && (expressfee != 0.0) && !_.isBlank(expressfee))
        {
          $(eds[4].target).numberbox('clear');
          doShowWarning('You can\'t have a fee and discount...');
        }
      }
    );
  }

  function doExpressFeeChanged(newexpressfee)
  {
    doGridGetSelectedRowData
    (
      'divOrderNewProductsG',
      function(row, index)
      {
        var eds = $('#divOrderNewProductsG').datagrid('getEditors', index);
        var discount = $(eds[3].target).numberbox('getValue');

        // Can't have fee and discount at same time...
        if ((newexpressfee != 0.0) && !_.isBlank(newexpressfee) && (discount != 0.0) && !_.isBlank(discount))
        {
          $(eds[3].target).numberbox('clear');
          doShowWarning('You can\'t have a discount and fee...');
        }
      }
    );
  }

  function doStatusNew()
  {
    var status = $('#cbNewOrderStatusesStatus').combobox('getValue');
    var connote = $('#fldNewOrderStatusesConnote').textbox('getValue');
    var carrier = $('#fldNewOrderStatusesCarrier').textbox('getValue');
    var comment = $('#fldNewOrderStatusesComment').textbox('getValue');
    var batchno = $('#fldNewOrderStatusesBatchno').textbox('getValue');

    if (_.isBlank(status))
      status = 0;

      doServerDataMessage('neworderstatus', {orderid: orderid, status: status, connote: connote, carrier: carrier, comment: comment, batchno: batchno}, {type: 'refresh'});
  }

  function doStatusClear()
  {
    $('#divNewOrderStatusesG').datagrid('clearSelections');
  }

  function doStatusSaved(ev, args)
  {
    doServerDataMessage('listorderstatuses', {orderid: orderid}, {type: 'refresh', orderstatusid: args.data.orderstatusid});
  }

  function doStatusList(ev, args)
  {
    var data = [];

    $('#cbNewOrderStatusesStatus').combobox('clear');
    $('#fldNewOrderStatusesConnote').textbox('clear');
    $('#fldNewOrderStatusesCarrier').textbox('clear');
    $('#fldNewOrderStatusesComment').textbox('clear');
    $('#fldNewOrderStatusesBatchno').textbox('clear');

    args.data.rs.forEach
    (
      function(s)
      {
        data.push
        (
          {
            id: doNiceId(s.id),
            status: s.status,
            carriername: doNiceString(s.carriername),
            connote: doNiceString(s.connote),
            comments: doNiceString(s.comments),
            batchno: doNiceString(s.batchno),
            date: doNiceDateModifiedOrCreated(s.datemodified, s.datecreated),
            by: doNiceModifiedBy(s.datemodified, s.usermodified, s.usercreated)
          }
        );
      }
    );

    $('#divNewOrderStatusesG').datagrid('loadData', data);

    if (!_.isUndefined(args.pdata.orderstatusid) && !_.isNull(args.pdata.orderstatusid))
      $('#divNewOrderStatusesG').datagrid('selectRecord', args.pdata.orderstatusid);
  }

  function doEventsHandler(ev, args)
  {
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

  function doEditorEventsHandler(ev, args)
  {
    if (args == 'new')
      doEditorNew();
    else if (args == 'clear')
      doEditorClear();
    else if (args == 'edit')
      doEditorEdit();
    else if (args == 'cancel')
      doEditorCancel();
    else if (args == 'save')
      doEditorSave();
    else if (args == 'search')
      doEditorSearch();
  }

  function doAttachmentEventsHandler(ev, args)
  {
    if (args == 'clear')
      doAttachmentClear();
    else if (args == 'edit')
      doAttachmentEdit();
    else if (args == 'cancel')
      doAttachmentCancel();
    else if (args == 'save')
      doAttachmentSave();
    else if (args == 'remove')
      doAttachmentRemove();
    else if (args == 'download')
      doAttachmentDownload();
  }

  function doStatusEventsHandler(ev, args)
  {
    if (args == 'new')
      doStatusNew();
    else if (args == 'clear')
      doStatusClear();
  }

  $('#divEvents').on('listordernote_newOrder', doEditorList);
  $('#divEvents').on('newordernote', doEditorSaved);
  $('#divEvents').on('saveordernote', doEditorSaved);
  $('#divEvents').on('ordernotecreated', doEditorSaved);
  $('#divEvents').on('ordernotesaved', doEditorSaved);
  $('#divEvents').on('listordernotes', doEditorList);

  $('#divEvents').on('listorderattachments', doAttachmentList);
  $('#divEvents').on('orderattachmentcreated', doAttachmentSaved);
  $('#divEvents').on('orderattachmentsaved', doAttachmentSaved);
  $('#divEvents').on('orderattachmentexpired', doAttachmentSaved);
  $('#divEvents').on('saveorderattachment', doAttachmentSaved);
  $('#divEvents').on('expireorderattachment', doAttachmentSaved);

  $('#divEvents').on('checkorderpo', doCheckOrderPO);
  $('#divEvents').on('neworder', doOrderSaved);
  $('#divEvents').on('saveorder', doOrderSaved);
  $('#divEvents').on('getprice', doGetPrice);
  $('#divEvents').on('loadorder', doLoadOrder);
  $('#divEvents').on('loadclient', doLoadClient);
  $('#divEvents').on('listorderdetails', doListOrderDetails);
  $('#divEvents').on('saveorderdetail', doSavedOrderDetails);
  $('#divEvents').on('neworderdetail', doSavedOrderDetails);
  $('#divEvents').on('expireorderdetail', doSavedOrderDetails);
  $('#divEvents').on('newversionorder', doReload);

  $('#divEvents').on('listorderstatuses', doStatusList);
  $('#divEvents').on('neworderstatus', doStatusSaved);
  $('#divEvents').on('orderstatuscreated', doStatusSaved);

  $('#divEvents').on('ordernewpopup', doEventsHandler);
  $('#divEvents').on('ordernotespopup', doEditorEventsHandler);
  $('#divEvents').on('orderattachmentspopup', doAttachmentEventsHandler);
  $('#divEvents').on('orderstatuspopup', doStatusEventsHandler);


  $('#check_SametoShip').change(()=>{
      if($("#check_SametoShip").prop('checked')){
        $('#fldNewOrderAddress1').textbox('setText',$('#fldNewOrderShiptoAddress1').textbox('getText'));
        $('#fldNewOrderAddress2').textbox('setText',$('#fldNewOrderShiptoAddress2').textbox('getText'));
        $('#fldNewOrderAddress3').textbox('setText',$('#fldNewOrderShiptoAddress3').textbox('getText'));
        $('#fldNewOrderAddress4').textbox('setText',$('#fldNewOrderShiptoAddress4').textbox('getText'));
      }
    });
  $('#check_SametoInvoice').change(()=>{
    if($("#check_SametoInvoice").prop('checked')){
      $('#fldNewOrderShiptoAddress1').textbox('setText',$('#fldNewOrderAddress1').textbox('getText'));
      $('#fldNewOrderShiptoAddress2').textbox('setText',$('#fldNewOrderAddress2').textbox('getText'));
      $('#fldNewOrderShiptoAddress3').textbox('setText',$('#fldNewOrderAddress3').textbox('getText'));
      $('#fldNewOrderShiptoAddress4').textbox('setText',$('#fldNewOrderAddress4').textbox('getText'));
    }
  });
 

  $('#dlgOrderNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newordernote', doEditorSaved);
        $('#divEvents').off('saveordernote', doEditorSaved);
        $('#divEvents').off('ordernotecreated', doEditorSaved);
        $('#divEvents').off('ordernotesaved', doEditorSaved);
        $('#divEvents').off('listordernotes', doEditorList);

        $('#divEvents').off('listorderattachments', doAttachmentList);
        $('#divEvents').off('orderattachmentcreated', doAttachmentSaved);
        $('#divEvents').off('orderattachmentsaved', doAttachmentSaved);
        $('#divEvents').off('orderattachmentexpired', doAttachmentSaved);
        $('#divEvents').off('saveorderattachment', doAttachmentSaved);
        $('#divEvents').off('expireorderattachment', doAttachmentSaved);

        $('#divEvents').off('checkorderpo', doCheckOrderPO);
        $('#divEvents').off('neworder', doOrderSaved);
        $('#divEvents').off('saveorder', doOrderSaved);
        $('#divEvents').off('getprice', doGetPrice);
        $('#divEvents').off('loadorder', doLoadOrder);
        $('#divEvents').off('loadclient', doLoadClient);
        $('#divEvents').off('listorderdetails', doListOrderDetails);
        $('#divEvents').off('saveorderdetail', doSavedOrderDetails);
        $('#divEvents').off('neworderdetail', doSavedOrderDetails);
        $('#divEvents').off('expireorderdetail', doSavedOrderDetails);
        $('#divEvents').off('newversionorder', doReload);

        $('#divEvents').off('ordernewpopup', doEventsHandler);
        $('#divEvents').off('ordernotespopup', doEditorEventsHandler);
        $('#divEvents').off('orderattachmentspopup', doAttachmentEventsHandler);
      },
      onOpen: function()
      {
        selectedOrderIdAttachmentId = orderid;

        $('#cbNewOrderClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_clients,
            limitToList: true,
            onSelect: function(record)
            {
              doServerDataMessage('loadclient', {clientid: record.id}, {type: 'refresh'});
            }
          }
        );

        $('#cbNewOrderVersions').combobox
        (
          {
            valueField: 'name',
            textField: 'name',
            data: versions,
            limitToList: true,
            onSelect: function(record)
            {
              doServerDataMessage('listorderdetails', {orderid: orderid, version: record.name}, {type: 'refresh'});
            }
          }
        );

        $('#cbNewOrderIsRepeat').switchbutton
        (
          {
            onText: 'Repeat',
            offText: 'New',
            checked: false
          }
        );

        $('#cbNewOrderInvoiceAddress').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_clients,
            limitToList: true,
            onSelect: function(record)
            {
              doServerDataMessage('loadclient', {clientid: record.id}, {type: 'invoiceto'});
            }
          }
        );

        $('#cbNewOrderShiptoAddress').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: false,
            data: cache_clients,
            limitToList: true,
            onSelect: function(record)
            {
              doServerDataMessage('loadclient', {clientid: record.id}, {type: 'shipto'});
            }
          }
        );

        $('#cbNewOrderCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            limitToList: true,
            onSelect: function(record)
            {
              invoicetostates = doGetStatesFromCountry(record.country);

              $('#cbNewOrderState').combobox('loadData', invoicetostates);
            }
          }
        );

        $('#cbNewOrderState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: shiptostates,
            limitToList: true
          }
        );

        $('#cbNewOrderShiptoCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            limitToList: true,
            onSelect: function(record)
            {
              shiptostates = doGetStatesFromCountry(record.country);

              $('#cbNewOrderShiptoState').combobox('loadData', shiptostates);
            }
          }
        );

        $('#cbNewOrderShiptoState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: shiptostates,
            limitToList: true
          }
        );

        $('#cbNewOrderTemplateQuote').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            data: cache_printtemplates,
            limitToList: true
          }
        );

        $('#cbNewOrderTemplateOrder').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            data: cache_printtemplates,
            limitToList: true
          }
        );

        $('#cbNewOrderTemplateInvoice').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            data: cache_printtemplates,
            limitToList: true
          }
        );

        $('#fldNewOrderPONo').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique po...
                if (newValue != oldValue)
                  doServerDataMessage('checkorderpo', {orderid: orderid, pono: newValue}, {type: 'refresh'});
              }
            }
          }
        );
        // $('#dtNewOrderStartDate').datebox(
        //   {
        //     formatter: function(value, row, index) {return _.nicejsdatetodisplay(value);},
        //     parser:function(value,row,index){return moment(value,"MM/DD/YYYY" ).format('YYYY-MM-DD')},
        //     onSelect:function(value){console.log("dtNewOrderStartDate: "+ value)}
        //   }
        // );
        //console.log(dateboxParserObj);
        $('#dtNewOrderStartDate').datebox(dateboxParserObj);
        $('#dtNewOrderEndDate').datebox(dateboxParserObj);

        $('#cbNewOrderStatusesStatus').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            data: orderstatustypes
          }
        );

        $('#divOrderNewProductsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            toolbar: '#tbOrderNew',
            showFooter: true,
            columns:
            [
              [
                {title: 'Product',     field: 'productid',    width: 200, align: 'left',   resizable: true, editor: {type: 'combobox',  options: {valueField: 'id', textField: 'code', groupField: 'productcategoryname', data: cache_products, onSelect: function(record) {doProductChanged(record);}}}, formatter: function(value, row) {return doGetCodeFromIdInObjArray(cache_products, value);}},
                {title: 'Price',       field: 'price',        width: 100, align: 'right',  resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 4}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}},
                {title: 'Qty',         field: 'qty',          width: 100, align: 'right',  resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 4, onChange: function(newValue, oldValue) {if (!_.isNull(oldValue) && (newValue != oldValue)) doQtyChanged(newValue);}}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value); return value;}},
                {title: 'Discount',    field: 'discount',     width: 100, align: 'right',  resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2, onChange: function(newValue, oldValue) {doDiscountChanged(newValue);}}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}},
                {title: 'Express Fee', field: 'expressfee',   width: 100, align: 'right',  resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2, onChange: function(newValue, oldValue) {doExpressFeeChanged(newValue);}}}, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}},
                {title: 'Repeat?',     field: 'isrepeat',     width: 80,  align: 'center', resizable: true, editor: {type: 'checkbox',  options: {on: 1, off: 0}}, formatter: function(value, row) {if (!_.isUndefined(value)) return mapBoolToImage(value);}}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divOrderNewProductsG', 'divOrderNewMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridGetSelectedRowData
              (
                'divOrderNewProductsG',
                function(row)
                {
                  doGridStartEdit
                  (
                    'divOrderNewProductsG',
                    editingIndex,
                    function(row, index)
                    {
                      editingIndex = index;

                      if (['modified', 'by'].indexOf(field) != -1)
                        field = 'price';

                      doGridGetEditor
                      (
                        'divOrderNewProductsG',
                        editingIndex,
                        field,
                        function(ed)
                        {
                        }
                      );
                    }
                  );
                }
              );
            }
          }
        );

        $('#divNewOrderNotesG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            toolbar: '#tbOrderNotes',
            data: [],
            view: $.extend
            (
              {},
              $.fn.datagrid.defaults.view,
              {
                renderRow: function(target, fields, frozen, rowIndex, rowData)
                {
                  var cc = [];

                  if (!frozen && rowData.id)
                  {
                    cc.push
                    (
                      '<td style="width: 950px;; padding: 5px 5px; border: 0;">' +
                      '  <div style="float: left; margin-left: 10px;">' +
                      '    <p><span class="c-label">Modified: ' + '</span>' + rowData.date + '</p>' +
                      '    <p><span class="c-label">By: ' + '</span>' + rowData.by + '</p>' +
                      '  </div>' +
                      '  <div style="clear: both;"></div>' +
                      '  <div id="divOrderNote-id-' + rowData.id + '" style="float: left; margin-left: 10px; margin-right: 10px; width: 100%; height: 100px; border: 1px dashed #ddd">' + rowData.notes + '</div> ' +
                      '</td>'
                    );
                  }
                  else
                    cc.push('<td style="width: 100%; padding: 5px 5px; border: 0;"></td>');

                  return cc.join('');
                }
              }
            ),
            onDblClickRow: function(index, row)
            {
              if (_.isNull(editorIndex))
              {
                if (row)
                {
                  editorIndex = index;

                  editorId = 'divOrderNote-id-' + row.id;
                  originalContents = $('#' + editorId).html();
                  editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance(editorId, {hasPanel: true});
                }
              }
            }
          }
        );

        $('#divNewOrderAttachmentsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            striped: true,
            toolbar: '#tbOrderAttachments',
            columns:
            [
              [
                {title: 'Name',        field: 'name',        width: 200, align: 'left',   resizable: true},
                {title: 'Description', field: 'description', width: 300, align: 'left',   resizable: true, editor: 'text'},
                {title: 'Type',        field: 'mimetype',    width: 100, align: 'center', resizable: true},
                {title: 'Size',        field: 'size',        width: 150, align: 'right',  resizable: true, formatter: function(value, row) {return filesize(value, {base: 10});}},
                {title: 'Thumbnail',   field: 'isthumbnail', width: 150, align: 'center', resizable: true, editor: {type: 'checkbox', options: {on: 1, off: 0}}, formatter: function(value, row) {return mapBoolToImage(value);}},
                {title: 'Image',       field: 'image',       width: 50,  align: 'center', resizable: true},
                {title: 'Modified',    field: 'date',        width: 150, align: 'right',  resizable: true},
                {title: 'By',          field: 'by',          width: 200, align: 'left',   resizable: true}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divNewOrderAttachmentsG', 'divOrderAttachmentsMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divNewOrderAttachmentsG',
                attachmentIndex,
                function(row, index)
                {
                  attachmentIndex = index;

                  doGridGetEditor
                  (
                    'divNewOrderAttachmentsG',
                    attachmentIndex,
                    'description',
                    function(ed)
                    {
                    }
                  );
                }
              );
            }
          }
        );

        $('#divNewOrderStatusesG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            striped: true,
            toolbar: '#tbOrderStatuses',
            frozenColumns:
            [
              [
                {title: 'Status',    field: 'status',      width: 200, align: 'left', resizable: true, formatter: function(value, row) {return doGetStringFromIdInObjArray(orderstatustypes, value);}}
              ]
            ],
            columns:
            [
              [
                {title: 'Con Note',  field: 'connote',     width: 200, align: 'left', resizable: true},
                {title: 'Carrier',   field: 'carriername', width: 150, align: 'left', resizable: true},
                {title: 'Comments',  field: 'comments',    width: 200, align: 'left', resizable: true},
                {title: 'Batch No.', field: 'batchno',     width: 150, align: 'left', resizable: true},
                {title: 'Modified',  field: 'date',        width: 150, align: 'left', resizable: true},
                {title: 'By',        field: 'by',          width: 200, align: 'left', resizable: true}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divNewOrderStatusesG', 'divOrderStatusesMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
            }
          }
        );

        $('#newordertabs').tabs
        (
          {
            selected: 0,
            onSelect: function(title, index)
            {
              if (title == 'Notes')
                doServerDataMessage('listordernotes', {orderid: orderid}, {type: 'refresh'});
            }
          }
        );        

        // if (isnew)
        //   $('#btnOrderNewAdd').linkbutton({text: 'Add'});
        // else
        //   $('#btnOrderNewAdd').linkbutton({text: 'Save'});
        if (isnew){
          $('#btnOrderNewAdd').linkbutton({text: 'Add'});
          $('#newordertabs').tabs('disableTab','Attachments');
          $('#newVersion_button').linkbutton('disable');
        }
        else{
          $('#newVersion_button').linkbutton('enable');
          $('#btnOrderNewAdd').linkbutton({text: 'Save'});
          $('#newordertabs').tabs('enableTab','Attachments');
        }

        if (!_.isNull(orderid))
        {
          doServerDataMessage('loadorder', {orderid: orderid}, {type: 'refresh'});
          doServerDataMessage('listorderattachments', {orderid: orderid}, {type: 'refresh'});
          doServerDataMessage('listorderstatuses', {orderid: orderid}, {type: 'refresh'});
        }
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnOrderNewAdd',
          handler: function()
          {
            var pono = $('#fldNewOrderPONo').textbox('getValue');
            var name = $('#fldNewOrderOrderName').textbox('getValue');
            var clientid = $('#cbNewOrderClients').combotree('getValue');
            var freightprice = $('#fldNewOrderFreight').numberbox('getValue');

            var invoicetoname = $('#fldNewOrderName').textbox('getValue');
            var address1 = $('#fldNewOrderAddress1').textbox('getValue');
            var address2 = $('#fldNewOrderAddress2').textbox('getValue');
            var address3 = $('#fldNewOrderAddress3').textbox('getValue');
            var address4 = $('#fldNewOrderAddress4').textbox('getValue');
            var city = $('#fldNewOrderCity').textbox('getValue');
            var postcode= $('#fldNewOrderPostcode').textbox('getValue');
            var country = $('#cbNewOrderCountry').combobox('getValue');
            var state = $('#cbNewOrderState').combobox('getValue');

            var shiptoname = $('#fldNewOrderShiptoName').textbox('getValue');
            var shiptoaddress1 = $('#fldNewOrderShiptoAddress1').textbox('getValue');
            var shiptoaddress2 = $('#fldNewOrderShiptoAddress2').textbox('getValue');
            var shiptoaddress3 = $('#fldNewOrderShiptoAddress3').textbox('getValue');
            var shiptoaddress4 = $('#fldNewOrderShiptoAddress4').textbox('getValue');
            var shiptocity = $('#fldNewOrderShiptoCity').textbox('getValue');
            var shiptopostcode = $('#fldNewOrderShiptoPostcode').textbox('getValue');
            var shiptocountry = $('#cbNewOrderShiptoCountry').combobox('getValue');
            var shiptostate = $('#cbNewOrderShiptoState').combobox('getValue');
            var shiptonote = $('#fldNewOrderShiptoNote').textbox('getValue');

            var startdate = $('#dtNewOrderStartDate').datebox('getValue');
            var enddate = $('#dtNewOrderEndDate').datebox('getValue');

            var quotetemplateid = $('#cbNewOrderTemplateQuote').combobox('getValue');
            var ordertemplateid = $('#cbNewOrderTemplateOrder').combobox('getValue');
            var invoicetemplateid = $('#cbNewOrderTemplateInvoice').combobox('getValue');

            var data = $('#divOrderNewProductsG').datagrid('getData');

            if (!_.isBlank(pono) || !_.isBlank(name) || !_.isBlank(client))
            {
              if (isnew)
              {
                doServerDataMessage
                (
                  'neworderclient',
                  {
                    name: name,
                    pono: pono,
                    clientid: clientid,
                    startdate: startdate,
                    enddate: enddate,
                    invoicetoname: invoicetoname,
                    address1: address1,
                    address2: address2,
                    address3: address3,
                    address4: address4,
                    city: city,
                    postcode: postcode,
                    country: country,
                    state: state,
                    shiptoname: shiptoname,
                    shiptoaddress1: shiptoaddress1,
                    shiptoaddress2: shiptoaddress2,
                    shiptoaddress3: shiptoaddress3,
                    shiptoaddress4: shiptoaddress4,
                    shiptocity: shiptocity,
                    shiptopostcode: shiptopostcode,
                    shiptocountry: shiptocountry,
                    shiptostate: shiptostate,
                    shiptonote: shiptonote,
                    quotetemplateid: quotetemplateid,
                    ordertemplateid: ordertemplateid,
                    invoicetemplateid: invoicetemplateid,
                    freightprice: freightprice,
                    products: data.rows
                  },
                  {type: 'refresh'}
                );
              }
              else
              {
                var v = $('#cbNewOrderVersions').combobox('getValue');
                doServerDataMessage
                (
                  'saveorder',
                  {
                    orderid: orderid,
                    clientid: clientid,
                    name: name,
                    pono: pono,
                    activeversion: v,
                    startdate: startdate,
                    enddate: enddate,
                    invoicetoname: invoicetoname,
                    address1: address1,
                    address2: address2,
                    address3: address3,
                    address4: address4,
                    city: city,
                    postcode: postcode,
                    country: country,
                    state: state,
                    shiptoname: shiptoname,
                    shiptoaddress1: shiptoaddress1,
                    shiptoaddress2: shiptoaddress2,
                    shiptoaddress3: shiptoaddress3,
                    shiptoaddress4: shiptoaddress4,
                    shiptocity: shiptocity,
                    shiptopostcode: shiptopostcode,
                    shiptocountry: shiptocountry,
                    shiptostate: shiptostate,
                    shiptonote: shiptonote,
                    quotetemplateid: quotetemplateid,
                    ordertemplateid: ordertemplateid,
                    invoicetemplateid: invoicetemplateid,
                    freightprice: freightprice
                  },
                  {type: 'refresh'}
                );
              }
            }
            else
              doMandatoryTextbox('Need at least a P.O. number or name', 'fldNewOrderPONo');
          }
        },
        {
          id: 'newVersion_button',
          text: 'New Version',
          handler: function()
          {
            doNewVersion();
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
            $('#dlgOrderNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
