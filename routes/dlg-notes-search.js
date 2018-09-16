function doDlgNoteSearch(searchcallback, resetcallback)
{
  function doReset()
  {
    $('#fldSearchClientNoteText').textbox('clear');

    if (!_.isUndefined(resetcallback) && !_.isNull(resetcallback))
      resetcallback();
  }

  $('#dlgClientNoteSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        doTextboxFocus('fldSearchClientNoteText');
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var text = $('#fldSearchClientNoteText').textbox('getValue');

            if (!_.isUndefined(searchcallback) && !_.isNull(searchcallback))
              searchcallback(text);
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
            $('#dlgClientNoteSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
