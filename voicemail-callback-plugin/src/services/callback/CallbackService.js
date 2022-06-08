import { Manager } from "@twilio/flex-ui";

import {
  deleteListItem,
  getListItems,
  subscribeForListUpdates,
  updateListItem
} from '../SyncService';

import CallbackRequest from './CallbackRequest';

import { Actions } from "../../states/CallbackListState";

const callbackStoreToList = (store) => `callback-${store}`;

export const fetchCallbackStores = () =>
  Manager.getInstance().store.getState()
    .flex
    .worker
    .attributes
    .callbackStores ?? [];

export const workerCanPerformCallback = () => 
  fetchCallbackStores().length > 0;

export const deleteCallbackRequest = async (id, callbackStore) =>
  deleteListItem(callbackStoreToList(callbackStore), id);

export const handleCallbackRequest = async (id, callbackStore) => 
  updateListItem(
    callbackStoreToList(callbackStore),
    id,
    { handled: true }
  );

export const fetchAllCallbackRequests = async () => {
  const callbackStores = fetchCallbackStores()
    .map(store => getListItems(callbackStoreToList(store))
      .then(items => items.map(i => ({ ...i, store })))
      .catch(e => {
        console.error('[CallbackService] An error occurred', e);
        return [];
      })
    );

  return (await Promise.all(callbackStores)).flat()
    .map(item => callbackRequestFromSyncListItem(item));
};

export const subscribeToCallbackRequests = () => 
  fetchCallbackStores().map(store => {
    subscribeForListUpdates(
      callbackStoreToList(store),
      onSyncItemAdded,
      onSyncItemRemoved,
      onSyncItemUpdated
    );
  });

const onSyncItemAdded = (listItem) =>
  Manager.getInstance().store.dispatch(Actions.initCallbacks());

const onSyncItemRemoved = (listItem) =>
  Manager.getInstance().store.dispatch(Actions.initCallbacks());

const onSyncItemUpdated = (listItem) =>
  Manager.getInstance().store.dispatch(Actions.initCallbacks());

const callbackRequestFromSyncListItem = (listItem) => {
  const id = listItem.item.data.index ?? null;
  const {
    timestamp,
    phoneNumber,
    handled
  } = listItem.item.data.value;

  return new CallbackRequest(
    listItem.item.data.index ?? null,
    listItem.store,
    timestamp * 1000,
    phoneNumber ?? 'unknown',
    handled ?? false
  );
};

