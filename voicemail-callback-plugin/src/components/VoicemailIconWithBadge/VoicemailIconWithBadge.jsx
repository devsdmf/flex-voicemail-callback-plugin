import React from "react";

import VoicemailIcon from "@material-ui/icons/Voicemail";
import Badge from "@material-ui/core/Badge";

import {
  workerHasVoicemailBox
} from '../../services/voicemail/VoicemailService';

export default class VoicemailIconWithBadge extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const voicemails = this.props.voicemails;
    const newVoicemails = voicemails.filter(voicemail => voicemail.listenedToFlag === false);
    const length = newVoicemails.length;
    if (!workerHasVoicemailBox()) {
      return null;
    }

    if (length === 0) {
      return (
        <Badge>
          <VoicemailIcon color="disabled" />
        </Badge>
      );
    }

    return (
      <Badge badgeContent={length}>
        <VoicemailIcon />
      </Badge>
    );
  }
};
