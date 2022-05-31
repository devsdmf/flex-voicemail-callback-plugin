const TokenValidator = require("twilio-flex-token-validator").functionValidator;

exports.handler = TokenValidator(function (context, event, callback) {
  console.log("Event data:", event);
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  response.setStatusCode(200);
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  try {
    client.sync
      .services(context.SYNC_SERVICE_SID)
      .syncLists(`voicemail-${event.workerExtension}`)
      .syncListItems(event.id)
      .fetch()
      .then((voicemail) => {
        try {
          client.taskrouter
            .workspaces(context.TWILIO_WORKSPACE_SID)
            .tasks.create({
              attributes: JSON.stringify({
                type: "voicemailListen",
                voicemail: {
                  id: voicemail.index,
                  timestamp: voicemail.data.timestamp,
                  callerId: voicemail.data.callerId,
                  transcription: voicemail.data.transcription,
                  url: voicemail.data.url,
                },
                from: `Voicemail from:${voicemail.data.callerId}`,
                workerSID: event.TokenResult.worker_sid,
              }),
              workflowSid: context.DIRECTCALL_WORKFLOW_SID,
              taskChannel: "voicemail",
            })
            .then((task) => {
              console.log("Task created", task);
              console.log(`Updating Sync list for workerExtension: ${event.workerExtension} for voicemail index: ${event.id}`)
              voicemail.data.listenedTo = true;
              console.log("Voicemail sync list item", voicemail);
              client.sync
                .services(context.SYNC_SERVICE_SID)
                .syncLists(`voicemail-${event.workerExtension}`)
                .syncListItems(event.id)
                .update(voicemail)
                .then(() => {
                  console.log("Sync List item updated");
                  response.appendHeader('Content-Type','application/json')
                  response.setBody({"taskSid":task.sid})
                  return callback(null,response);
                })
                .catch((e) => {
                  console.log("Error updating sync list item", e);
                  response.setStatusCode(500);
                  response.setBody(e)
                  return callback(null, response);
                });
            })
            .catch((e) => {
              console.log("Bad error", e);
              response.setStatusCode(500);
              return callback(null, response);
            });
        } catch (e) {
          console.log("Error happened", e);
          response.setStatusCode(500);
          return callback(null, response);
        }
      })
      .catch((e) => {
        console.log("Error happened", e);
        response.setStatusCode(500);
        return callback(null, response);
      });
  } catch (e) {
    console.log("Bad error", e);
    response.setStatusCode(500);
    response.setBody(e);
    return callback(null, response);
  }
});
