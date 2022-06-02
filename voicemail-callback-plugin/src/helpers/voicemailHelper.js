import { Manager } from "@twilio/flex-ui";
import SyncHelper from "./syncHelper";
import { SyncClient } from "twilio-sync";
import { updateWorkerAttributes } from "./workerHelpers";
import Voicemail from "./Voicemail";
import { Actions } from "../states/VoiceMailListState";
import { PLUGIN_NAME } from "../VoicemailCallbackPlugin";

const LIST_NAME_PREFIX = "voicemail-";
const ATTRIBUTE_NAME = "workerExtension";
const VOICEMAIL_TASK_CHANNEL_NAME = "voicemail";
const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

function extensionToListName(extension) {
  return LIST_NAME_PREFIX + extension;
}

export { VOICEMAIL_TASK_CHANNEL_NAME };

export default class VoicemailHelper {
  static taskChannelsBlockingNewTask = ["voice", VOICEMAIL_TASK_CHANNEL_NAME];
  static allowCreateNewVoicemailTask(tasks, available) {
    if (!available) return false;

    for (const [reservationSid, task] of tasks) {
      if (
        this.taskChannelsBlockingNewTask.includes(
          task.channelType.toLowerCase()
        )
      )
        return false;
    }
    return true;
  }
  static workerNameFromExtenstion(extension) {
    return new Promise((resolve, reject) => {
      const insightsClient = Manager.getInstance().insightsClient;

      insightsClient.instantQuery("tr-worker").then((q) => {
        // handle the search result event and resolve the promise
        q.on("searchResult", (items) => {
          // items is key, value pairs of worker sid key -> worker value (should just be one or zero values)
          const matchingWorker = Object.values(items)[0];

          if (matchingWorker) {
            resolve(matchingWorker.attributes.full_name);
            console.log("Test:",matchingWorker.attributes.full_name);
          } else {
            resolve(null);
          }
        });

        // initiate the search
        q.search(`data.attributes.${ATTRIBUTE_NAME} eq '${extension}' `);
      });
    });
  }
  static async extensionExists(extension) {
    return SyncHelper.listExists(extensionToListName(extension));
  }

  static fetchExtension() {
    return Manager.getInstance().store.getState().flex.worker.attributes
      .voicemailBox;
  }

  static async addExtension(worker, extension) {
    const workerAttribute = `{"${ATTRIBUTE_NAME}":"${extension}"}`;
    await updateWorkerAttributes(worker, JSON.parse(workerAttribute));
    await SyncHelper.addList(extensionToListName(extension));
  }

  static async deleteExtension(worker, extension) {
    const workerAttribute = `{"${ATTRIBUTE_NAME}":""}`;
    await updateWorkerAttributes(worker, JSON.parse(workerAttribute));
    await SyncHelper.removeList(extensionToListName(extension));
  }

  static async deleteVoicemail(id) {
    return new Promise((resolve, reject) => {
      const listName = extensionToListName(VoicemailHelper.fetchExtension());
      SyncHelper.deleteListItem(listName, id);
    });
  }

  static async archiveVoicemail(id) {
    return new Promise((resolve, reject) => {
      const listName = extensionToListName(VoicemailHelper.fetchExtension());
      SyncHelper.updateListItem(listName, id, { archived: true });
    });
  }

  static async handleVoicemail(id) {
    return new Promise((resolve, reject) => {
      const listName = extensionToListName(VoicemailHelper.fetchExtension());
      SyncHelper.updateListItem(listName, id, { handled: true });
    });
  }

  static async openVoicemail(id) {
    console.log(PLUGIN_NAME, " openVoicemail id=", id);

    const options = {
      method: "POST",
      body: new URLSearchParams({
        id: id,
        voicemailBox:
          Manager.getInstance().store.getState().flex.worker.attributes
            .voicemailBox,
        Token:
          Manager.getInstance().store.getState().flex.session.ssoTokenPayload
            .token,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    };

    try {
      const fetchResponse = await fetch(
        `${process.env.FLEX_APP_TWILIO_SERVERLESS_DOMAIN}/create-voicemail-listen-task`,
        options
      );

      const responseData = await fetchResponse.json();

      console.log(PLUGIN_NAME, " Task Created Sid=", responseData.taskSid);
    } catch (e) {
      console.log(PLUGIN_NAME, " Unable to create voicemail task:", e);
    }
  }
  static voicemailFromTaskAttributes(task) {
    if (!task.voicemail) return new Voicemail(null, 0, false, "unknown", null);
    else
      return new Voicemail(
        task.voicemail.id ?? null,
        task.voicemail.timestamp ? task.voicemail.timestamp * 1000 : 0,
        true,
        task.voicemail.callerId ?? "",
        task.voicemail.transcription ?? null,
        task.voicemail.url ?? null
      );
  }

  static async fetchAllVoicemails() {
    const voicemailListItems =
      (await SyncHelper.getListItems(
        extensionToListName(VoicemailHelper.fetchExtension())
      )) || [];

    const voicemails = [];
    voicemailListItems.forEach((voicemailListItem) => {
      voicemails.push(
        VoicemailHelper.voicemailFromSyncListItem(voicemailListItem)
      );
    });
    return voicemails;
  }

  static voicemailFromSyncListItem(listItem) {
    return new Voicemail(
      listItem.item.data.index ?? null,
      listItem.item.data.value.timestamp
        ? listItem.item.data.value.timestamp * 1000
        : 0,
      listItem.item.data.value.listenedTo ?? false,
      listItem.item.data.value.callerId ?? "unknown",
      listItem.item.data.value.transcription ?? null,
      listItem.item.data.value.url ?? null,
      listItem.item.data.value.archived ?? false,
      listItem.item.data.value.handled ?? false
    );
  }

  static subscribeToVoicemails() {
    const listId = extensionToListName(VoicemailHelper.fetchExtension());

    SyncHelper.subscribeForListUpdates(
      listId,
      VoicemailHelper.onSyncItemAdded,
      VoicemailHelper.onSyncItemRemoved,
      VoicemailHelper.onSyncItemUpdated
    );
  }

  static onSyncItemAdded(listItem) {
    console.log(PLUGIN_NAME, ` List item: ${listItem.item.index} was added`);
    const newVoicemail = VoicemailHelper.voicemailFromSyncListItem(listItem);
    Manager.getInstance().store.dispatch(Actions.addVoicemail(newVoicemail));
  }

  static onSyncItemRemoved(listItem) {
    console.log(PLUGIN_NAME, ` List item ${listItem.index} was removed`);
    Manager.getInstance().store.dispatch(
      Actions.removeVoicemail(listItem.index)
    );
  }

  static onSyncItemUpdated(listItem) {
    console.log(PLUGIN_NAME, ` List item ${listItem.item.index} was updated`);
    const updatedVoicemail =
      VoicemailHelper.voicemailFromSyncListItem(listItem);
    Manager.getInstance().store.dispatch(
      Actions.updateVoicemail(updatedVoicemail)
    );
  }
}
