import { Manager } from '@twilio/flex-ui';
import { SyncClient } from 'twilio-sync';

const EVENT_ITEM_ADDED = 'itemAdded';
const EVENT_ITEM_REMOVED = 'itemRemoved';
const EVENT_ITEM_UPDATED = 'itemUpdated';

const client = new SyncClient(Manager.getInstance().user.token);

const tokenUpdateHandler = () => {
  console.log('[SyncService] Refreshing SyncClient token');

  const loginHandler = Manager.getInstance()
    .store
    .getState()
    .flex
    .session
    .loginHandler;

  const tokenInfo = loginHandler.getTokenInfo();
  const accessToken = tokenInfo.token;

  client.updateToken(accessToken);
};

export const initClient = (manager) => 
  manager.events.addListener('tokenUpdated', () => tokenUpdateHandler());

export const addList = async (listName) => client.list(listName)
  .then(_ => true)
  .catch(e => {
    console.error('[SyncService] An error occurred at trying to add new list', e);
    return false;
  });

export const removeList = async (listName) => client.list(listName)
  .then(list => list.removeList())
  .then(_ => true)
  .catch(e => {
    console.error('[SyncService] An error occurred at trying to remove list', e);
    return false;
  });

export const listExists = async (listName) => 
  client.list({ id: listName, mode: 'open_existing'})
    .then(_ => true)
    .catch(_ => false);

const pageHandler = (paginator) => 
  paginator.hasNextPage 
    ? paginator.nextPage().then(pageHandler)
    : paginator.items.map(item => ({ item }));

export const getListItems = async (listName) => 
  client.list({ id: listName })
    .then(list => list.getItems({ from: 0, order: 'asc' }))
    .then(results => pageHandler(results))
    .catch(e => {
      console.error('[SyncService] An error occurred at trying to get list items', e);
      return false;
    });

export const updateListItem = async (listName, index, data) =>
  client.list({ id: listName, mode: 'open_existing' })
    .then(list => {
      return list.get(index)
        .then(item => list.set(index, {
          ...item.data.value,
          ...data
        }))
        .then(_ => true);
    })
    .catch(e => {
      console.error('[SyncService] An error occurred when updating item', e);
      return false;
    });

export const deleteListItem = async (listName, index) => 
  client.list({ id: listName, mode: 'open_existing' })
    .then(list => list.remove(index))
    .then(_ => true)
    .catch(e => {
      console.error('[SyncService] An error occurred when removing item', e);
      return false;
    });

export const subscribeForListUpdates = async (
  listName,
  onSyncItemAdded,
  onSyncItemRemoved,
  onSyncItemUpdated
) => {
  const list = await client.list({ id: listName, mode: 'open_existing' });

  list.on(EVENT_ITEM_ADDED, (args) => onSyncItemAdded(args));
  list.on(EVENT_ITEM_REMOVED, (args) => onSyncItemRemoved(args));
  list.on(EVENT_ITEM_UPDATED, (args) => onSyncItemUpdated(args));
};
