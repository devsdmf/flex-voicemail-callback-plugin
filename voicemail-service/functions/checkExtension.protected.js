// This is your new function. To start, set the name and path on the left.

exports.handler = function (context, event, callback) {
  const client = context.getTwilioClient();
  let response = new Twilio.Response();
  response.setStatusCode(204);

  const extension = event.extension;

  try {
    client.sync
      .services(context.SYNC_SERVICE_SID)
      .syncLists(`voicemail-${event.extension}`)
      .fetch()
      .then((sync_list) => {
        console.log(sync_list.uniqueName, "found");
        callback(null, { result: true });
      })
      .catch((e) => {
        console.log(extension, "not found");
        callback(null, { result: false });
      });
  } catch (e) {
    console.log("Function error:", e);
    response.setStatusCode(500);
    callback(e, response);
  }
};
