exports.handler = function (context, event, callback) {
  let domainName = `${context.DOMAIN_NAME}`;

  if (context.DOMAIN_NAME.includes("localhost")) {
    domainName = context.NGROK_URL;
  }

  let taskSid = event.taskSid;
  let transcriptionCallBack = `/transcriptionComplete`;
  let twiml = new Twilio.twiml.VoiceResponse();

  twiml.say(
    "Sorry, no one is available to take your call. Please leave a message at the beep. When you're done, press pound or just hang-up."
  );

  twiml.record({
    action: encodeURI(`/voicemailResponse`),
    recordingStatusCallback: encodeURI(
      `voicemailComplete?taskSid=${taskSid}&workerExtension=${
        event.workerExtension
      }&callerId=${encodeURIComponent(event.Caller)}`
    ),
    finishOnKey: "#",
    playBeep: true,
    transcribe: true,
    transcribeCallback: encodeURI(
      `/transcriptionComplete?taskSid=${taskSid}&workerExtension=${event.workerExtension}`
    ),
  });
  callback(null, twiml);
};
