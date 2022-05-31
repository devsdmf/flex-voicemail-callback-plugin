import VoicemailIcon from "@material-ui/icons/Voicemail";
import { VOICEMAIL_TASK_CHANNEL_NAME } from "./voicemailHelper";
import { Tab } from "@twilio/flex-ui";
import VoicemailTaskCanvasContainer from "../components/VoicemailTaskCanvas/VoicemailTaskCanvas.Container";
import VoicemailDeleteButton from "../components/VoicemailTaskCanvas/VoicemailDeleteButton";

export function autoAcceptVoicemailTask(flex, manager) {
  manager.workerClient.on("reservationCreated", (reservation) => {
    if (
      reservation.task.taskChannelUniqueName.toLowerCase() ===
      VOICEMAIL_TASK_CHANNEL_NAME
    ) {
      flex.Actions.invokeAction("AcceptTask", { sid: reservation.sid });
      //select the task
      flex.Actions.invokeAction("SelectTask", { sid: reservation.sid });
    }
  });
}

export default function registerVoicemailTaskChannel(flex) {
  const voicemailTaskChannel =
    flex.DefaultTaskChannels.createDefaultTaskChannel(
      "voicemail",
      (task) =>
        task.taskChannelUniqueName.toLowerCase() === VOICEMAIL_TASK_CHANNEL_NAME
    );

  voicemailTaskChannel.icons.active = <VoicemailIcon color="primary" />;
  voicemailTaskChannel.icons.list = <VoicemailIcon />;
  voicemailTaskChannel.icons.main = <VoicemailIcon />;
  voicemailTaskChannel.templates.TaskCanvasHeader.endButton = {
    Assigned: "CLOSE",
    Accepted: "CLOSE",
    Reserved: undefined,
    Wrapping: undefined,
    Completed: undefined,
    Canceled: undefined,
    Pending: undefined,
  };

  voicemailTaskChannel.addedComponents = [
    {
      target: "TaskCanvasTabs",
      component: (
        <Tab label="voicemail" key="voicemail-tab">
          <VoicemailTaskCanvasContainer />
        </Tab>
      ),
      options: {
        sortOrder: -1,
        if: (props) => props.task.status === "accepted",
      },
    },
    {
      target: "TaskCanvasHeader",
      component: <VoicemailDeleteButton key="voicemail-delete" />,
      options: {
        if: (props) => props.task.status === "accepted",
      },
    },
  ];

  flex.TaskChannels.register(voicemailTaskChannel);
}
