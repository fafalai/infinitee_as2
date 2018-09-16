function doIntroTabOrders()
{
  var intro = introJs();

  intro.setOptions
  (
    {
      steps:
      [
        {
          intro: 'Grid containing all active <span class="txtboldblue">Orders</span>. You can also right mouse click on an entry to view a context menu of actions you can perform on the selected order.'
        },
        {
          element: document.querySelector('#tbOrdersNew'),
          intro: 'Create a new order or quote (see Maintenance settings)'
        },
        {
          element: document.querySelector('#tbOrdersClear'),
          intro: 'Clears the currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersEdit'),
          intro: 'Enters edit mode for the currently selected order - click on Cancel or Save button when done'
        },
        {
          element: document.querySelector('#tbOrdersCancel'),
          intro: 'Cancels the current edits and reverts the entry'
        },
        {
          element: document.querySelector('#tbOrdersSave'),
          intro: 'Saves the currently edited order'
        },
        {
          element: document.querySelector('#tbOrdersRemove'),
          intro: 'Removes (expires) the currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersPrint'),
          intro: 'Prints the currently selected order as a downloadable Excel spreadsheet'
        },
        {
          element: document.querySelector('#tbOrdersEmail'),
          intro: 'Email the currently selected order as an attached Excel spreadsheet'
        },
        {
          element: document.querySelector('#tbOrdersDuplicate'),
          intro: 'Duplicates (copies) the currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersDetails'),
          intro: 'List the products (details) of currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersStatuses'),
          intro: 'List the status history of currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersNotes'),
          intro: 'List notes of currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersAttachments'),
          intro: 'List attachments (files, images etc) of currently selected order'
        },
        {
          element: document.querySelector('#tbOrdersNewVersion'),
          intro: 'Create a new version of the currently selected order - don\'t to select the active versionn when done'
        },
        {
          element: document.querySelector('#tbOrderSearch'),
          intro: 'Search for orders using various filters'
        },
        {
          element: document.querySelector('#tbOrdersInvoice'),
          intro: 'Convert the currently selected order to an invoice - will appear in Invoices TAB when ready'
        },
        {
          element: document.querySelector('#tbOrdersInfo'),
          intro: 'The online list of hints you are currently viewing'
        }
      ]
    }
  );

  intro.start();
}

function doIntroTabProducts()
{
  var intro = introJs();

  intro.setOptions
  (
    {
      steps:
      [
        {
          intro: 'Grid containing all active <span class="txtboldblue">Products</span>. You can also right mouse click on an entry to view a context menu of actions you can perform on the selected order.'
        },
        {
          element: document.querySelector('#tbProductsNew'),
          intro: 'Create a new product - you need to select a product category first'
        },
        {
          element: document.querySelector('#tbProductsClear'),
          intro: 'Clears the currently selected product'
        },
        {
          element: document.querySelector('#tbProductsEdit'),
          intro: 'Enters edit mode for the currently selected product - click on Cancel or Save button when done'
        },
        {
          element: document.querySelector('#tbProductsCancel'),
          intro: 'Cancels the current edits and reverts the entry'
        },
        {
          element: document.querySelector('#tbProductsSave'),
          intro: 'Saves the currently edited product'
        },
        {
          element: document.querySelector('#tbProductsRemove'),
          intro: 'Removes (expires) the currently selected product'
        },
        {
          element: document.querySelector('#tbProductsDuplicate'),
          intro: 'Duplicates (copies) the currently selected product'
        },
        {
          element: document.querySelector('#tbProductsViewPrices'),
          intro: 'List the prices assigned to the currently selected product'
        },
        {
          element: document.querySelector('#tbProductsViewBarcodes'),
          intro: 'Show product barcode of currently selected product (if any) using various styles'
        },
        {
          element: document.querySelector('#tbProductSearch'),
          intro: 'Search for product using various filters'
        },
        // TODO: Hints don't seem to work for combobox inside toolbar...
        // May be need to get at the textbox inside of it?
        {
          element: $('#cbProductsCategories').textbox('textbox'),//document.querySelector('#cbProductsCategories'),
          intro: 'List of product categories'
        },
        {
          element: document.querySelector('#tbProductsInfo'),
          intro: 'The online list of hints you are currently viewing'
        }
      ]
    }
  );

  intro.start();
}

function doIntroTabClients()
{
  var intro = introJs();

  intro.setOptions
  (
    {
      steps:
      [
        {
          intro: 'Grid containing all active <span class="txtboldblue">Clients</span>. You can also right mouse click on an entry to view a context menu of actions you can perform on the selected order.'
        },
        {
          element: document.querySelector('#tbClientsNewRoot'),
          intro: 'Create a new top level client - to create a sub-client, right mouse click on an existing client then select Add from the context menu'
        },
        {
          element: document.querySelector('#tbClientsClear'),
          intro: 'Clears the currently selected order'
        },
        {
          element: document.querySelector('#tbClientsEdit'),
          intro: 'Enters edit mode for the currently selected order - click on Cancel or Save button when done'
        },
        {
          element: document.querySelector('#tbClientsCancel'),
          intro: 'Cancels the current edits and reverts the entry'
        },
        {
          element: document.querySelector('#tbClientsSave'),
          intro: 'Saves the currently edited order'
        },
        {
          element: document.querySelector('#tbClientsRemove'),
          intro: 'Removes (expires) the currently selected order'
        },
        {
          element: document.querySelector('#tbClientsNotes'),
          intro: 'List notes of currently selected order'
        },
        {
          element: document.querySelector('#tbClientsAttachments'),
          intro: 'List attachments (files, images etc) of currently selected order'
        },
        {
          element: document.querySelector('#tbClientsNewOrder'),
          intro: 'Create a new order for this client'
        },
        /*
        {
          element: document.querySelector('#cbClientsShowInactiveorAll'),
          intro: 'Toggle showing only active clients or all clients'
        },
        */
        {
          element: document.querySelector('#tbClientsInfo'),
          intro: 'The online list of hints you are currently viewing'
        }
      ]
    }
  );

  intro.start();
}

function doIntroTabBuildTemplates()
{
  var intro = introJs();

  intro.setOptions
  (
    {
      steps:
        [
          {
            intro: 'Grid containing all active <span class="txtboldblue">Build Templates</span>. You can also right mouse click on an entry to view a context menu of actions you can perform on the selected order.'
          },
          {
            element: document.querySelector('#tbBuildTemplatesNewRoot'),
            intro: 'Create a new top level template - to create a sub-template, right mouse click on an existing template then select Add from the context menu'
          },
          {
            element: document.querySelector('#tbBuildTemplatesClear'),
            intro: 'Clears the currently selected template'
          },
          {
            element: document.querySelector('#tbBuildTemplatesEdit'),
            intro: 'Enters edit mode for the currently selected template - click on Cancel or Save button when done'
          },
          {
            element: document.querySelector('#tbBuildTemplatesCancel'),
            intro: 'Cancels the current edits and reverts the entry'
          },
          {
            element: document.querySelector('#tbBuildTemplatesSave'),
            intro: 'Saves the currently edited template'
          },
          {
            element: document.querySelector('#tbBuildTemplatesRemove'),
            intro: 'Removes (expires) the currently selected template'
          },
          {
            element: document.querySelector('#tbBuildTemplatesDuplicate'),
            intro: 'Duplicate (copy) selected template'
          },
          {
            element: document.querySelector('#tbBuildTemplatesDetails'),
            intro: 'List raw materials used by selected template'
          },
          {
            element: document.querySelector('#tbBuildTemplatesMasterSync'),
            intro: 'Sync all build template info except pricing from master product templates'
          },
          {
            element: document.querySelector('#tbBuildTemplatesBuild'),
            intro: 'Build a product using selected template'
          },
          {
            element: document.querySelector('#tbBuildTemplatesInfo'),
            intro: 'The online list of hints you are currently viewing'
          }
        ]
    }
  );

  intro.start();
}
