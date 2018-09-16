function doVoiceCommands()
{
  // ************************************************************************************************************************************************************************
  // Voice commands
  if (annyang)
  {
    var vcmdOrdersDashboard = function()
    {
      doShowInfo('Received voice command: Switching to orders dashboard');
      doSelectDashTab(0);
    };
    var vcmdOrdersCreate = function()
    {
      doShowInfo('Received voice command: Preparing to create new order');
      doSelectSalesTab('Orders');
      $('#divEvents').trigger('orderspopup', 'clear');
      $('#divEvents').trigger('orderspopup', 'new');
    };
    var vcmdOrdersCreateFor = function(splat)
    {
      var client = _.truncate(splat, 50, '');
      var f = new Fuse(cache_clients, {keys: ['name'], caseSensitive: false, shouldSort: true});
      var results = [];

      doSelectSalesTab('Orders');
      $('#divEvents').trigger('orderspopup', 'clear');
      $('#divEvents').trigger('orderspopup', 'new');

      results = f.search(client);
      if (results.length > 0)
      {
        $('#cbNewOrderClients').combotree('setValue', results[0].id);
        doShowInfo('Received voice command: Preparing to create new order for [' + results[0].name + ']');
      }
      else
        doShowInfo('Received voice command: Preparing to create new order but couldn\'t find matching client name');
    };
    var vcmdOrdersSearch = function(splat)
    {
      doSelectSalesTab('Orders');
      $('#divEvents').trigger('orderspopup', 'search');

      if (!_.isUndefined(splat))
      {
        // TODO: assuming the search dialog is up and running now...
        var orderno = _.truncate(splat, 50, '');
        //
        doShowInfo('Received voice command: Search for orders with [' + orderno + ']');
        $('#fldSearchOrderNo').textbox('setValue', orderno);

        primus.emit('searchorders', {fguid: fguid, uuid: uuid, session: session, orderno: orderno, pdata: 'refresh'});
      }
      else
        doShowInfo('Received voice command: Search for orders');
    };
    var vcmdJobSheetEdit = function(splat)
    {
      var jobsheetno = _.truncate(splat, 50, '');
      doSelectInventoryTab('Job Sheets');
      $('#divEvents').trigger('selectjobsheetbyorderno', {jobsheetno: jobsheetno});
    };
    var vcmdCalculateTimes = function(term1, term2)
    {
      var t1 = _.formatnumber(term1, 2);
      var t2 = _.formatnumber(term2, 2);
      var result = _.formatnumber(t1 * t2, 2);
      //
      doShowResults(t1 + ' x ' + t2 + ' is [' + result + ']');
    };
    var vcmdCalculateDivide = function(term1, term2)
    {
      var t1 = _.formatnumber(term1, 2);
      var t2 = _.formatnumber(term2, 2);
      var result = _.formatnumber(t1 / t2, 2);
      //
      doShowResults(t1 + ' / ' + t2 + ' is [' + result + ']');
    };
    var vcmdCalculatePlus = function(term1, term2)
    {
      var t1 = _.formatnumber(term1, 2);
      var t2 = _.formatnumber(term2, 2);
      var result = _.formatnumber(t1 + t2, 2);
      //
      doShowResults(t1 + ' + ' + t2 + ' is [' + result + ']');
    };
    var vcmdCalculateMinus = function(term1, term2)
    {
      var t1 = _.formatnumber(term1, 2);
      var t2 = _.formatnumber(term2, 2);
      var result = _.formatnumber(t1 - t2, 2);
      //
      doShowResults(t1 + ' - ' + t2 + ' is [' + result + ']');
    };
    var vcmdCalculatePercent = function(term1, term2)
    {
      var t1 = _.formatnumber(term1, 2);
      var t2 = _.formatnumber(term2, 2);
      var result = ((t1 == 0.00) && (t2 == 0.00)) ? 0.00 : _.formatnumber((t2 * t1) / 100.0, 2);
      //
      doShowResults('% of ' + t2 + ' is [' + result + ']');
    };
    var vcmdCalculateMarkup = function(term1, term2)
    {
      var t1 = _.formatnumber(term1, 2);
      var t2 = _.formatnumber(term2, 2);
      var result = ((t1 == 0.00) && (t2 == 0.00)) ? 0.00 : _.formatnumber(((t2 * t1) / 100.0) + t2, 2);
      //
      doShowResults(t1 + '% markup on ' + t2 + ' is [' + result + ']');
    };
    var commands =
    {
      'XXX_VOICEPREFIXNAME order(s) dashboard': vcmdOrdersDashboard,

      'XXX_VOICEPREFIXNAME create order': vcmdOrdersCreate,
      'XXX_VOICEPREFIXNAME create new order': vcmdOrdersCreate,
      'bXXX_VOICEPREFIXNAME create (new) order for *client': vcmdOrdersCreateFor,

      'XXX_VOICEPREFIXNAME search (for) order(s)': vcmdOrdersSearch,
      'XXX_VOICEPREFIXNAME search (for) order *orderno': vcmdOrdersSearch,

      'XXX_VOICEPREFIXNAME (go to) job (sheet) :jobsheet': vcmdJobSheetEdit,
      'XXX_VOICEPREFIXNAME (goto) job (sheet) :jobsheet': vcmdJobSheetEdit,

      'XXX_VOICEPREFIXNAME calculate :term1 times :term2': vcmdCalculateTimes,
      'XXX_VOICEPREFIXNAME calculate :term1 divide(d) (by) :term2': vcmdCalculateDivide,
      'XXX_VOICEPREFIXNAME calculate :term1 + :term2': vcmdCalculatePlus,
      'XXX_VOICEPREFIXNAME calculate :term1 minus :term2': vcmdCalculateMinus,
      'XXX_VOICEPREFIXNAME calculate :term1 percent of :term2': vcmdCalculatePercent,
      'XXX_VOICEPREFIXNAME calculate :term1 percent on :term2': vcmdCalculateMarkup,
    };

    annyang.debug();
    annyang.addCommands(commands);
    annyang.setLanguage('en');
    annyang.start();
  }
  else
    console.log('***** Voice commands not available');
}
