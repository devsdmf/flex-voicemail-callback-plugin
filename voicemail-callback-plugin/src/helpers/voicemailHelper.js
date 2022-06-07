import { Manager } from "@twilio/flex-ui";
import SyncHelper from "./syncHelper";

import Voicemail from "./Voicemail";

import { Actions } from "../states/VoiceMailListState";

const LIST_NAME_PREFIX = "voicemail-";
const VOICEMAIL_TASK_CHANNEL_NAME = "voicemail";

const voicemailBoxToListName = (voicemailBox) => `voicemail-${voicemailBox}`;

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

  static async voicemailBoxExists(voicemailBox) {
    return SyncHelper.listExists(voicemailBoxToListName(voicemailBox));
  }

  static workerHasVoicemailBox() {
    const voicemailBox = Manager.getInstance()
      .store.getState().flex.worker.attributes.voicemailBox ?? null;

    return voicemailBox !== null;
  }

  static fetchVoicemailBox() {
    return Manager.getInstance().store.getState().flex.worker.attributes
      .voicemailBox;
  }

  static async deleteVoicemail(id) {
    return new Promise((resolve, reject) => {
      const listName = voicemailBoxToListName(VoicemailHelper.fetchVoicemailBox());
      SyncHelper.deleteListItem(listName, id);
    });
  }

  static async archiveVoicemail(id) {
    return new Promise((resolve, reject) => {
      const listName = voicemailBoxToListName(VoicemailHelper.fetchVoicemailBox());
      SyncHelper.updateListItem(listName, id, { archived: true });
    });
  }

  static async handleVoicemail(id) {
    return new Promise((resolve, reject) => {
      const listName = voicemailBoxToListName(VoicemailHelper.fetchVoicemailBox());
      SyncHelper.updateListItem(listName, id, { handled: true });
    });
  }

  static async openVoicemail(id) {
    console.log("[VoicemailHelper] openVoicemail id=", id);

    const options = {
      method: "POST",
      body: new URLSearchParams({
        id: id,
        voicemailBox: VoicemailHelper.fetchVoicemailBox(),
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

      console.log("[VoicemailHelper] Task Created Sid=", responseData.taskSid);
    } catch (e) {
      console.log("[VoicemailHelper] Unable to create voicemail task:", e);
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
        task.voicemail.url ?? null,
        task.voicemail.archived ?? null,
        task.voicemail.handled ?? null
      );
  }

  static async fetchAllVoicemails() {
    const voicemailListItems =
      (await SyncHelper.getListItems(
        voicemailBoxToListName(VoicemailHelper.fetchVoicemailBox())
      )) || [];

    return voicemailListItems.map(item => VoicemailHelper.voicemailFromSyncListItem(item));
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
    const listId = voicemailBoxToListName(VoicemailHelper.fetchVoicemailBox());

    SyncHelper.subscribeForListUpdates(
      listId,
      VoicemailHelper.onSyncItemAdded,
      VoicemailHelper.onSyncItemRemoved,
      VoicemailHelper.onSyncItemUpdated
    );
  }

  static onSyncItemAdded(listItem) {
    console.log(`[VoicemailHelper] List item: ${listItem.item.index} was added`);
    const newVoicemail = VoicemailHelper.voicemailFromSyncListItem(listItem);
    Manager.getInstance().store.dispatch(Actions.addVoicemail(newVoicemail));
  }

  static onSyncItemRemoved(listItem) {
    console.log(`[VoicemailHelper] List item ${listItem.index} was removed`);
    Manager.getInstance().store.dispatch(
      Actions.removeVoicemail(listItem.index)
    );
  }

  static onSyncItemUpdated(listItem) {
    console.log(`[VoicemailHelper] List item ${listItem.item.index} was updated`);
    const updatedVoicemail =
      VoicemailHelper.voicemailFromSyncListItem(listItem);
    Manager.getInstance().store.dispatch(
      Actions.updateVoicemail(updatedVoicemail)
    );
  }
}
