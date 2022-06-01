exports.handler = (context, event, callback) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say("Your voicemail has been recorded... Thank you!");

  callback(null, twiml);
};
