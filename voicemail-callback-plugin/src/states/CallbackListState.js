import { Manager } from "@twilio/flex-ui";
import { fetchAllCallbackRequests } from '../services/callback/CallbackService';

const ACTION_UPDATE_CALLBACK_LIST = "UPDATE_CALLBACK_LIST";

const initialState = {
  callbackRequests: []
};

export const Actions = {
  initCallbacks: () => ({
    type: ACTION_UPDATE_CALLBACK_LIST,
    payload: fetchAllCallbackRequests(),
  }),
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case `${ACTION_UPDATE_CALLBACK_LIST}_PENDING`:
      return state;
    case `${ACTION_UPDATE_CALLBACK_LIST}_FULFILLED`: 
      return { ...state, callbackRequests: action.payload };
    case `${ACTION_UPDATE_CALLBACK_LIST}_REJECTED`:
      return {
        ...state,
        error: action.payload.error,
      };
    default:
      return state;
  }
};
