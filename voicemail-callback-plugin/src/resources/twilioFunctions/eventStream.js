exports.handler = function(context, event, callback) {
    // get configured twilio client
    const client = context.getTwilioClient();
    
    // setup an empty success response
    let response = new Twilio.Response();
    response.setStatusCode(204);
    console.log("Event Type",event.EventType)
    // switch on the event type
    switch(event.EventType) {
        case 'task-queue.entered':
            // ignore events that are not entering the Voicemail TaskQueue
            if (event.TaskQueueName !== 'Voicemail') {
                return callback(null, response);
            }
            let taskSid = event.TaskSid;
            let taskAttributes = JSON.parse(event.TaskAttributes);
            let callSid = taskAttributes.call_sid;
            console.log("Task queue name:",event.TaskQueueName)
            console.log("Task attributes:",taskAttributes,)
            console.log("Call Sid:",callSid)
    
            let url = `https://${context.DOMAIN_NAME}/voicemail?taskSid=${taskSid}`;
    
            // redirect call to voicemail
            client.calls(callSid).update({
                method: 'POST',
                url: encodeURI(url)
            }).then(() => {
                return callback(null, response)
            }).catch(err => {
                response.setStatusCode(500);
                return callback(err, response)
            });
        break;
        default:
            callback(null, response);
        break;
    }
};