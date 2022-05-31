exports.handler = function (context, event, callback) {
  const client = context.getTwilioClient();

  client.sync
    .services(context.SYNC_SERVICE_SID)
    .syncLists(`voicemail-${event.workerExtension}`)
    .syncListItems.list({ order: 'desc' })
    .then((syncListItems) => {
      syncListItems.forEach((listItem) => {
        //find the index in the list of the correct voicemail
        if (listItem.data.recordingSid == event.RecordingSid) {
          dataObject = listItem.data;
          dataObject["transcription"] = event.TranscriptionText;

          //Add transcription to the voicemail sync list item
          client.sync
            .services(context.SYNC_SERVICE_SID)
            .syncLists(`voicemail-${event.workerExtension}`)
            .syncListItems(listItem.index)
            .update({ data: dataObject })
            .then((sync_list_item) => {
              console.log(sync_list_item.index);
              callback(null, "success");
            })
            .catch((e) => {
              console.log("Error", e);
              callback(e, "Error");
            });
        }
      });
    })
    .catch((e) => {
      console.log("Bad error", e);
      callback(e);
    });
};
