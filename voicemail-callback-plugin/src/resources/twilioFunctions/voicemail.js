exports.handler = function(context, event, callback) {
    console.log(`Voicemail executing Task Sid:${event.taskSid}`)
    let taskSid = event.taskSid;
    let actionUrl = `https://${context.DOMAIN_NAME}/voicemailComplete?taskSid=${taskSid}`;
      
    let twiml = new Twilio.twiml.VoiceResponse();
    twiml.say("Sorry, no one is available to take your call. Please leave a message at the beep. When you're done, press pound or just hang-up.");
    twiml.record({
      action: encodeURI(actionUrl),
      finishOnKey: '#',
      playBeep: true,
      transcribe: true
    });
    callback(null, twiml);
  };