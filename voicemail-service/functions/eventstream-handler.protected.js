const configPath = Runtime.getFunctions().config.path;
const config = require(configPath);

const helpersPath = Runtime.getFunctions().helpers.path;
const { getDomain, sendCallToVoicemail } = require(helpersPath);

exports.handler = async (context, event, callback) => {
  // get configured twilio client
  const client = context.getTwilioClient();
  const domain = getDomain(context);

  // setup an empty success response
  let response = new Twilio.Response();
  response.setStatusCode(204);
  
  // switch on the event type
  if(event.EventType == 'task-queue.entered'){
    console.log("Task Queue:",event.TaskQueueName);

    // If event is not from a Task Queue of voicemail, ends execution
    if (!config.voicemailQueues.includes(event.TaskQueueName)) {
      return callback(null, response);
    }
    
    const taskSid = event.TaskSid;
    const taskAttributes = JSON.parse(event.TaskAttributes);
    const callSid = taskAttributes.call_sid;
    const voicemailBox = taskAttributes.voicemailBox;
    const unavailable = true;

    await sendCallToVoicemail(context, taskSid, callSid, voicemailBox, unavailable);
  } else {
    callback(null,response);
  }
};
