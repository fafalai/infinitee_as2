function doDlgHelp()
{
  $('#dlgHelp').dialog
  (
    {
      openAnimation: 'fade',
      openDuration: 500,
      closeAnimation: 'slide',
      onClose: function()
      {
      },
      onOpen: function()
      {
      },
      buttons:
      [
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgHelp').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

