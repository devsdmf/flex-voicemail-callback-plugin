import { Manager } from "@twilio/flex-ui";

import {
  deleteListItem,
  getListItems,
  subscribeForListUpdates,
  updateListItem,
} from '../SyncService';

import Voicemail from './Voicemail';

import { Actions } from '../../states/VoiceMailListState';

const SERVERLESS_DOMAIN = `${process.env.FLEX_APP_TWILIO_SERVERLESS_DOMAIN}`;
const VOICEMAIL_TASK_ENDPOINT = 'create-voicemail-listen-task';

const getToken = () => Manager.getInstance()
  .store
  .getState()
  .flex
  .session
  .ssoTokenPayload
  .token;

const defaultRequestHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
};

const voicemailBoxToList = (voicemailBox) => `voicemail-${voicemailBox}`;

export const VOICEMAIL_TASK_CHANNEL_NAME = 'voicemail';

export const fetchVoicemailBox = () => Manager.getInstance()
  .store
  .getState()
  .flex
  .worker
  .attributes
  .voicemailBox ?? null;

export const workerHasVoicemailBox = () => 
  fetchVoicemailBox() !== null;

export const deleteVoicemail = async (id) => 
  deleteListItem(
    voicemailBoxToList(fetchVoicemailBox()),
    id
  );

export const archiveVoicemail = async (id) =>
  updateListItem(
    voicemailBoxToList(fetchVoicemailBox()),
    id,
    { archived: true }
  );

export const handleVoicemail = async (id) =>
  updateListItem(
    voicemailBoxToList(fetchVoicemailBox()),
    id,
    { handled: true }
  );

export const openVoicemail = async (id) => {
  const options = {
    method: 'POST',
    body: new URLSearchParams({
      id,
      voicemailBox: fetchVoicemailBox(),
      Token: getToken()
    }),
    headers: defaultRequestHeaders
  };

  const url = `${SERVERLESS_DOMAIN}/${VOICEMAIL_TASK_ENDPOINT}`;

  return fetch(url, options)
    .then(res => res.json())
    .then(data => data.taskSid)
    .catch(e => {
      console.error('[VoicemailService] An error occurred at trying to create task', e);
      return false;
    });
};

export const fetchAllVoicemails = async () => 
  getListItems(fetchVoicemailBox())
    .then(items => items.map(_ => voicemailFromSyncListItem(_)))
    .catch(e => {
      console.error('[VoicemailService] An error occurred ', e);
    });

const voicemailFromSyncListItem = (listItem) => new Voicemail(
  listItem.item.data.index ?? null,
  listItem.item.data.value.timestamp 
    ? listItem.item.data.value.timestamp * 1000
    : 0,
  listItem.item.data.value.listenedTo ?? false,
  listItem.item.data.value.callerId ?? 'unknown',
  listItem.item.data.value.transcription ?? null,
  listItem.item.data.value.url ?? null,
  listItem.item.data.value.archived ?? false,
  listItem.item.data.value.handled ?? false
);

export const voicemailFromTaskAttributes = (task) => {
  if (!task.voicemail)
    return new Voicemail(null, 0, false, 'unknown', null);

  return new Voicemail(
    task.voicemail.id ?? null,
    task.voicemail.timestamp ? task.voicemail.timestamp * 1000 : 0,
    true,
    task.voicemail.callerId ?? '',
    task.voicemail.transcription ?? null,
    task.voicemail.url ?? null,
    task.voicemail.archived ?? null,
    task.voicemail.handled ?? null
  );
};

export const subscribeToVoicemails = () =>
  subscribeForListUpdates(
    voicemailBoxToList(fetchVoicemailBox()),
    onSyncItemAdded,
    onSyncItemRemoved,
    onSyncItemUpdated
  );

const onSyncItemAdded = (listItem) => 
  Manager.getInstance().store.dispatch(
    Actions.addVoicemail(voicemailFromSyncListItem(listItem))
  );

const onSyncItemRemoved = (listItem) =>
  Manager.getInstance().store.dispatch(
    Actions.removeVoicemail(listItem.index)
  );

const onSyncItemUpdated = (listItem) =>
  Manager.getInstance().store.dispatch(
    Actions.updateVoicemail(voicemailFromSyncListItem(listItem))
  );



