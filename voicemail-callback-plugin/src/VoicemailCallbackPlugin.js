import React from "react";

import { VERSION } from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import {
  initClient as initSyncClient
} from './services/SyncService';

import {
  archiveVoicemail,
  openVoicemail,
  subscribeToVoicemails,
  workerHasVoicemailBox,
} from './services/voicemail/VoicemailService';

import {
  deleteCallbackRequest,
  handleCallbackRequest,
  subscribeToCallbackRequests,
  workerCanPerformCallback,
} from './services/callback/CallbackService';

import registerVoicemailTaskChannel, {
  autoAcceptVoicemailTask,
} from './services/voicemail/VoicemailTaskChannel';

import reducers, { namespace } from "./states";
import { Actions as VoicemailActions } from "./states/VoiceMailListState";
import { Actions as CallbackActions } from "./states/CallbackListState";

import VoiceMailListContainer from "./components/VoiceMailList/VoiceMailList.Container";
import VoicemailIconWithBadgeContainer from "./components/VoicemailIconWithBadge/VoicemailIconWithBadge.Container";

import CallbackIconWithBadgeContainer from "./components/CallbackIconWithBadge/CallbackIconWithBadge.Container";
import CallbackListContainer from "./components/CallbackList/CallbackList.Container";

export const PLUGIN_NAME = "VoicemailCallbackPlugin";

export default class VoicemailCallbackPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    if (!workerHasVoicemailBox()) {
      console.log('Worker does not have voicemail box');
      return;
    }

    this.registerReducers(manager);
    const options = { sortOrder: -1 };

    initSyncClient(manager);

    console.log(PLUGIN_NAME, " running");

    if (workerHasVoicemailBox()) {
      console.log('[VoicemailCallbackPlugin] Worker has voicemail');

      registerVoicemailTaskChannel(flex);
      autoAcceptVoicemailTask(flex, manager);


      flex.ViewCollection.Content.add(
        <flex.View name="voicemail-list" key="plugin-voicemail-list-key">
          <VoiceMailListContainer
            archiveHandler={archiveVoicemail}
            openHandler={openVoicemail}
          />
        </flex.View>
      );

      flex.SideNav.Content.add(
        <flex.SideLink
          showLabel={true}
          icon={<VoicemailIconWithBadgeContainer />}
          isActive={false}
          onClick={() => {
            flex.Actions.invokeAction("HistoryPush", `/voicemail-list`);
          }}
          key="voicemailListSideLink"
        >
          Voicemail List
        </flex.SideLink>
      );

      manager.store.dispatch(VoicemailActions.initVoicemail());

      subscribeToVoicemails();
    }

    if (workerCanPerformCallback()) {
      console.log('[VoicemailCallbackPlugin] Worker has callback');

      flex.ViewCollection.Content.add(
        <flex.View name="callback-list" key="plugin-callback-list-key">
          <CallbackListContainer
            handleCallbackRequest={handleCallbackRequest}
            deleteCallbackRequest={deleteCallbackRequest}
          />
        </flex.View>
      );

      flex.SideNav.Content.add(
        <flex.SideLink
          showLabel={true}
          icon={<CallbackIconWithBadgeContainer />}
          isActive={false}
          onClick={() => {
            flex.Actions.invokeAction("HistoryPush", `/callback-list`);
          }}
          key="callbackListSideLink"
        >
          Callback Requests
        </flex.SideLink>
      );

      manager.store.dispatch(CallbackActions.initCallbacks());

      subscribeToCallbackRequests();
    }
  }

  /**
   * Registering the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      console.error(
        `You need FlexUI > 1..0 to use built-in redux; you are currently on version ${VERSION}.`
      );
      return;
    }
    manager.store.addReducer(namespace, reducers);
  }
}
