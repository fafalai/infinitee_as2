var selectedJobSheetId = null;

function doDlgJobSheet(jobsheetid)
{
  var jobsheet = {};
  var factor = 0;

  function doCalcs()
  {
    var across = 0;
    var reelwidth = '';
    var thickness = '';
    var gears = '';
    var sleeves = '';
    var around = '';
    var printedqty = '';
    var pc = jobsheet.productcode;
    var iswide = doSwitchButtonChecked('cbIsWide');

    // Format is: DW08TK-CUST
    if (pc.indexOf('02') != -1)
    {
      if (!iswide)
      {
        across = 1;
        reelwidth = 305;
      }
      else
      {
        across = 5;
        reelwidth = 712;
      }

      thickness = 213;
      gears = 390;
      sleeves = 390;
      around = 6;
      factor = 0.065;
    }
    else if (pc.indexOf('03') != -1)
    {
      if (!iswide)
      {
        across = 1;
        reelwidth = 230;
      }
      else
      {
        across = 3;
        reelwidth = 640;
      }

      thickness = 313;
      gears = 360;
      sleeves = 360;
      around = 5;
      factor = 0.072;
    }
    else if (pc.indexOf('04') != -1)
    {
      if ((pc.indexOf('S/W') != -1) || (pc.indexOf('SW') != -1))
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 230;
        }
        else
        {
          across = 5;
          reelwidth = 730;
        }

        thickness = 313;
        gears = 390;
        sleeves = 390;
        around = 5;
        factor = 0.078;
      }
      else
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 200;
        }
        else
        {
          across = 0;
          reelwidth = 0;
        }

        thickness = 215;
        gears = 375;
        sleeves = 375;
        around = 6;
        factor = 0.0625;
      }
    }
    else if (pc.indexOf('05') != -1)
    {
      if (!iswide)
      {
        across = 1;
        reelwidth = 275;
      }
      else
      {
        across = 3;
        reelwidth = 790;
      }

      thickness = 313;
      gears = 375;
      sleeves = 375;
      around = 5;
      factor = 0.075;
    }
    else if (pc.indexOf('65') != -1)
    {
      if (!iswide)
      {
        across = 1;
        reelwidth = 230;
      }
      else
      {
        across = 4;
        reelwidth = 790;
      }

      thickness = 313;
      gears = 470;
      sleeves = 470;
      around = 5;
      factor = 0.094;
    }
    else if (pc.indexOf('08') != -1)
    {
      if ((pc.indexOf('I/C') != -1) || (pc.indexOf('IC') != -1))
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 300;
        }
        else
        {
          across = 0;
          reelwidth = 0;
        }

        thickness = 313;
        gears = 495;
        sleeves = 495;
        around = 6;
        factor = 0.0825;
      }
      else if ((pc.indexOf('08U') != -1) || (pc.indexOf('08UK') != -1) || (pc.indexOf('08K') != -1))
      {
        if ((pc.indexOf('S/W') != -1) || (pc.indexOf('SW') != -1))
        {
          if (!iswide)
          {
            across = 1;
            reelwidth = 275;
          }
          else
          {
            across = 3;
            reelwidth = 730;
          }

          thickness = 313;
          gears = 555;
          sleeves = 555;
          around = 5;
          factor = 0.111;
        }
        else
        {
          if (!iswide)
         {
           across = 1;
           reelwidth = 275;
          }
          else
          {
            across = 3;
            reelwidth = 760;
          }

          thickness = 215;
          gears = 470;
          sleeves = 470;
          around = 5;
          factor = 0.094;
        }
      }
      else if ((pc.indexOf('08TK') != -1) || (pc.indexOf('08T') != -1))
      {
        if ((pc.indexOf('S/W') != -1) || (pc.indexOf('SW') != -1))
        {
          if (!iswide)
          {
            across = 1;
            reelwidth = 250;
          }
          else
          {
            across = 3;
            reelwidth = 675;
          }

          thickness = 313;
          gears = 470;
          sleeves = 470;
          around = 4;
          factor = 0.1175;
        }
        else
        {
          if (!iswide)
          {
            across = 1;
            reelwidth = 250;
          }
          else
          {
            across = 3;
            reelwidth = 700;
          }

          thickness = 215;
          gears = 470;
          sleeves = 470;
          around = 5;
          factor = 0.094;
        }
      }
    }
    else if (pc.indexOf('12') != -1)
    {
      if ((pc.indexOf('C/H') != -1) || (pc.indexOf('CH') != -1))
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 290;
        }
        else
        {
          across = 0;
          reelwidth = 0;
        }

        thickness = 215;
        gears = 360;
        sleeves = 360;
        around = 3;
        factor = 0.12;
      }
      else if ((pc.indexOf('S/W') != -1) || (pc.indexOf('SW') != -1))
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 275;
        }
        else
        {
          across = 3;
          reelwidth = 730;
        }

        thickness = 313;
        gears = 555;
        sleeves = 555;
        around = 4;
        factor = 0.13875;
      }
      else
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 275;
        }
        else
        {
          across = 3;
          reelwidth = 760;
        }

        thickness = 215;
        gears = 555;
        sleeves = 555;
        around = 5;
        factor = 0.111;
      }
    }
    else if (pc.indexOf('16') != -1)
    {
      if ((pc.indexOf('S/W') != -1) || (pc.indexOf('SW') != -1))
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 275;
        }
        else
        {
          across = 3;
          reelwidth = 730;
        }

        thickness = 313;
        gears = 480;
        sleeves = 480;
        around = 3;
        factor = 0.16;
      }
      else if ((pc.indexOf('D/W') != -1) || (pc.indexOf('DW') != -1))
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 275;
        }
        else
        {
          across = 3;
          reelwidth = 760;
        }

        thickness = 230;
        gears = 540;
        sleeves = 540;
        around = 4;
        factor = 0.135;
      }
      else
      {
        if (!iswide)
        {
          across = 1;
          reelwidth = 355;
        }
        else
        {
          across = 2;
          reelwidth = 690;
        }

        thickness = 313;
        gears = 470;
        sleeves = 470;
        around = 5;
        factor = 0.094;
      }
    }
    else if (pc.indexOf('22') != -1)
    {
      if (!iswide)
      {
        across = 1;
        reelwidth = 300;
      }
      else
      {
        across = 0;
        reelwidth = 0;
      }

      thickness = 213;
      gears = 540;
      sleeves = 540;
      around = 3;
      factor = 0.18;
    }
    else if (pc.indexOf('24') != -1)
    {
      if (!iswide)
      {
        across = 1;
        reelwidth = 300;
      }
      else
      {
        across = 0;
        reelwidth = 0;
      }

      thickness = 213;
      gears = 615;
      sleeves = 615;
      around = 3;
      factor = 0.205;
    }

    return ({iswide: iswide, across: across, reelwidth: reelwidth, thickness: thickness, gears: gears, sleeves: sleeves, around: around, factor: factor});
  }

  function doDefaults()
  {
    var results = doCalcs();

    if (results.across == 0)
    {
      $('#fldReelWidth').numberbox('clear',);
      $('#fldThickness').numberbox('clear');
      $('#fldGear').numberbox('clear');
      $('#fldSleeveSize').numberbox('clear');
      $('#cbNumAcross').combobox('clear');
      $('#fldNumAround').numberbox('clear');
      $('#fldPrintQuantity').numberbox('clear');
    }
    else
    {
      printedqty = _.toBigNum(jobsheet.qtyordered).times(results.factor).div(results.across);

      $('#fldReelWidth').numberbox('setValue', results.reelwidth);
      $('#fldThickness').numberbox('setValue', results.thickness);
      $('#fldGear').numberbox('setValue', results.gears);
      $('#fldSleeveSize').numberbox('setValue', results.sleeves);
      $('#cbNumAcross').combobox('select', results.across);
      $('#fldNumAround').numberbox('setValue', results.around);
      $('#fldPrintQuantity').numberbox('setValue', printedqty);
    }
  }

  function doReset()
  {
    if (!_.isEmpty(jobsheet))
    {
      $('#fldOrderNo').textbox('setValue', jobsheet.orderno);
      $('#fldClientName').textbox('setValue', jobsheet.clientname);
      $('#fldPoNo').textbox('setValue', jobsheet.pono);
      $('#fldProductCode').textbox('setValue', jobsheet.productcode);
      $('#fldOrderQty').textbox('setValue', jobsheet.qtyordered);

      $('#fldUnit1Colour').textbox('setValue', jobsheet.txt1);
      $('#fldUnit1Anilox').numberbox('setValue', jobsheet.num1);
      $('#fldUnit2Colour').textbox('setValue', jobsheet.txt2);
      $('#fldUnit2Anilox').numberbox('setValue', jobsheet.num2);
      $('#fldUnit3Colour').textbox('setValue', jobsheet.txt3);
      $('#fldUnit3Anilox').numberbox('setValue', jobsheet.num3);
      $('#fldUnit4Colour').textbox('setValue', jobsheet.txt4);
      $('#fldUnit4Anilox').numberbox('setValue', jobsheet.num4);
      $('#fldUnit5Colour').textbox('setValue', jobsheet.txt5);
      $('#fldUnit5Anilox').numberbox('setValue', jobsheet.num5);
      $('#fldUnit6Colour').textbox('setValue', jobsheet.txt6);
      $('#fldUnit6Anilox').numberbox('setValue', jobsheet.num6);

      $('#fldReelWidth').numberbox('setValue', jobsheet.num7);
      $('#fldThickness').numberbox('setValue', jobsheet.num8);
      $('#fldGear').numberbox('setValue', jobsheet.num9);
      $('#fldSleeveSize').numberbox('setValue', jobsheet.num10);
      $('#cbNumAcross').combobox('setValue', jobsheet.num11);
      $('#fldNumAround').numberbox('setValue', jobsheet.num12);
      $('#fldPrintQuantity').numberbox('setValue', jobsheet.num13);

      $('#fldJobSheetComment').textbox('setValue', jobsheet.comments);
      $('#imgJobSheet').attr('src', jobsheet.imagename);

      doSetSwitchButton('cbIsWide', jobsheet.iswide);

      $('#dlgTPCCJobSheet').dialog('setTitle', 'Modify ' + jobsheet.jobsheetno);
    }
    else
      doDefaults();

    doTextboxFocus('fldUnit1Colour');
  }

  function doSaved(ev, args)
  {
    $('#dlgTPCCJobSheet').dialog('close');
  }

  function doExpired(ev, args)
  {
    // Someone expired job we're trying to work on...
    if (!_.isEmpty(jobsheet) && (args.data.jobsheetno == jobsheet.jobsheetno))
    {
      doShowWarning('This job has been removed from orders');
      $('#dlgTPCCJobSheet').dialog('close');
    }
  }

  function doLoad(ev, args)
  {
    jobsheet = (args.data.jobsheet);
    doServerDataMessage('tpcclistjobsheetdetails', {jobsheetid: jobsheetid}, {type: 'refresh'});
    doReset();
  }

  function doLoadDetails(ev, args)
  {
    $('#divJobSheetDetailsG').datagrid('loadData', args.data.rs);
  }

  function doDetailsAdded(ev, args)
  {
    if (args.data.jobsheetid == jobsheetid)
      doServerDataMessage('tpcclistjobsheetdetails', {jobsheetid: jobsheetid}, {type: 'refresh'});
  }

  function doImage(ev, args)
  {
    $('#imgJobSheet').attr('src', args.data.imagename);
  }

  $('#divEvents').on('tpccloadjobsheet', doLoad);
  $('#divEvents').on('tpccsavejobsheet', doSaved);
  $('#divEvents').on('tpccjobsheetimagecreated', doImage);
  $('#divEvents').on('tpcclistjobsheetdetails', doLoadDetails);
  $('#divEvents').on('tpccjobsheetdetailadded', doDetailsAdded);
  $('#divEvents').on('tpccjobsheetexpired', doExpired);

  $('#dlgTPCCJobSheet').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('tpccloadjobsheet', doLoad);
        $('#divEvents').off('tpccsavejobsheet', doSaved);
        $('#divEvents').off('tpccjobsheetimagecreated', doImage);
        $('#divEvents').off('tpcclistjobsheetdetails', doLoadDetails);
        $('#divEvents').off('tpccjobsheetdetailadded', doDetailsAdded);
        $('#divEvents').off('tpccjobsheetexpired', doExpired);
      },
      onOpen: function()
      {
        selectedJobSheetId = jobsheetid;

        $('#cbNumAcross').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            limitToList: true,
            data: int_to_5,
            onSelect: function(record)
            {
              doDefaults();
            }
          }
        );

        $('#cbIsWide').switchbutton
        (
          {
            checked: false,
            onChange: function(checked)
            {
              doDefaults();
            }
          }
        );

        $('#divJobSheetDetailsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            rownumbers: true,
            striped: true,
            columns:
            [
              [
                {title: 'Type',      field: 'itype',       width: 120, align: 'left',  resizable: true, formatter: function(value, row) {return doGetStringFromIdInObjArray(js_types, value);}},
                {title: 'Batch No.', field: 'batchno',     width: 150, align: 'left',  resizable: true},
                {title: 'Value 1',   field: 'num1',        width: 80,  align: 'right', resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value, 0); return value;}},
                {title: 'Value 2',   field: 'num2',        width: 80,  align: 'right', resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value, 0); return value;}},
                {title: 'Created',   field: 'datecreated', width: 180, align: 'right', resizable: true, sortable: true},
                {title: 'By',        field: 'usercreated', width: 200, align: 'left',  resizable: true, sortable: true}
              ]
            ]
          }
        );

        if (!_.isNull(jobsheetid))
          doServerDataMessage('tpccloadjobsheet', {jobsheetid: jobsheetid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Begin',
          handler: function()
          {
            doServerDataMessage('tpccbeginjob', {jobsheetid: jobsheetid}, {type: 'refresh'});
          }
        },
        {
          text: 'Complete',
          handler: function()
          {
            doServerDataMessage('tpcccompletejob', {jobsheetid: jobsheetid}, {type: 'refresh'});
          }
        },
        {
          text: 'Save',
          handler: function()
          {
            var colour1 = $('#fldUnit1Colour').textbox('getValue');
            var anilox1 = $('#fldUnit1Anilox').numberbox('getValue');
            var colour2 = $('#fldUnit2Colour').textbox('getValue');
            var anilox2 = $('#fldUnit2Anilox').numberbox('getValue');
            var colour3 = $('#fldUnit3Colour').textbox('getValue');
            var anilox3 = $('#fldUnit3Anilox').numberbox('getValue');
            var colour4 = $('#fldUnit4Colour').textbox('getValue');
            var anilox4 = $('#fldUnit4Anilox').numberbox('getValue');
            var colour5 = $('#fldUnit5Colour').textbox('getValue');
            var anilox5 = $('#fldUnit5Anilox').numberbox('getValue');
            var colour6 = $('#fldUnit6Colour').textbox('getValue');
            var anilox6 = $('#fldUnit6Anilox').numberbox('getValue');

            var width = $('#fldReelWidth').numberbox('getValue');
            var thickness = $('#fldThickness').numberbox('getValue');
            var gear = $('#fldGear').numberbox('getValue');
            var sleevesize = $('#fldSleeveSize').numberbox('getValue');
            var across = $('#cbNumAcross').combobox('getValue');
            var around = $('#fldNumAround').numberbox('getValue');
            var printqty = $('#fldPrintQuantity').numberbox('getValue');
            var comment = $('#fldJobSheetComment').textbox('getValue');
            var iswide = doSwitchButtonChecked('cbIsWide') ? 1 : 0;

            doServerDataMessage
            (
              'tpccsavejobsheet',
              {
                jobsheetid: jobsheetid,
                num1: anilox1,
                num2: anilox2,
                num3: anilox3,
                num4: anilox4,
                num5: anilox5,
                num6: anilox6,
                num7: width,
                num8: thickness,
                num9: gear,
                num10: sleevesize,
                num11: across,
                num12: around,
                num13: printqty,
                txt1: colour1,
                txt2: colour2,
                txt3: colour3,
                txt4: colour4,
                txt5: colour5,
                txt6: colour6,
                comment: comment,
                iswide: iswide
              },
              {type: 'refresh'}
            );
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
            $('#dlgTPCCJobSheet').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
