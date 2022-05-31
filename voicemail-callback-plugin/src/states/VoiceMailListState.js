import { Manager } from "@twilio/flex-ui";
import SyncHelper from "../helpers/syncHelper";
import VoicemailHelper from "../helpers/voicemailHelper";

const ACTION_UPDATE_VOICEMAIL_LIST = "UPDATE_VOICEMAIL_LIST";

const initialState = {
  voicemails: [],
};

const extension =
  Manager.getInstance().store.getState().flex.worker.attributes.workerExtension;


export const Actions = {
  initVoicemail: () => ({
    type: "UPDATE_VOICEMAIL_LIST",
    payload: VoicemailHelper.fetchAllVoicemails(),
  }),
  addVoicemail(voicemail) {
    return {
      type: "ADD_VOICEMAIL",
      payload: voicemail,
    };
  },
  removeVoicemail(id) {
    return {
      type: "REMOVE_VOICEMAIL",
      payload: id,
    };
  },
  updateVoicemail(voicemail) {
    return {
      type: "UPDATE_VOICEMAIL",
      payload: voicemail,
    };
  },
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case "ADD_VOICEMAIL":
      return {
        ...state,
        voicemails: [...state.voicemails, action.payload],
      };
    case "REMOVE_VOICEMAIL":
      return {
        ...state,
        voicemails: state.voicemails.filter(
          (voicemail) => voicemail.id !== action.payload
        ),
      };
    case "UPDATE_VOICEMAIL":
      return {
        ...state,
        voicemails: state.voicemails.map((voicemail, id) => {
          if (voicemail.id === action.payload.id) {
            return action.payload;
          }
          return voicemail;
        }),
      };
    // redux-promise pending state
    case `${ACTION_UPDATE_VOICEMAIL_LIST}_PENDING`:
      return state;
    // success state:
    case `${ACTION_UPDATE_VOICEMAIL_LIST}_FULFILLED`:
      return { ...state, voicemails: action.payload };
    // failure state:
    case `${ACTION_UPDATE_VOICEMAIL_LIST}_REJECTED`:
      return {
        ...state,
        error: action.payload.error,
      };
    default:
      return state;
  }
}
