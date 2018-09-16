function doDlgLocationNew(parentid, locationid)
{
  var isnew = _.isUndefined(locationid) || _.isNull(locationid);
  var location = {};
  var states = [];

  function doReset()
  {
    $('#cbNewLocationParent').combotree('clear');

    if (isnew)
    {
      $('#fldNewLocationName').textbox('clear');
      $('#fldNewLocationCode').textbox('clear');

      $('#fldNewLocationBay').textbox('clear');
      $('#fldNewLocationLevel').textbox('clear');
      $('#fldNewLocationShelf').textbox('clear');

      $('#fldNewLocationAddress1').textbox('clear');
      $('#fldNewLocationAddress2').textbox('clear');
      $('#fldNewLocationCity').textbox('clear');
      $('#fldNewLocationPostcode').textbox('clear');
      $('#cbNewLocationState').combobox('clear');

      $('#btnLocationNewAdd').linkbutton('disable');

      $('#cbNewLocationParent').combotree('setValue', parentid);
      $('#cbNewLocationCountry').combobox('setValue', defaultCountry);
    }
    else
    {
      if (!_.isEmpty(location))
      {
        $('#fldNewLocationName').textbox('setValue', location.name);
        $('#fldNewLocationCode').textbox('setValue', location.code);

        $('#fldNewLocationBay').textbox('setValue', location.bay);
        $('#fldNewLocationLevel').textbox('setValue', location.level);
        $('#fldNewLocationShelf').textbox('setValue', location.shelf);

        $('#fldNewLocationAddress1').textbox('setValue', location.address1);
        $('#fldNewLocationAddress2').textbox('setValue', location.address2);
        $('#fldNewLocationCity').textbox('setValue', location.city);
        $('#fldNewLocationPostcode').textbox('setValue', location.postcode);
        $('#cbNewLocationCountry').combobox('setValue', location.country);

        $('#cbNewLocationParent').combotree('setValue', location.parentid);
        $('#cbNewLocationState').combobox('setValue', location.state);

        $('#btnLocationNewAdd').linkbutton('enable');
        $('#dlgLocationNew').dialog('setTitle', 'Modify ' + location.name);
      }
    }

    doTextboxFocus('fldNewLocationName');
  }

  function doCheckCode(ev, args)
  {
    // Code already exists?
    if (args.data.rs.length > 0)
      $('#btnLocationNewAdd').linkbutton('disable');
    else
      $('#btnLocationNewAdd').linkbutton('enable');
  }

  function doSaved(ev, args)
  {
    $('#dlgLocationNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    location = (args.data.location);
    doReset();
  }

  $('#divEvents').on('checklocationcode', doCheckCode);
  $('#divEvents').on('newlocation', doSaved);
  $('#divEvents').on('savelocation', doSaved);
  $('#divEvents').on('loadlocation', doLoad);

  $('#dlgLocationNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('checklocationcode', doCheckCode);
        $('#divEvents').off('newlocation', doSaved);
        $('#divEvents').on('savelocation', doSaved);
        $('#divEvents').off('loadlocation', doLoad);
      },
      onOpen: function()
      {
        $('#cbNewLocationParent').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_locations
          }
        );

        $('#fldNewLocationCode').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checklocationcode', {locationid: locationid, code: newValue}, {type: 'refresh'});
              }
              else
                $('#btnLocationNewAdd').linkbutton('disable');
            }
          }
        );

        $('#cbNewLocationCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbNewLocationState').combobox('loadData', states);
            }
          }
        );

        $('#cbNewLocationState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            data: states
          }
        );

        if (isnew)
          $('#btnLocationNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnLocationNewAdd').linkbutton({text: 'Save'});

        if (!_.isUndefined(locationid) && !_.isNull(locationid))
          doServerDataMessage('loadlocation', {locationid: locationid}, {type: 'refresh'});
        else
          doReset();
      },
      buttons:
      [
        {
          text: 'Add',
          disabled: true,
          id: 'btnLocationNewAdd',
          handler: function()
          {
            var parentid = doGetComboTreeSelectedId('cbNewLocationParent');
            var name = $('#fldNewLocationName').textbox('getValue');
            var code = $('#fldNewLocationCode').textbox('getValue');

            var bay = $('#fldNewLocationBay').textbox('getValue');
            var level = $('#fldNewLocationLevel').textbox('getValue');
            var shelf = $('#fldNewLocationShelf').textbox('getValue');

            var address1 = $('#fldNewLocationAddress1').textbox('getValue');
            var address2 = $('#fldNewLocationAddress2').textbox('getValue');
            var city = $('#fldNewLocationCity').textbox('getValue');
            var postcode = $('#fldNewLocationPostcode').textbox('getValue');
            var country = $('#cbNewLocationCountry').combobox('getValue');
            var state = $('#cbNewLocationState').combobox('getValue');

            if (!_.isBlank(name))
            {
              if (!_.isBlank(code))
              {
                if (isnew)
                {
                  doServerDataMessage
                  (
                    'newlocation',
                    {
                      parentid: parentid,
                      name: name,
                      code: code,
                      bay,
                      level,
                      shelf,
                      address1: address1,
                      address2: address2,
                      city: city,
                      state: state,
                      postcode: postcode,
                      country: country
                    },
                    {type: 'refresh'}
                  );
                }
                else
                {
                  doServerDataMessage
                  (
                    'savelocation',
                    {
                      locationid: locationid,
                      name: name,
                      code: code,
                      bay,
                      level,
                      shelf,
                      address1: address1,
                      address2: address2,
                      city: city,
                      state: state,
                      postcode: postcode,
                      country: country
                    },
                    {type: 'refresh'}
                  );
                }
              }
              else
                doMandatoryTextbox('Please enter a unique location code', 'fldNewLocationCode');
            }
            else
              doMandatoryTextbox('Please enter an location name', 'fldNewLocationName');
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
            $('#dlgLocationNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
