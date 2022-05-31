const twilioVersion = require("twilio/package.json").version;
const TokenValidator = require("twilio-flex-token-validator").functionValidator;

// expects json object in event.UpdateAttributes, WorkerSid string in event.WorkerSid and a valid Flex Token in event.Token.
// it will merge in the new attributes with exsiting attributes and return the new workers attributes.
// Tested with POST with content type json and {WorkerSid:"xx", Token:"xx", UpdatedAttributes:{xxxx}}

// TODO - check TokenResult and don't allow agent role to change another workers attributes?

exports.handler = TokenValidator(async function (context, event, callback) {
  const client = context.getTwilioClient();
  const response = new Twilio.Response();

  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { WorkerSid, UpdatedAttributes } = event;

    const worker = await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .workers(WorkerSid)
      .fetch();

    var workersAttributes = JSON.parse(worker.attributes);

    workersAttributes = {
      ...workersAttributes,
      ...UpdatedAttributes,
    };

    const updateWorker = await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .workers(WorkerSid)
      .update({ attributes: JSON.stringify(workersAttributes) });

    console.log(
      `Updated ${WorkerSid} attributes with ${JSON.stringify(
        UpdatedAttributes
      )}`
    );

    response.appendHeader("Content-Type", "application/json");
    response.setBody(JSON.parse(updateWorker.attributes));
    return callback(null, response);
  } catch (err) {
    returnError(callback, response, err.message);
  }
});

const returnError = (callback, response, errorString) => {
  console.error(errorString);
  response.appendHeader("Content-Type", "plain/text");
  response.setBody(errorString);
  response.setStatusCode(500);
  return callback(null, response);
};
