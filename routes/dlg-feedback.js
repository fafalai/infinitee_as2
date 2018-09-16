function doDlgFeedback()
{
  function doReset()
  {
    $('#divFeedbackComments').texteditor('clear').texteditor
    (
      'setValue',
      '<p><b>From</b>: ' + uname + '<br/><b>On</b>: ' + moment().format('YYYY-MM-DD HH:mm') + '<br/></p><br/>'
    );
  }

  function doFeedbackSent(ev, args)
  {
    doShowSuccess('Thanks for your feedback');
    $('#dlgFeedback').dialog('close');
  }

  // Need to destroy/re-create this event since it depends on arguments that change each call...
  $('#divEvents').on('emailfeedback', doFeedbackSent);

  $('#dlgFeedback').dialog
  (
    {
      openAnimation: 'fade',
      openDuration: 500,
      closeAnimation: 'slide',
      onClose: function()
      {
        $('#divEvents').off('emailfeedback', doFeedbackSent);
      },
      onOpen: function()
      {
        doReset();
      },
      buttons:
      [
        {
          text: 'Submit',
          handler: function()
          {
            var comments = $('#divFeedbackComments').texteditor('getValue');

            if (!_.isBlank(comments))
              doServerDataMessage('emailfeedback', {comments: comments}, {type: 'refresh'});
            else
              doMandatoryTextbox('Please enter some comments', 'divFeedbackComments');
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
            $('#dlgFeedback').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}

