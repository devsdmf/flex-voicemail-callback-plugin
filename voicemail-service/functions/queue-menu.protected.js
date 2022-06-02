const helpersPath = Runtime.getFunctions().helpers.path;
const { getDomain, getTask, sendCallToVoicemail } = require(helpersPath);

const buildMainMenu = (domain, holdMusicUrl, taskSid, skipGreeting) => {
  const twiml = new Twilio.twiml.VoiceResponse();

  if (skipGreeting !== '1') {
    twiml.say('...Please wait while we direct your call to the next available agent...');
  }

  const gather = twiml.gather({
    input: 'dtmf',
    timeout: 2,
    action: `${domain}/queue-menu?mode=optionMenu&taskSid=${taskSid}`
  });

  if (skipGreeting !== '1') {
    gather.say('To listen to a menu of options while on  hold, press 1 at anytime.');
  }

  gather.play(holdMusicUrl);

  twiml.redirect(`${domain}/queue-menu?mode=main&taskSid=${taskSid}`);

  return twiml;
};

const buildOptionsMenu = (domain, holdMusicUrl, taskSid) => {
  const twiml = new Twilio.twiml.VoiceResponse();

  const message = 'The following options are available...' + 
    'Press 1 to remain on hold...' + 
    'Press 2 to request a callback...' + 
    'Press 3 to leave a voicemail message...' + 
    'Press star key to listen to the options again...';

  gather = twiml.gather({
    input: 'dtmf',
    timeout: 1,
    action: `${domain}/queue-menu?mode=option`
  });

  gather.say(message);
  gather.play(holdMusicUrl);

  twiml.redirect(`${domain}/queue-menu?mode=main&taskSid=${taskSid}`);

  return twiml;
};

const handleStayInQueue = (domain, taskSid) => {
  const twiml = new Twilio.twiml.VoiceResponse();

  twiml.redirect(`${domain}/queue-menu?mode=main&skipGreeting=1&taskSid=${taskSid}`);

  return twiml;
};

const handleInvalidOption = (domain, taskSid) => {
  const twiml = new Twilio.twiml.VoiceResponse();

  twiml.say('Invalid option');
  twiml.redirect(`${domain}/queue-menu?mode=optionMenu&taskSid=${taskSid}`);

  return twiml;
};

exports.handler = async (context, event, callback) => {
  //console.log('[queue-menu] EVENT => ', event);
  const client = context.getTwilioClient();
  const domain = getDomain(context);
  const holdMusicUrl = `${domain}/assets/hold_music.mp3`;

  const { 
    mode,
    CallSid
  } = event;

  let { taskSid } = event;

  const taskInfo = await getTask(context, taskSid || CallSid);
  if (!taskSid) {
    ({ taskSid } = taskInfo);
  }

  const taskAttributes = JSON.parse(taskInfo.data.attributes);

  //console.log('[queue-menu] Task => ', taskInfo);

  //console.log(`[queue-menu] Requested queue menu with mode ${mode} for task ${taskSid} and call ${CallSid}`);

  if (mode === 'main') {
    const twiml = buildMainMenu(domain, holdMusicUrl, taskSid, event.skipGreeting || 0);
    return callback(null,twiml);
  } else if (mode === 'optionMenu') {
    return callback(null, buildOptionsMenu(domain, holdMusicUrl, taskSid));
  } else if (mode === 'option') {
    const { Digits: option } = event;

    if (option === '1') {
      // stay in queue
      return callback(null, handleStayInQueue(domain, taskSid));
    } else if (option === '2') {
      // request a callback
      twiml.say('Callback requested');
    } else if (option === '3') {
      // leave voicemail
      await sendCallToVoicemail(context, taskSid, CallSid, taskAttributes.voicemailBox);
    } else if (option === '*') {
      // listen options again
      return callback(null, handleOptionsMenu(domain, holdMusicUrl, taskSid));
    } else {
      return callback(null, handleInvalidOption(domain, taskSid));
    }
  }

  return callback(500, null);
};
