function doWidgetListeners()
{
  $('#asclienttabs').tabs
  (
    {
      onSelect: function(title, index)
      {
        switch (index)
        {
          case 0:
            // Orders TAB...
            break;
          case 1:
            // Invoices...
            break;
          case 2:
            // Chat
            doChatTabWidgets();
            break;
        }
      }
    }
  );

  $('#divEvents').on
  (
    'refresh-all',
    function(ev, args)
    {
      doRefreshAll();
    }
  );
}
