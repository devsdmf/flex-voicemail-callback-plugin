import { combineReducers } from "redux";

import { reduce as VoiceMailListReducer } from "./VoiceMailListState";
import { reduce as CallbackListReducer } from "./CallbackListState";

// Register your redux store under a unique namespace
export const namespace = "agent-voicemail";

// Combine the reducers
export default combineReducers({
  VoiceMailList: VoiceMailListReducer,
  CallbackList: CallbackListReducer
});
