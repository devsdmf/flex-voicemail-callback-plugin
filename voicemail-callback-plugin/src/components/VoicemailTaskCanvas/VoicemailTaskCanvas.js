import { Component } from "react";
import VoicemailHelper from "../../helpers/voicemailHelper";
import { withTaskContext } from "@twilio/flex-ui";
import { withTheme } from "@twilio/flex-ui";
import Button from "@material-ui/core/Button";
import { Manager } from "@twilio/flex-ui";
import { Actions } from "@twilio/flex-ui";
import styled from "react-emotion";
import Tooltip from "@material-ui/core/Tooltip";

export const Container = styled("div")`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: auto;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 6px;
  padding-bottom: 6px;
  ${(props) => props.theme.TaskInfoPanel.Container}

  hr {
    border-color: ${(props) => props.theme.Tabs.LabelsContainer.borderColor};
  }
`;

export const CallbackButton = styled(Button)`
  width: 50%;
`;

class VoicemailTaskCanvas extends Component {
  constructor(props) {
    super(props);
  }

  startCall = (destination) => {
    Actions.invokeAction("StartOutboundCall", {
      destination,
      taskAttributes: { VoicemailCall: true },
    });
  };

  getOutboundCallDisabledReason = (workerActivity) => {
    const { outbound_call_flows, taskrouter_offline_activity_sid } =
      Manager.getInstance().serviceConfiguration;
    const isWorkerAvailable =
      workerActivity.sid !== taskrouter_offline_activity_sid;

    if (!outbound_call_flows)
      return "Native Outbound Calling not enabled on Flex account";

    if (!isWorkerAvailable) return "Outbound Calling not allowed when offline";

    return "";
  };

  render() {
    const { task, theme, workerActivity } = this.props;
    const outboundCallDisabledReason =
      this.getOutboundCallDisabledReason(workerActivity);

    if (!task) return <div></div>;

    const voicemail = VoicemailHelper.voicemailFromTaskAttributes(
      task.attributes
    );

    return (
      <Container theme={theme}>
        <span className="Twilio">
          <h2>Voicemail left on</h2>
          <p>{voicemail.createdDateTime} </p>

          <h2>Caller</h2>
          <p>{voicemail.callerNumber} </p>
          <hr />

          <audio ref="audio_tag" src={voicemail.url} controls />
          <hr />
          <h2>Transcription</h2>
          <p>{voicemail.transcription}</p>
          <hr />
          <Tooltip title={outboundCallDisabledReason}>
            <span>
              <CallbackButton
                variant="contained"
                color="primary"
                onClick={(e) => this.startCall(voicemail.callerId)}
                disabled={!!outboundCallDisabledReason}
              >
                Call Customer ({voicemail.callerId})
              </CallbackButton>
            </span>
          </Tooltip>
        </span>
      </Container>
    );
  }
}

export default withTheme(withTaskContext(VoicemailTaskCanvas));
