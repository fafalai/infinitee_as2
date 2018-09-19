function doDiscountCodeTabWidgets()
{
    doServerDataMessage('listdiscountcode', {type: 'refresh'}); 
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
    ];

    function doNew()
    {
      doServerDataMessage('newdiscountcode', {type: 'refresh'});
    }
  
    function doClear()
    {
      $('#divDiscountCode').datagrid('clearSelections');
    }
  
    function doEdit()
    {
      doGridStartEdit
      (
        'divDiscountCode',
        editingIndex,
        function(row, index)
        {
          editingIndex = index;
  
          doGridGetEditor
          (
            'divDiscountCode',
            editingIndex,
            'full_name',
            function(ed)
            {
            }
          );
        }
      );
    }
  
    function doCancel()
    {
      editingIndex = doGridCancelEdit('divDiscountCode', editingIndex);
    }
  
    function doSave()
    {
      if(!doGridEndEditGetRow
        (
          'divDiscountCode',
          editingIndex,
          function(row)
          {
            //console.log(row);
           
            doServerDataMessage('savediscountcode', {discountcodeid: row.id, fullname: row.full_name, shortname: row.short_name, 
              level1: (row.level_1 * 0.01), level2: (row.level_2 * 0.01), level3: (row.level_3 * 0.01), level4: (row.level_4 * 0.01), level5: (row.level_5 * 0.01), 
              level6: (row.level_6 * 0.01), level7: (row.level_7 * 0.01),level8: (row.level_8 * 0.01), level9: (row.level_9 * 0.01), level10: (row.level_10 * 0.01), 
              level11: (row.level_11 * 0.01),level12: (row.level_12 * 0.01), level13: (row.level_13 * 0.01), level14: (row.level_14 * 0.01),level15: (row.level_15 * 0.01)},
              {type: 'refresh'});
              editingIndex = null;
          }
        ))
        {
          doShowWarning('Please select a row to Update');
        }
    }
  
    function doRemove()
    {
      if (!doGridGetSelectedRowData
        (
          'divDiscountCode',
          function(row)
          {
            doPromptOkCancel
            (
              'Remove selected discount code?',
              function(result)
              {
                if (result)
                  doServerDataMessage('expirediscountcode', {discountcodeid: row.id}, {type: 'refresh'});
              }
            );
          }
        ))
      {
        doShowWarning('Please select a row to remove');
      }
    }
  
  
    function doSaved(ev, args)
    {
      doServerDataMessage('listdiscountcode', {type: 'refresh'}); 
    }
  
    function doLoad(ev, args)
    {
      var data = [];
      console.log(args.data.rs);
      console.log(args.pdata);
  
      args.data.rs.forEach
      (
        function(p)
        {
          data.push
          (
            {
              id: doNiceId(p.id),
              full_name:p.full_name,
              short_name:p.short_name,
              level_1: p.level_1,
              level_2: p.level_2,
              level_3: p.level_3,
              level_4: p.level_4,
              level_5: p.level_5,
              level_6: p.level_6,
              level_7: p.level_7,
              level_8: p.level_8,
              level_9: p.level_9,
              level_10: p.level_10,
              level_11: p.level_11,
              level_12: p.level_12,
              level_13: p.level_13,
              level_14: p.level_14,
              level_15: p.level_15,
              date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
              by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
            }
          );
        }
      );
      console.log(data);
  
      $('#divDiscountCode').datagrid('loadData', data);
        
    }


   $('#divEvents').on
   (
    'listdiscountcode', 
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
                    level_1: (parseFloat(p.level_1)*100).toFixed(2),
                    level_2:!_.isNull(p.level_2) ? (parseFloat(p.level_2)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    //level_2: (parseFloat(p.level_2)*100).toFixed(2),
                    level_3: !_.isNull(p.level_3) ? (parseFloat(p.level_3)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_4: !_.isNull(p.level_4) ? (parseFloat(p.level_4)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_5: !_.isNull(p.level_5) ? (parseFloat(p.level_5)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_6: !_.isNull(p.level_6) ? (parseFloat(p.level_6)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_7: !_.isNull(p.level_7) ? (parseFloat(p.level_7)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_8: !_.isNull(p.level_8) ? (parseFloat(p.level_8)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_9: !_.isNull(p.level_9) ? (parseFloat(p.level_9)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_10: !_.isNull(p.level_10) ? (parseFloat(p.level_10)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_11: !_.isNull(p.level_11) ? (parseFloat(p.level_11)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_12: !_.isNull(p.level_12) ? (parseFloat(p.level_12)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_13: !_.isNull(p.level_13) ? (parseFloat(p.level_13)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_14: !_.isNull(p.level_14) ? (parseFloat(p.level_14)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    level_15:!_.isNull(p.level_15) ? (parseFloat(p.level_15)*100).toFixed(2) :(parseFloat(0)*100).toFixed(2),
                    date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                    by: doNiceModifiedBy(p.datemodified,p.usermodified, p.usercreated)
                    }
                );
            }
        );
        //console.log(data);
        $('#divDiscountCode').datagrid('loadData', data);
        //$('#divDiscountCode').datagrid('reload');
    
    }
   );

   $('#divEvents').on('discountcodeupdated', doSaved);

   function formatLevel(value,row,index)
   {
        return value+'%';
   }

    $('#divDiscountCode').datagrid
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
                {field:'level_1',title:'Level 1',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_2',title:'Level 2',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_3',title:'Level 3',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_4',title:'Level 4',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_5',title:'Level 5',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_6',title:'Level 6',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_7',title:'Level 7',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_8',title:'Level 8',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_9',title:'Level 9',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_10',title:'Level 10',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_11',title:'Level 11',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_12',title:'Level 12',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_13',title:'Level 13',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_14',title:'Level 14',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
                {field:'level_15',title:'Level 15',width:70,align:'left',resizable:true,editor:{type:'numberbox',options:{suffix:"%",precision:2,groupSeparator:',',decimalSeparator:'.'}},formatter:formatLevel},
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
            'divDiscountCode',
            editingIndex,
            function(row, index)
            {
              editingIndex = index;

              if (['date', 'by'].indexOf(field) != -1)
                field = 'full_name';

              doGridGetEditor
              (
                'divDiscountCode',
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