import React from "react";

import CallbackIcon from "@material-ui/icons/PhoneCallback";
import Badge from "@material-ui/core/Badge";

import {
  workerCanPerformCallback,
} from '../../services/callback/CallbackService';

export default class CallbackIconWithBadge extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { callbackRequests } = this.props;
    const reducer = (c, r) => !r.handled ? ++c : c;
    const unhandledRequests = callbackRequests.reduce(reducer, 0);

    if (!workerCanPerformCallback()) {
      return null;
    }

    if (unhandledRequests === 0) {
      return (
        <Badge>
          <CallbackIcon color="disabled"/>
        </Badge>
      );
    }

    return (
      <Badge badgeContent={unhandledRequests}>
        <CallbackIcon />
      </Badge>
    );
  }
};
