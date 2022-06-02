const helpersPath = Runtime.getFunctions().helpers.path;
const { getDomain } = require(helpersPath);

exports.handler = async (context, event, callback) => {
  console.log('[voicemail] Event => ', event);
  const domain = getDomain(context);
  const twiml = new Twilio.twiml.VoiceResponse();
  const { taskSid } = event;

  if (event.unavailable) {
    twiml.say('Sorry, our agents are not available at this moment...');
  }

  const buildCallbackUrl = (func) => `${domain}/${func}?taskSid=${taskSid}` + 
    `&callerId=${encodeURIComponent(event.Caller)}` +
    `&voicemailBox=${event.voicemailBox}`;

  twiml.say('Please, leave a message at the tone. Press star key when finished.');

  twiml.record({
    action: `${domain}/voicemail-response`,
    recordingStatusCallback: buildCallbackUrl('voicemail-complete'),
    finishOnKey: '*',
    method: 'POST',
    playBeep: true,
    transcribe: true,
    transcribeCallback: buildCallbackUrl('transcription-complete')
  });

  callback(null, twiml);
};
