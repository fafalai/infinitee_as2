var locationsTabWidgetsLoaded = false;

function doLocationsTabSearch(value, name)
{
  doSearchCodeNameInTree('divLocationsTG', value);
}

function doLocationsTabWidgets()
{
  if (locationsTabWidgetsLoaded)
    return;

  locationsTabWidgetsLoaded = true;

  function doNewRoot()
  {
    doDlgLocationNew(null, null);
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divLocationsTG',
      function(row)
      {
        doDlgLocationNew(row.id, null);
      }
    );
  }

  function doClear()
  {
    $('#divLocationsTG').treegrid('unselectAll');
  }

  function doRemove()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divLocationsTG',
        function(row)
        {
          doPromptYesNoCancel
          (
            'Remove ' + row.name + ' and ALL sublocations (Yes) or ONLY this location (No)?',
            function(result)
            {
              if (!_.isNull(result))
                primus.emit('expirelocation', {fguid: fguid, uuid: uuid, session: session, locationid: row.id, cascade: result, pdata: {type: 'dolocationsremove'}});
            }
          );
        }
      ))
    {
      noty({text: 'Please select a location to remove', type: 'error', timeout: 4000});
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divLocationsTG',
      function(row)
      {
        primus.emit('changelocationparent', {fguid: fguid, uuid: uuid, session: session, locationid: row.id, parentid: null, pdata: {type: 'refresh'}});
      }
    );
  }

  function doLocate()
  {
    doTreeGridGetSelectedRowData
    (
      'divLocationsTG',
      function(row)
      {
        var title = doNiceTitleizeString(row.name);
        var html = '<strong>' + title + '</strong><br/>' + doNiceTitleizeString(row.address1)  + '<br/>' + doNiceTitleizeString(row.city) + '<br/>' + doNiceTitleizeString(row.statename) + '<br/>' + doNiceTitleizeString(row.country);

        if (!_.isBlank(row.gpslat) && !_.isBlank(row.gpslon))
          doShowMap(row.gpslat, row.gpslon, title, html);
        else
        {
          var osmgeocoder = GeocoderJS.createGeocoder('openstreetmap');

          osmgeocoder.geocode
          (
            row.address1 + ' ' + row.city + ' ' + row.statename + ' ' + row.country,
            function(result)
            {
              if (result.length > 0)
              {

                doShowMap(result[0].latitude, result[0].longitude, title, html);
              }
            }
          );
        }
      }
    );
  }

  function doSaved(ev, args)
  {
    doServerMessage('listlocations', {type: 'refresh', locationid: args.data.locationid});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listlocations',
    function(ev, args)
    {
      $('#divLocationsTG').treegrid('reload');

      doExpandTreeToId('divLocationsTG', args.pdata.locationid);
    }
  );

  $('#divEvents').on
  (
    'checklocationcode',
    function(ev, args)
    {
      var locations = args.data.rs;

      if (locations.length > 0)
        doShowError('Location code [' + locations[0].code + '] is already assigned to [' + locations[0].name + ']');
    }
  );

  $('#divEvents').on('newlocation', doSaved);
  $('#divEvents').on('savelocation', doSaved);
  $('#divEvents').on('expirelocation', doSaved);
  $('#divEvents').on('changelocationparent', doSaved);

  $('#divEvents').on
  (
    'locationspopup',
    function(ev, args)
    {
      if (args == 'newroot')
        doNewRoot();
      else if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'removeparent')
        doRemoveParent();
      else if (args == 'locate')
        doLocate();
    }
  );

  $('#divLocationsTG').treegrid
  (
    {
      idField: 'id',
      treeField: 'name',
      lines: true,
      collapsible: true,
      fitColumns: false,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbLocations',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_locations.length, rows: cache_locations});
        $(this).treegrid('reloadFooter', [{name: '<span class="totals_footer">' + doGetCountTreeArray(cache_locations) + ' Locations</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Name',              rowspan: 2,  field: 'name',      width: 300, align: 'left',  resizable: true, editor: 'text', sortable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Code',              rowspan: 2,  field: 'code',      width: 200, align: 'left',  resizable: true, sortable: true},
          {title: 'Address',           colspan: 6},
          {title: 'GPS',               colspan: 2},
          {title: 'Custom Attributes', colspan: 5},
          {title: 'Modified',          rowspan: 2,  field: 'date',      width: 150, align: 'right', resizable: true, sortable: true},
          {title: 'By',                rowspan: 2,  field: 'by',        width: 200, align: 'left',  resizable: true, sortable: true}
        ],
        [
          {title: 'Address1',                       field: 'address1',  width: 200, align: 'left',  resizable: true},
          {title: 'Address2',                       field: 'address2',  width: 200, align: 'left',  resizable: true},
          {title: 'City',                           field: 'city',      width: 200, align: 'left',  resizable: true},
          {title: 'State',                          field: 'statename', width: 200, align: 'left',  resizable: true},
          {title: 'Postcode',                       field: 'postcode',  width: 80,  align: 'left',  resizable: true},
          {title: 'Country',                        field: 'country',   width: 200, align: 'left',  resizable: true},
          {title: 'Latitude',                       field: 'gpslat',    width: 150, align: 'right', resizable: true},
          {title: 'Longitude',                      field: 'gpslon',    width: 150, align: 'right', resizable: true},
          {title: '1',                              field: 'attrib1',   width: 150, align: 'left',  resizable: true},
          {title: '2',                              field: 'attrib2',   width: 150, align: 'left',  resizable: true},
          {title: '3',                              field: 'attrib3',   width: 150, align: 'left',  resizable: true},
          {title: '4',                              field: 'attrib4',   width: 150, align: 'left',  resizable: true},
          {title: '5',                              field: 'attrib5',   width: 150, align: 'left',  resizable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divLocationsTG', 'divLocationsMenuPopup', e, row);
      },
      onLoadSuccess: function(row)
      {
        $(this).treegrid('enableDnd');
      },
      onBeforeDrag: function(source)
      {
        return true;
      },
      onDragOver: function(target, source)
      {
        return true;
      },
      onBeforeDrop: function(target, source, point)
      {
        return true;
      },
      onDrop: function(target, source, point)
      {
        doServerDataMessage('changelocationparent', {locationid: source.id, parentid: target.id}, {type: 'refresh'});
      },
      onDblClickCell: function(field, row)
      {
        doDlgLocationNew(row.parentid, row.id);
      }
    }
  );
}
