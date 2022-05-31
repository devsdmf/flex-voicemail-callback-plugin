import { Component } from "react";

import VoicemailHelper from "../../helpers/voicemailHelper";
import { withTaskContext } from "@twilio/flex-ui";
import { withTheme } from "@twilio/flex-ui";
import { Button } from "@twilio/flex-ui-core";
import styled from "react-emotion";
import { Actions } from "@twilio/flex-ui";

const DeleteVoicemailButtonContainer = styled(Button)`
  margin-left: 4px;
  ${(props) => props.theme.TaskCanvasHeader.WrapupTaskButton}
`;

class VoicemailDeleteButton extends Component {
  constructor(props) {
    super(props);

    this.state = { clicked: false };
  }

  deleteVoicemailHandler(task) {
    this.setState({ clicked: true });
    console.log("deleteVoicemailHandler", task.sid);

    if (task.attributes.voicemail && task.attributes.voicemail.id !== null)
      VoicemailHelper.deleteVoicemail(task.attributes.voicemail.id);

    Actions.invokeAction("CompleteTask", { sid: task.sid });
  }

  render() {
    const { theme, task } = this.props;
    const { clicked } = this.state;

    return (
      <DeleteVoicemailButtonContainer
        disabled={clicked}
        theme={theme}
        onClick={() => this.deleteVoicemailHandler(task)}
      >
        CLOSE AND DELETE
      </DeleteVoicemailButtonContainer>
    );
  }
}

export default withTheme(withTaskContext(VoicemailDeleteButton));
