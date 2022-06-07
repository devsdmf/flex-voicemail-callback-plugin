import React from "react";

import { VERSION } from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import SyncHelper from "./helpers/syncHelper";
import VoicemailHelper from "./helpers/voicemailHelper";
import CallbackHelper from "./helpers/callbackHelper";
import registerVoicemailTaskChannel, {
  autoAcceptVoicemailTask,
} from "./helpers/voicemailTaskChannel";

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
    if (!VoicemailHelper.workerHasVoicemailBox()) {
      console.log('Worker does not have voicemail box');
      return;
    }

    this.registerReducers(manager);
    const options = { sortOrder: -1 };

    SyncHelper.init(manager);
    console.log(PLUGIN_NAME, " running");

    registerVoicemailTaskChannel(flex);
    autoAcceptVoicemailTask(flex, manager);

    flex.ViewCollection.Content.add(
      <flex.View name="voicemail-list" key="my-voicemail-list-key">
        <VoiceMailListContainer
          archiveHandler={VoicemailHelper.archiveVoicemail}
          openHandler={VoicemailHelper.openVoicemail}
        />
      </flex.View>
    );

    flex.ViewCollection.Content.add(
      <flex.View name="callback-list" key="plugin-callback-list-key">
        <CallbackListContainer
          handleCallbackRequest={CallbackHelper.handleCallbackRequest}
          deleteCallbackRequest={CallbackHelper.deleteCallbackRequest}
        />
      </flex.View>
    )

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
    )

    // pulls initial voicemail list value from sync
    manager.store.dispatch(VoicemailActions.initVoicemail());
    manager.store.dispatch(CallbackActions.initCallbacks());

    // call method in voicemail helper that subscribes to sync store.
    VoicemailHelper.subscribeToVoicemails();
    CallbackHelper.subscribeToCallbackRequests();
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
