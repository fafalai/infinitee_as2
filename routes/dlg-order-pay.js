function doDlgOrdePay(order)
{
  $('#dlgOrderPay').dialog
  (
    {
      title: 'Make payment for order: ' + order.orderno,
      onClose: function()
      {
        $('#fldOrderPayAmount').numberbox('clear');

        $('#fldCCNo').val('');
        $('#fldCCName').val('');
        $('#fldExpiry').val('');
        $('#fldCCCVC').val('');
      },
      onOpen: function()
      {
      },
      buttons:
      [
        {
          text: 'Pay Now',
          handler: function()
          {
            var amount = $('#fldOrderPayAmount').numberbox('getValue');

            if (_.isBlank(amount) || (amount == 0))
            {
              doMandatoryTextbox('Please enter a non-zero amount to pay ', 'fldOrderPayAmount');
              return;
            }

            doServerDataMessage('orderpay', {orderid: order.id, amount: amount}, {type: 'refresh'});
            $('#dlgOrderPay').dialog('close');
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgOrderPay').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

