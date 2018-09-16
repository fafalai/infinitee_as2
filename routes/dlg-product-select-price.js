function doDlgProductSelectPrice(productid, qty, productname, clientid, callback)
{
  function doGetProductPrices(ev, args)
  {
    var accept = true;
    var data = [];

    args.data.rs.forEach
    (
      function(p)
      {
        // If we're given a client AND the price has an assigned client, only accept if they match
        if (!_.isUndefined(clientid) && !_.isNull(p.clientid))
          accept = (clientid == p.clientid);
        else
          accept = true;

        if (accept)
        {
          data.push
          (
            {
              id: doNiceId(p.id),
              clientid: p.clientid,
              price: p.unitprice,
              price1: p.unitprice1,
              price2: p.unitprice2,
              price3: p.unitprice3,
              price4: p.unitprice4,
              price5: p.unitprice5,
              minqty: p.minqty,
              maxqty: p.maxqty
            }
          );
        }
      }
    );

    $('#divProductSelectPriceG').datagrid('loadData', data);
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('getproductprices', doGetProductPrices);

  $('#dlgProductSelectPrice').dialog
  (
    {
      title: 'Prices for ' + productname,
      onClose: function()
      {
        $('#divEvents').off('getproductprices', doGetProductPrices);
      },
      onOpen: function()
      {
        $('#divProductSelectPriceG').datagrid
        (
          {
            idField: 'id',
            fitColumns: false,
            singleSelect: true,
            rownumbers: true,
            striped: true,
            columns:
            [
              [
                {title: 'Price',   rowspan: 2, field: 'price',  width: 100, align: 'right', resizable: true, styler: function(value, row, index) {if (!_.isNull(row.clientid)) return css_gridcol_client_price;}, formatter: function(value, row, index) {return _.niceformatnumber(value);}, align: 'right'},
                {title: 'Level',   colspan: 5},
                {title: 'Min Qty', rowspan: 2, field: 'minqty', width: 100, align: 'right', resizable: true, formatter: function(value, row, index) {return _.niceformatqty(value);}, align: 'right'},
                {title: 'Max Qty', rowspan: 2, field: 'maxqty', width: 100, align: 'right', resizable: true, formatter: function(value, row, index) {return _.niceformatqty(value);}, align: 'right'}
              ],
              [
                {title: '1',                   field: 'price1', width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}, align: 'right'},
                {title: '2',                   field: 'price2', width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}, align: 'right'},
                {title: '3',                   field: 'price3', width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}, align: 'right'},
                {title: '4',                   field: 'price4', width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}, align: 'right'},
                {title: '5',                   field: 'price5', width: 100, align: 'right', resizable: true, editor: {type: 'numberbox', options: {groupSeparator: ',', precision: 2}}, formatter: function(value, row, index) {return _.niceformatnumber(value);}, align: 'right'},
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
            },
            onLoadSuccess: function(data)
            {
              if (data.rows.length > 0)
              {
                // Let's highlight the ones we think should match...
                if (data.rows.length == 1)
                  $('#divProductSelectPriceG').datagrid('selectRow', 0);
                else
                {
                  var q = null;
                  var minqty = null;
                  var maxqty = null;

                  for (var i = 0; i < data.rows.length; i++)
                  {
                    q = _.toBigNum(qty);
                    minqty = _.toBigNum(data.rows[i].minqty);
                    maxqty = _.toBigNum(data.rows[i].maxqty);

                    if (minqty.isZero() && maxqty.isZero())
                    {
                      // Start by selecting "ordinary" prices with no volume discounts etc
                      // Don't break here, we continue in case we find a more approriate price by min/max qty...
                      $('#divProductSelectPriceG').datagrid('selectRow', i);
                    }
                    else if (minqty.greaterThan(0.0) && maxqty.greaterThan(0.0))
                    {
                      if (q.greaterThanOrEqualTo(minqty) && maxqty.greaterThanOrEqualTo(q))
                      {
                        $('#divProductSelectPriceG').datagrid('selectRow', i);
                        break;
                      }
                    }
                    else if (maxqty.greaterThanOrEqualTo(q))
                    {
                      $('#divProductSelectPriceG').datagrid('selectRow', i);
                      break;
                    }
                    else if (q.greaterThanOrEqualTo(minqty))
                    {
                      $('#divProductSelectPriceG').datagrid('selectRow', i);
                      break;
                    }
                  }
                }
              }
            },
            onDblClickCell: function(index, field, value)
            {
              if (!_.isUndefined(callback) && !_.isNull(callback))
              {
                var row = $(this).datagrid('getSelected');
                callback(row.price);
              }
              $('#dlgProductSelectPrice').dialog('close');
            }
          }
        );

        doServerDataMessage('getproductprices', {productid: productid}, {type: 'refresh'});
      },
      buttons:
      [
        {
          text: 'Select',
          handler: function()
          {
            doGridGetSelectedRowData
            (
              'divProductSelectPriceG',
              function(row)
              {
                if (!_.isUndefined(callback) && !_.isNull(callback))
                  callback(row.price);
              }
            );

            $('#dlgProductSelectPrice').dialog('close');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgProductSelectPrice').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
