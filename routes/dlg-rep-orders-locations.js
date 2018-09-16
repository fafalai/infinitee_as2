function doDlgRepOrdersLocations()
{
  var map = null;
  var markers = [];
  var pin = 'images/pinCupBrown.png';

  function doResults(ev, args)
  {
    if (args.data.rs.length > 0)
    {
      if (_.isNull(map))
        return;

      map.removeMarkers();

      doShowSuccess('Found ' + args.data.rs.length + ' orders');

      args.data.rs.forEach
      (
        function(row, index)
        {
          if (_.isUndefined(row.fqaddress))
            return;

          var html = '<strong>Client:</strong> ' + doNiceTitleizeString(row.clientname) + '<br/>' +
                     '<strong>Order No.:</strong> ' + doNiceUppercaseString(row.orderno) + '<br/>' +
                     '<strong>Date:</strong> <span style="color: ' + colour_royalblue + '">' + _.friendlydisplaydate(row.datecreated) + '</span><br/>' +
                     '<strong>Address:</strong> ' + doNiceComments(row.fqaddress);

          markers.push
          (
            {
              html: html,
              marker: map.addMarker
              (
                {
                  lat: row.gpslat,
                  lng: row.gpslon,
                  icon: pin,
                  title: 'Order: ' + row.orderno,
                  infoWindow:
                  {
                    content: html
                  }
                }
              )
            }
          );

          // Pan map to centre on first booking...
          if (index == 0)
          {
            map.panTo({lat: parseFloat(row.gpslat), lng: parseFloat(row.gpslon)});
            // Open infowindow of first marker...
            markers[0].marker.infoWindow.open(map, markers[0].marker);
          }
        }
      );
    }
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('report-orderslocations', doResults);

  $('#dlgRepOrdersLocations').dialog
  (
    {
      onClose: function()
      {
        map = null;
        markers = null;
        tiles = null;

        $('#divEvents').off('report-orderslocations', doResults);
      },
      onOpen: function()
      {
        $('#dtRepOrdersLocationsDateFrom').datebox(dateboxParserObj);
        $('#dtRepOrdersLocationsDateTo').datebox(dateboxParserObj);

        map = new GMaps
        (
          {
            el: '#mapOrdersLocations',
            lat: tpccgpslat,
            lng: tpccgpslon,
            zoom: 11,
            zoomControl: true,
            zoomControlOpt:
            {
              style: 'SMALL',
              position: 'TOP_LEFT'
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            panControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            navigationControl: true,
            scrollwheel: true,
            overviewMapControl: false,
            markerClusterer: function(map)
            {
              var mc = new MarkerClusterer(map);
              // Following helps woth marker in identical coord from clustering to infinite zoom level...
              mc.setMaxZoom(maxZoom);
              return mc;
            }
          }
        );

        doTextboxFocus('dtRepOrdersLocationsDateFrom');
      },
      buttons:
      [
        {
          text: 'Run',
          handler: function()
          {
            var datefrom = $('#dtRepOrdersLocationsDateFrom').datebox('getValue');
            var dateto = $('#dtRepOrdersLocationsDateTo').datebox('getValue');
            var now = moment();

            if (_.isBlank(datefrom) && _.isBlank(dateto))
            {
              doMandatoryTextbox('Please select a start and end date for the report', 'dtRepOrdersLocationsDateFrom');
              return;
            }

            if (_.isBlank(dateto))
            {
              if (moment(datefrom).isAfter(now))
              {
                doMandatoryTextbox('Start date can not be after today...', 'dtRepOrdersLocationsDateFrom');
                return;
              }
              dateto = now.format('YYYY-MM-DD hh:mm:ss');
            }

            if (_.isBlank(datefrom))
            {
              if (moment(dateto).isBefore(now))
              {
                doMandatoryTextbox('End date can not be before today...', 'dtRepOrdersLocationsDateTo');
                return;
              }
              datefrom = now.format('YYYY-MM-DD hh:mm:ss');
            }

            doServerDataMessage('report', {report: 'orderslocations', datefrom: datefrom, dateto: dateto}, {type: 'refresh'});
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            $('#dtRepOrdersLocationsDateFrom').datebox('clear');
            $('#dtRepOrdersLocationsDateTo').datebox('clear');

            if (!_.isNull(map))
            {
              map.removeMarkers();
              markers = [];
            }
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgRepOrdersLocations').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
