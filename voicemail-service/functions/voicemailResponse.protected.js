exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    twiml.say("Your voicemail has been recorded. Thank you.");
    callback(null, twiml);
  };