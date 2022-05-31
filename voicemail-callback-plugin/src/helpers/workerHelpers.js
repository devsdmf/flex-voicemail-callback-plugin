import axios from "axios";
import { Manager } from "@twilio/flex-ui";
import { stringify } from "query-string";
import { PLUGIN_NAME } from "../PerAgentVoicemailPlugin";

export async function updateWorkerAttributes(worker, attributesToMergeIn) {
  const manager = Manager.getInstance();

  const payload = {
    WorkerSid: worker.sid,
    Token: manager.store.getState().flex.session.ssoTokenPayload.token,
    UpdatedAttributes: attributesToMergeIn,
  };

  try {
    const response = await axios.post(
      `${process.env.FLEX_APP_TWILIO_SERVERLESS_DOMAIN}/updateWorkerAttributes`,
      payload
    );

    console.log(
      PLUGIN_NAME,
      "worker attributes updated",
      worker.sid,
      response.data
    );
  } catch (error) {
    console.log(PLUGIN_NAME, "worker attributes update failed", worker.sid),
      error;
  }
}
