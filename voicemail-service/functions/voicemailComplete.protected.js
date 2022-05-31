exports.handler = function (context, event, callback) {
  if (event.RecordingStatus == "completed") {
    const client = context.getTwilioClient(),
      taskSid = event.taskSid,
      segmentLink = event.RecordingUrl;

    client.sync
      .services(context.SYNC_SERVICE_SID)
      .syncLists(`voicemail-${event.workerExtension}`)
      .syncListItems.create({
        data: {
          recordingSid: event.RecordingSid,
          url: event.RecordingUrl,
          timestamp: Math.floor(Date.now() / 1000),
          listenedTo: false,
          callerId: decodeURIComponent(event.callerId),
        },
      })
      .then((sync_list_item) => {
        //console.log(sync_list_item)
        callback(null, sync_list_item);
      })
      .catch((e) => {
        console.log("Error creating sync item", e);
        callback(e);
      });
  } else {
    callback(null, "Not a recording complete event");
  }
};
