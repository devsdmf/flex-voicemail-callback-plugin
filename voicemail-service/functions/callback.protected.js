const helpersPath = Runtime.getFunctions().helpers.path;
const { getDomain } = require(helpersPath);

const FUNCTION_NAME = 'callback';

const MODE_REQUEST_CONFIRMATION = 'requestConfirmation';
const MODE_VALIDATE_OPTION = 'validateOption';
const MODE_GET_PHONENUMBER = 'getPhoneNumber';
const MODE_SUBMIT_CALLBACK = 'submitCallback';

exports.handler = async (context, event, callback) => {
  console.log('[callback] Event => ', event);

  const domain = getDomain(context);
  const twiml = new Twilio.twiml.VoiceResponse();

  const {
    mode,
    taskSid,
    callbackStore
  } = event;

  console.log('[callback] MODE => ', mode);

  if (mode === MODE_REQUEST_CONFIRMATION) {
    const callbackPhoneNumber = event.callbackPhoneNumber ?? event.From;
    console.log('[callback] callbackPhoneNumber =======> ', callbackPhoneNumber);
    console.log('[callback] event.callbackPhoneNumber =====> ', event.callbackPhoneNumber);

    const message = `You have requested a callback at ${formatPhoneNumber(callbackPhoneNumber)}...` + 
      `If this is correct, press 1...` + 
      `Press 2 to be called in a different phone number...`;

    const action = `${domain}/${FUNCTION_NAME}?mode=${MODE_VALIDATE_OPTION}` +
      `&taskSid=${taskSid}` + 
      `&callbackStore=${callbackStore}` +
      `&callbackPhoneNumber=${encodeURIComponent(callbackPhoneNumber)}`;

    const redirectUrl = `${domain}/${FUNCTION_NAME}?mode=${MODE_REQUEST_CONFIRMATION}` +
      `&taskSid=${taskSid}` + 
      `&callbackStore=${callbackStore}`;

    const gatherConfirmation = twiml.gather({
      input: 'dtmf',
      timeout: 2,
      action
    });

    gatherConfirmation.say(message);
    twiml.redirect(redirectUrl);

    return callback(null, twiml);
  } else if (mode === MODE_VALIDATE_OPTION) {
    const { 
      Digits: option ,
      callbackPhoneNumber
    } = event;

    if (option === '1') {
      const redirectUrl = `${domain}/${FUNCTION_NAME}?mode=${MODE_SUBMIT_CALLBACK}` +
        `&taskSid=${taskSid}` + 
        `&callbackStore=${callbackStore}` + 
        `&callbackPhoneNumber=${callbackPhoneNumber}`;

      twiml.redirect(redirectUrl);
      return callback(null, twiml);
    } else if (option === '2') {
      const message = `Using your keypad, enter in your phone number...` +
        `Press the star sign when you are done...`;

      const action = `${domain}/${FUNCTION_NAME}?mode=${MODE_GET_PHONENUMBER}` +
        `&taskSid=${taskSid}` + 
        `&callbackStore=${callbackStore}`;

      const redirectUrl = `${domain}/${FUNCTION_NAME}?mode=${MODE_REQUEST_CONFIRMATION}` +
        `&taskSid=${taskSid}` + 
        `&callbackStore=${callbackStore}`;
      
      const gatherPhoneNumber = twiml.gather({
        input: 'dtmf',
        timeout: 10,
        action,
        finishOnKey: '*'
      });

      gatherPhoneNumber.say(message);

      twiml.redirect(redirectUrl);
      return callback(null, twiml);
    } else {
      const redirectUrl = `${domain}/${FUNCTION_NAME}?mode=${MODE_REQUEST_CONFIRMATION}` + 
        `&taskSid=${taskSid}` + 
        `&callbackStore=${callbackStore}`;

      twiml.say('You have provided an invalid option...');
      twiml.redirect(redirectUrl);

      return callback(null, twiml);
    }
  } else if (mode === MODE_GET_PHONENUMBER) {
    const { Digits: callbackPhoneNumber } = event;
    const redirectUrl = `${domain}/${FUNCTION_NAME}?mode=${MODE_REQUEST_CONFIRMATION}` +
      `&taskSid=${taskSid}` + 
      `&callbackStore=${callbackStore}` + 
      `&callbackPhoneNumber=${encodeURIComponent(callbackPhoneNumber)}`;

    twiml.redirect(redirectUrl);

    return callback(null, twiml);
  } else if (mode === MODE_SUBMIT_CALLBACK) {
    const { callbackPhoneNumber } = event;
    const client = context.getTwilioClient();

    client.sync
      .services(context.SYNC_SERVICE_SID)
      .syncLists(`callback-${callbackStore}`)
      .syncListItems.create({
        data: {
          timestamp: Math.floor(Date.now() / 1000),
          handled: false,
          phoneNumber: decodeURIComponent(callbackPhoneNumber).trim()
        }
      })
      .then(item => {
        console.log(`[callback] Item => `, item);
        
        twiml.say('Your calback request has been delivered...');
        twiml.say('An available care specialist will reach out to contact you...');
        twiml.say('Thank you for your call.');
        twiml.hangup();

        return callback(null, twiml);
      })
      .catch(err => {
        console.error('[callback] Error creating sync item', err);
        
        twiml.say(`I'm sorry... An error occurred when trying to request the callback...`);
        twiml.say('Please, try again later');
        twiml.hangup();

        return callback(null, twiml);
      });
  } else {
    console.error('[callback] Invalid mode => ', mode);
    callback(500, 'An error occurred');
  }
};

const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith('+')) {
    phoneNumber = phoneNumber.slice(1);
  }

  return phoneNumber.split('').join('...');
};
