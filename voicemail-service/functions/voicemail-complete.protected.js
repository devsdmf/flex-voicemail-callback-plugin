exports.handler = (context, event, callback) => {
  if (event.RecordingStatus == "completed") {
    console.log('[voicemail-complete] Received recording complete event');
    console.log('[voicemail-complete] Event => ', event);

    const client = context.getTwilioClient();

    const voicemailBox = decodeURIComponent(event.voicemailBox);

    client.sync
      .services(context.SYNC_SERVICE_SID)
      .syncLists(`voicemail-${voicemailBox}`)
      .syncListItems.create({
        data: {
          recordingSid: event.RecordingSid,
          url: event.RecordingUrl,
          timestamp: Math.floor(Date.now() / 1000),
          listenedTo: false,
          callerId: decodeURIComponent(event.callerId)
        },
      })
      .then((item) => {
        console.log('[voicemail-complete] Item => ', item);
        callback(null, item);
      })
      .catch(err => {
        console.error('Error creating sync item', err);
        callback(err);
      });
  } else {
    console.log('[voicemail-complete] Not a recording complete event');
    callback(null, "Not a recording complete event");
  }
};
