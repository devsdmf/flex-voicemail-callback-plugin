const configPath = Runtime.getFunctions().config.path;
const config = require(configPath);

const helpersPath = Runtime.getFunctions().helpers.path;
const { getDomain } = require(helpersPath);

exports.handler = function(context, event, callback) {
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
    
    
    let taskSid = event.TaskSid;
    let taskAttributes = JSON.parse(event.TaskAttributes);
    let callSid = taskAttributes.call_sid;
    let url = `${domain}/voicemail?taskSid=${taskSid}}`;

    // redirect call to voicemail
    client.calls(callSid).update({
      method: 'POST',
      url: encodeURI(url)
    }).then(() => {
      return callback(null, response);
    }).catch(err => {
      console.log("Redirect error",err)
      response.setStatusCode(500);
      return callback(err, response);
    });
  } else {
    callback(null,response);
  }
};
