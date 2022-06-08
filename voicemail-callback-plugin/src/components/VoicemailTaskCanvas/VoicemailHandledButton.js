import { Component } from "react";

import { withTaskContext } from "@twilio/flex-ui";
import { withTheme } from "@twilio/flex-ui";
import { Button } from "@twilio/flex-ui-core";
import styled from "react-emotion";
import { Actions } from "@twilio/flex-ui";

import {
  handleVoicemail
} from '../../services/voicemail/VoicemailService';

const HandleVoicemailButtonContainer = styled(Button)`
  margin-left: 4px;
  ${(props) => props.theme.TaskCanvasHeader.WrapupTaskButton}
`;

class VoicemailHandledButton extends Component {
  constructor(props) {
    super(props);

    this.state = { clicked: false };
  }

  markAsHandledHandler(task) {
    this.setState({ clicked: true });

    if (task.attributes.voicemail && task.attributes.voicemail.id !== null)
      handleVoicemail(task.attributes.voicemail.id);

    Actions.invokeAction("CompleteTask", { sid: task.sid });
  }

  render() {
    const { theme, task } = this.props;
    const { clicked } = this.state;

    return (
      <HandleVoicemailButtonContainer
        disabled={clicked}
        theme={theme}
        onClick={() => this.markAsHandledHandler(task)}
      >
        MARK AS HANDLED
      </HandleVoicemailButtonContainer>
    );
  }
}

export default withTheme(withTaskContext(VoicemailHandledButton));
