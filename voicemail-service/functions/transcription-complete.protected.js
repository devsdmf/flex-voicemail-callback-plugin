exports.handler = (context, event, callback) => {
  console.log('[transcription-complete] Received transcription complete event');
  console.log('[transcription-complete] Event => ', event);

  const client = context.getTwilioClient();
  const voicemailBox = decodeURIComponent(event.voicemailBox);
  const listName = `voicemail-${voicemailBox}`;

  const service = client.sync.services(context.SYNC_SERVICE_SID);

  service 
    .syncLists(listName)
    .syncListItems.list({ order: 'desc' })
    .then(items => {
      items.forEach(item => {
        if (item.data.recordingSid == event.RecordingSid) {
          const data = item.data;
          data['transcription'] = event.TranscriptionText;

          service
            .syncLists(listName)
            .syncListItems(item.index)
            .update({ data })
            .then(updatedItem => {
              console.log('Sync Item updated => ', updatedItem);
              callback(null, 'success');
            })
            .catch(err => {
              console.error('Error occurred when updating sync item', err);
              callback(err, 'error');
            });
        }
      })
    })
    .catch(err => {
      console.error('An error occurred at trying to fetch sync item', err);
      callback(err);
    });
};
