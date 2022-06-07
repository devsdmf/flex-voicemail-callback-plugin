import { Manager } from "@twilio/flex-ui";
import SyncHelper from "./syncHelper";

import CallbackRequest from "./CallbackRequest";

import { Actions } from "../states/CallbackListState";

const CALLBACK_TASK_CHANNEL_NAME = 'callback';

export { CALLBACK_TASK_CHANNEL_NAME };

const callbackStoreToListName = (callbackStore) => `callback-${callbackStore}`;

export default class CallbackHelper {

  static taskChannelsBlockingNewTask = ["voice", CALLBACK_TASK_CHANNEL_NAME];

  static allowCreateNewCallbackTask(tasks, available) {
    if (!available) return false;

    for (const [reservationSid, task] of tasks) {
      if (this.taskChannelsBlockingNewTask.includes(
        task.channelType.toLowerCase()
      )) {
        return false;
      }
    }

    return true;
  }

  static fetchCallbackStores() {
    return Manager.getInstance().store.getState()
      .flex
      .worker
      .attributes
      .callbackStores ?? [];
  }

  static workerCanPerformCallback() {
    const callbackStores = CallbackHelper.fetchCallbackStores();

    return callbackStores.length > 0;
  }

  static async deleteCallbackRequest(id, callbackStore) {
    const listName = callbackStoreToListName(callbackStore);
    return SyncHelper.deleteListItem(listName, id);
  }

  static async handleCallbackRequest(id, callbackStore) {
    console.log('[CallbackHelper] handleCallbackRequest id=', id, callbackStore);
    const listName = callbackStoreToListName(callbackStore);
    return SyncHelper.updateListItem(listName, id, { handled: true });
  }

  static async openCallbackRequest(id, callbackStore) {
    console.log('[CallbackHelper] openCallbackReuest id=', id, callbackStore);
  }

  static async fetchAllCallbackRequests() {
    console.log('[CallbackHelper] fetchAllCallbackRequests');
    const callbackStores = this
      .fetchCallbackStores()
      .map(store => SyncHelper
        .getListItems(callbackStoreToListName(store))
        .then(items => items.map(i => ({ ...i, store })))
      );

    return (await Promise.all(callbackStores)).flat()
      .map(item => CallbackHelper.callbackRequestFromSyncListItem(item));
  }

  static callbackRequestFromSyncListItem(listItem) {
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
      phoneNumber ?? "unknown",
      handled ?? false
    );
  }

  static subscribeToCallbackRequests() {
    this.fetchCallbackStores().map(store => {
      const listName = callbackStoreToListName(store);
      SyncHelper.subscribeForListUpdates(
        listName,
        CallbackHelper.onSyncItemAdded,
        CallbackHelper.onSyncItemRemoved,
        CallbackHelper.onSyncItemUpdated
      );
    });
  }

  static onSyncItemAdded(listItem) {
    // TODO: Improve this handler to do not refresh the whole list
    console.log('[CallbackHelper] New item added => ', listItem);
    Manager.getInstance().store.disaptch(Actions.initCallbacks());
  }

  static onSyncItemRemoved(listItem) {
    // TODO: Improve this handler to do not refresh the whole list
    console.log('[CallbackHelper] Item removed => ', listItem);
    Manager.getInstance().store.dispatch(Actions.initCallbacks());
  }

  static onSyncItemUpdated(listItem) {
    // TODO: Improve this handler to do not refresh the whole list
    console.log('[CallbackHelper] Item updated => ', listItem);
    Manager.getInstance().store.dispatch(Actions.initCallbacks());
  }
}
