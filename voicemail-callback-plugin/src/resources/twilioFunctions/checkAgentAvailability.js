
// This is your new function. To start, set the name and path on the left.

exports.handler = function(context, event, callback) {
    response = new TwilioResponse();
    response.body.uri = "client:jmchargue"
    response.statusCode = 200
    
    
    
    return callback(null, response);
  };