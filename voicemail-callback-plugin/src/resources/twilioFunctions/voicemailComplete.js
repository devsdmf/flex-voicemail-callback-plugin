exports.handler = function(context, event, callback) {
    const client = context.getTwilioClient(),
          taskSid = event.taskSid,
          segmentLink = event.RecordingUrl;
    
    let twiml = new Twilio.twiml.VoiceResponse();
    twiml.say("Thank you for your message. Good bye.");
    callback(null, twiml);
    
    // retrieve the task this voicemail recording corresponds to
    client.taskrouter.workspaces(context.TR_WORKSPACE_SID)
    .tasks(taskSid)
    .fetch()
    .then(task => {
    
      // parse the task attributes - lets append some WFO specific attributes
      // this will let WFO know this task was a voicemail and not an abandoned call
      let taskAttributes = JSON.parse(task.attributes);
      taskAttributes.conversations = taskAttributes.conversations || {};
      taskAttributes.conversations = Object.assign(taskAttributes.conversations, {
        segment_link: segmentLink,
        abandoned: "Follow-Up",
        abandoned_phase: "Voicemail"
      });
    
      // update the task attributes with the WFO specific information
      client.taskrouter.workspaces(context.TR_WORKSPACE_SID)
      .tasks(taskSid)
      .update({
        attributes: JSON.stringify(taskAttributes)
      }).then(() => {
        // end
        return callback(null, null);
      });
    })
  };