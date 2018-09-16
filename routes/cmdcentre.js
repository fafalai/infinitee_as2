 var cmdcentreConfig =
 {
   container: '#divCmdCentre',
   rootOrientation: 'NORTH',
   nodeAlign: 'BOTTOM',
   hideRootNode: true,
   levelSeparation: 40,
   siblingSeparation: 30,
   subTeeSeparation: 20,
   connectors:
   {
     //type: 'step',
     style:
     {
       'stroke-width': 2
     }
   },
   node:
   {
     HTMLclass: 'commandcentre'
   }
 };
var noderoot = {};
var nodesales =
{
  parent: noderoot,
  text: {name: 'Sales'},
  image: 'js/easyui/themes/icons/sale.png',
  stackChildren: true,
  HTMLid: 'nodesales',
  link: {href: 'javascript:doSelectSalesTab(0)'},
  connectors:
  {
    style:
    {
      'stroke': '#8080ff',
      'arrow-end': 'oval-wide-long'
    }
  },
  children:
  [
    {
      text: {name: 'Clients'},
      stackChildren: true,
      link: {href: 'javascript:doSelectSalesTab(\'Clients\')'},
      connectors:
      {
        style:
          {
            'stroke': '#00ce67',
            'arrow-end': 'block-wide-long'
          }
      },
      children:
      [
        {
          text: {name: 'Orders'},
          stackChildren: true,
          link: {href: 'javascript:doSelectSalesTab(\'Orders\')'},
          connectors:
          {
            style:
            {
              'stroke': '#00ce67',
              'arrow-end': 'block-wide-long'
            }
          },
          children:
          [
            {
              text: {name: 'Invoices'},
              stackChildren: true,
              link: {href: 'javascript:doSelectSalesTab(\'Invoices\')'},
              connectors:
              {
                style:
                {
                  'stroke': '#00ce67',
                  'arrow-end': 'block-wide-long'
                }
              },
              children:
              [
                {
                  text: {name: 'Payments'},
                  stackChildren: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      text: {name: 'Suppliers'},
      stackChildren: true,
      link: {href: 'javascript:doSelectPurchasingTab(\'Suppliers\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      },
      children:
      [
        {
          text: {name: 'P.O.s'},
          stackChildren: true,
          link: {href: 'javascript:doSelectPurchasingTab(\'Purchase Orders\')'},
          connectors:
          {
            style:
            {
              'stroke': '#00ce67',
              'arrow-end': 'block-wide-long'
            }
          }
        }
      ]
    }
  ]
};
var nodejobsheets =
{
  parent: noderoot,
  text: {name: 'Job Sheets'},
  image: 'js/easyui/themes/icons/orderform.png',
  stackChildren: true,
  HTMLid: 'nodejobsheets',
  link: {href: 'javascript:doSelectJobSheetsTab()'},
  connectors:
  {
    style:
    {
     'stroke': '#8080ff',
     'arrow-end': 'oval-wide-long'
    }
  },
  children:
  [
    {
      text: {name: 'Builds'},
      stackChildren: true,
      link: {href: 'javascript:doSelectInventoryTab(\'Builds\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    }
  ]
};
var nodeinventory =
{
  parent: noderoot,
  text: {name: 'Inventory'},
  image: 'js/easyui/themes/icons/inventory.png',
  stackChildren: true,
  HTMLid: 'nodeinventory',
  link: {href: 'javascript:doSelectInventoryTab(0)'},
  connectors:
  {
    style:
    {
     'stroke': '#8080ff',
     'arrow-end': 'oval-wide-long'
    }
  },
  children:
  [
    {
      text: {name: 'Categories'},
      stackChildren: true,
      link: {href: 'javascript:doSelectInventoryTab(\'Categories\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      },
      children:
      [
        {
          text: {name: 'Products'},
          stackChildren: true,
          link: {href: 'javascript:doSelectInventoryTab(\'Products\')'},
        }
      ]
    },
    {
      text: {name: 'Templates'},
      stackChildren: true,
      link: {href: 'javascript:doSelectInventoryTab(\'Build Templates\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    {
      text: {name: 'Locations'},
      stackChildren: true,
      link: {href: 'javascript:doSelectInventoryTab(\'Locations\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      },
      children:
      [
        {
          text: {name: 'Stock'},
          stackChildren: true,
          link: {href: 'javascript:doSelectInventoryTab(\'Stock\')'},
          connectors:
          {
            style:
            {
              'stroke': '#00ce67',
              'arrow-end': 'block-wide-long'
            }
          }
        }
      ]
    }
  ]
};
var nodeaccounts =
{
  parent: noderoot,
  text: {name: 'Accounts'},
  image: 'js/easyui/themes/icons/accounts.png',
  stackChildren: true,
  HTMLid: 'nodeaccounts',
  link: {href: 'javascript:doSelectAccountsTab(0)'},
  connectors:
  {
    style:
    {
      'stroke': '#8080ff',
      'arrow-end': 'oval-wide-long'
    }
  },
  children:
  [
    {
      text: {name: 'Accounts'},
      stackChildren: true,
      link: {href: 'javascript:doSelectAccountsTab(\'Accounts\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    {
      text: {name: 'Tax Codes'},
      stackChildren: true,
      link: {href: 'javascript:doSelectAccountsTab(\'Tax Codes\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    {
      text: {name: 'Journals'},
      stackChildren: true,
      link: {href: 'javascript:doSelectAccountsTab(\'Journals\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    }
  ]
};
var nodepayroll =
{
  parent: noderoot,
  text: {name: 'Payroll'},
  image: 'js/easyui/themes/icons/cash.png',
  stackChildren: true,
  HTMLid: 'nodepayroll',
  link: {href: 'javascript:doSelectPayrollTab(0)'},
  connectors:
  {
    style:
    {
      'stroke': '#8080ff',
      'arrow-end': 'oval-wide-long'
    }
  },
  children:
  [
    {
      text: {name: 'Employees'},
      stackChildren: true,
      link: {href: 'javascript:doSelectPayrollTab(\'Employees\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    /*
    {
      text: {name: 'Timesheets'},
      stackChildren: true,
      link: {href: 'javascript:doSelectPayrollTab(1)'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    */
    {
      text: {name: 'Superfunds'},
      stackChildren: true,
      link: {href: 'javascript:doSelectPayrollTab(\'Superfunds\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    {
      text: {name: 'Timeclock'},
      stackChildren: true,
      link: {href: 'javascript:doSelectPayrollTab(\'Time Clock\')'},
      connectors:
      {
        style:
        {
          'stroke': '#00ce67',
          'arrow-end': 'block-wide-long'
        }
      }
    },
    {
      text: {name: 'Portfolio'},
      stackChildren: true,
      link: {href: 'javascript:doSelectPayrollTab(\'Provectus\')'},
      connectors:
      {
        style:
          {
            'stroke': '#00ce67',
            'arrow-end': 'block-wide-long'
          }
      }
    }
  ]
};
var allowednodes = [cmdcentreConfig, noderoot, nodesales, nodejobsheets, nodeinventory, nodeaccounts, nodepayroll];


