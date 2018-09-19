function doListPriceCodeTabWidgets()
{
    // doServerDataMessage('listlistpricecode', {type: 'refresh'}); 
    doRefresh();
    var selectedRowIndex;
    var editingIndex = null;
    var tb =
    [
      {
        text: 'New',
        iconCls: 'icon-add',
        handler: doNew
      },
      {
        text: 'Clear',
        iconCls: 'icon-clear',
        handler: doClear
      },
      {
        text: 'Edit',
        iconCls: 'icon-edit',
        handler: doEdit
      },
      {
        text: 'Cancel',
        iconCls: 'icon-cancel',
        handler: doCancel
      },
      {
        text: 'Save',
        iconCls: 'icon-save',
        handler: doSave
      },
      {
        text: 'Remove',
        iconCls: 'icon-remove',
        handler: doRemove
      }
      // {
      //   text:'Refresh',
      //   iconCls:'icon-refreshlist',
      //   hendlre:doRefresh
      // }
    ];

    function doNew()
    {
      doServerDataMessage('newlistpricecode', {type: 'refresh'});
    }
  
    function doClear()
    {
      $('#divListPriceCodeG').datagrid('clearSelections');
    }
  
    function doEdit()
    {
      if(!doGridStartEdit
        (
          'divListPriceCodeG',
          editingIndex,
          function(row, index)
          {
            editingIndex = index;
    
            doGridGetEditor
            (
              'divListPriceCodeG',
              editingIndex,
              'full_name',
              function(ed)
              {
              }
            );
          }
        ))
        
        {
          doShowWarning('Please select a row first');
        }
    }
  
    function doCancel()
    {
      editingIndex = doGridCancelEdit('divListPriceCodeG', editingIndex);
      //doGridCancelEdit('divListPriceCodeG', editingIndex);
    }
  
    function doSave()
    {
      if(!doGridEndEditGetRow
        (
          'divListPriceCodeG',
          editingIndex,
          function(row)
          {
            //console.log(row);
           
            doServerDataMessage('savelistpricecode', {listpricecodeid: row.id, fullname: row.full_name, shortname: row.short_name,parameter: row.parameter},{type: 'refresh'});
            editingIndex = null;
          }
        ))
        {
          doShowWarning('Please select a row first');
        }
    }
  
    function doRemove()
    {
      if (!doGridGetSelectedRowData
        (
          'divListPriceCodeG',
          function(row)
          {
            doPromptOkCancel
            (
              'Remove selected discount code?',
              function(result)
              {
                if (result)
                  doServerDataMessage('expirelistpricecode', {listpricecodeid: row.id}, {type: 'refresh'});
              }
            );
          }
        ))
      {
        doShowWarning('Please select a row to remove');
      }
    }
    
   function doRefresh()
   {
     console.log("tab-listpricecode, refresh");
      doServerDataMessage('listlistpricecode', {type: 'refresh'}); 
   }


   $('#divEvents').on
   (
    'listlistpricecode', 
    function(ev, args)
    {
        var data = [];
        //console.log(args.data.rs);
        //console.log(args.pdata);
        args.data.rs.forEach
        (
            function(p)
            {
                //console.log(p);
                data.push
                (
                    {
                    id: doNiceId(p.id),
                    full_name:p.full_name,
                    short_name:p.short_name,
                    parameter: p.parameter,
                    date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                    by: doNiceModifiedBy(p.datemodified,p.usermodified, p.usercreated)
                    }
                );
            }
        );
        //console.log(data);
        $('#divListPriceCodeG').datagrid('loadData', data);
        //$('#divDiscountCode').datagrid('reload');
    
    }
   );

   $('#divEvents').on('listpricecodeupdated', doRefresh);


    $('#divListPriceCodeG').datagrid
    (
      {
        idField: 'id',
        fitColumns: false,
        singleSelect: true,
        rownumbers: true,
        striped: true,
        toolbar: tb,
        sortName:'id',
        sortOrder:'asc',
        //data:cache_discountcode,
        columns:
        [
            [
                {field:'full_name',title:'Full Name',width:90,align:'left',resizable:true,editor:{type:'textbox'}},
                {field:'short_name',title:'Short Name',width:90,align:'left',resizable:true,editor:{type:'textbox'}},
                {field:'parameter',title:'Parameter',width:100,align:'left',resizable:true,editor:{type:'numberbox',options:{precision:2,groupSeparator:',',decimalSeparator:'.'}}},
                {title: 'Modified', field: 'date', width: 150, align: 'left', resizable: true},
                {title: 'By',       field: 'by',   width: 80, align: 'left',  resizable: true}
            ]
        ],
        onRowContextMenu: function(e, index, row)
        {
          //doGridContextMenu('divProductPricesG', 'divProductPricesMenuPopup', e, index, row);
        },
        onDblClickCell: function(index, field, value)
        {
          doGridStartEdit
          (
            'divListPriceCodeG',
            editingIndex,
            function(row, index)
            {
              editingIndex = index;

              if (['date', 'by'].indexOf(field) != -1)
                field = 'full_name';

              doGridGetEditor
              (
                'divListPriceCodeG',
                editingIndex,
                field,
                function(eds)
                {
                   //console.log("selected row index is: " + editingIndex);
                   selectedRowIndex = editingIndex;
                }
              );
            }
          );
        }
      }
    );

    
}