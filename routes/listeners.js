function doWidgetListeners()
{
  doDashTabWidgets();

  // Immediately load TABs that we need to interact with, delay the rest...
  doOrdersTabWidgets();
  doInvoicesTabWidgets();
  doClientsTabWidgets();

  doPOrdersTabWidgets();
  doSuppliersTabWidgets();

  doProductsTabWidgets();
  doProductCategoriesTabWidgets();
  doLocationsTabWidgets();
  doBuildTemplatesTabWidgets();
  doInvStockTabWidgets();
  doJobSheetsTabWidgets();
  doBuildsTabWidgets();

  doExchangeRatesTabWidgets();

  doEmployeesTabWidgets();
  doSuperfundsTabWidgets();
  doTimeclockTabWidgets();
  doPortfolioTabWidgets();

  doAccountsTabWidgets();
  doTaxCodesTabWidgets();
  doJournalsTabWidgets();

  doUsersTabWidgets();
  doStatusAlertsTabWidgets();
  doProductTemplatesTabWidgets();
  doTemplatesTabWidgets();
  doEmailsTabWidgets();
  doMaintenanceTabWidgets();

  /*
  $('#as1tabs').tabs
  (
    {
      onSelect: function(title, index)
      {
        switch (title)
        {
          case 'Command TAB':
            break;
          case 'Dashboard':
            doDashTabWidgets();
            break;
          case 'Sales':
            doOrdersTabWidgets();
            doInvoicesTabWidgets();
            doClientsTabWidgets();
            break;
          case 'Purchasing':
            doPOrdersTabWidgets();
            doSuppliersTabWidgets();
            break;
          case 'Inventory':
            doProductsTabWidgets();
            doProductCategoriesTabWidgets();
            doLocationsTabWidgets();
            doBuildTemplatesTabWidgets();
            doInvStockTabWidgets();
            doJobSheetsTabWidgets();
            doBuildsTabWidgets();
            break;
          case 'Banking':
            doExchangeRatesTabWidgets();
            break;
          case 'Payroll':
            //doTimesheetsTabWidgets();
            doEmployeesTabWidgets();
            doSuperfundsTabWidgets();
            doTimeclockTabWidgets();
            doPortfolioTabWidgets();
            break;
          case 'Accounts':
            doAccountsTabWidgets();
            doTaxCodesTabWidgets();
            doJournalsTabWidgets();
          case 'Maintenance':
            doUsersTabWidgets();
            doStatusAlertsTabWidgets();
            doProductTemplatesTabWidgets();
            doTemplatesTabWidgets();
            doEmailsTabWidgets();
            doMaintenanceTabWidgets();
            break;
        }
      }
    }
  );
  */
}
