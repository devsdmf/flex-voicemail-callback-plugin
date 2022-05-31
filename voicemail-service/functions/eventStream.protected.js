exports.handler = function(context, event, callback) {
    // get configured twilio client
    const client = context.getTwilioClient();
    let domainName = `https://${context.DOMAIN_NAME}`
    if(domainName.includes('localhost'))
    {
        domainName = context.NGROK_URL
    }
    // setup an empty success response
    let response = new Twilio.Response();
    response.setStatusCode(204);
    
    // switch on the event type
    if(event.EventType == 'task-queue.entered'){
            console.log("Task Queue:",event.TaskQueueName)
            
            // If event is not Task Queue of Voicemail, end function
            if (event.TaskQueueName !== 'Voicemail') {
                return callback(null, response);
            }
            
            let taskSid = event.TaskSid;
            let taskAttributes = JSON.parse(event.TaskAttributes);
            let callSid = taskAttributes.call_sid;
            let url = `${domainName}/voicemail?taskSid=${taskSid}&workerExtension=${taskAttributes.workerExtension}`;          
   
            // redirect call to voicemail
            client.calls(callSid).update({
                method: 'POST',
                url: encodeURI(url)
            }).then(() => {
                return callback(null, response)
            }).catch(err => {
                console.log("Redirect error",err)
                response.setStatusCode(500);
                return callback(err, response)
            });

    }
    else{
        callback(null,response)
    }
};