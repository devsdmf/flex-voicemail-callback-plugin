exports.handler = function(context, event, callback) {
    // get configured twilio client
    const client = context.getTwilioClient();
    
    //Set up a response for the callback
    let response = new Twilio.Response();
    response.setStatusCode(204);
    
    //console log events
    console.log("Event firing",event)
    callback(null,response)
};