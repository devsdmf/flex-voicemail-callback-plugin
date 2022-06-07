import React from "react";

import {
  Button,
  Switch,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import {
  Call as CallIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";

import { Actions } from "@twilio/flex-ui";

import {
  FlexBox
} from "@twilio/flex-ui-core";

import {
  HtmlTooltip,
  StyledButtonContainer,
  StyledHeaderTableCell,
  useStyles,
} from "./CallbackList.Styles";

const Header = (props) => {

  const {
    phoneNumberFilterValue,
    updatePhoneNumberFilter,

    unhandledOnlyFilterValue,
    updateUnhandledOnlyFilter,

    dateTimeSortValue,
    updateDateTimeSort,
  } = props;
  
  return (
    <TableHead>
      <TableRow>
        <StyledHeaderTableCell>
          ID
        </StyledHeaderTableCell>
        <StyledHeaderTableCell>
          <FlexBox>Phone Number</FlexBox>
          <FlexBox>
            <TextField 
              size="small"
              label="Search"
              value={phoneNumberFilterValue}
              onChange={updatePhoneNumberFilter}
            />
          </FlexBox>
        </StyledHeaderTableCell>
        <StyledHeaderTableCell width={300}>
          <TableSortLabel
            active
            direction={dateTimeSortValue}
            onClick={updateDateTimeSort}
          >
            Date
          </TableSortLabel>
        </StyledHeaderTableCell>
        <StyledHeaderTableCell>
          <FlexBox>Unhandled Only</FlexBox>
          <FlexBox>
            <Switch
              color="secondary"
              onChange={updateUnhandledOnlyFilter}
              checked={unhandledOnlyFilterValue}
            />
          </FlexBox>
        </StyledHeaderTableCell>
        <StyledHeaderTableCell>
          Call | Mark as Handled | Remove
        </StyledHeaderTableCell>
      </TableRow>
    </TableHead>
  );
}

const Body = (props) => {
  
  const {
    callbackRequests,
    callAllowed,
    deleteCallbackRequest,
    handleCallbackRequest,
    startCall
  } = props;

  return (
    <TableBody>
      {callbackRequests.map((callbackRequest) => (
        <TableRow>
          <TableCell component="th" scope="row">
            {callbackRequest.id}
          </TableCell>
          <TableCell align="left">{callbackRequest.callbackPhoneNumber}</TableCell>
          <TableCell align="left">{callbackRequest.createdDateTime}</TableCell>
          <TableCell align="left">{callbackRequest.handled ? 'Yes' : 'No'}</TableCell>
          <TableCell>
            <StyledButtonContainer>
              <Tooltip title="Call">
                <div>
                  <Button
                    color="primary"
                    disabled={!callAllowed}
                    onClick={() => startCall(callbackRequest.callbackPhoneNumber)}
                  >
                    <CallIcon />
                  </Button>
                </div>
              </Tooltip>

              <Tooltip title="Mark as Handled">
                <div>
                  <Button
                    color="primary"
                    disabled={callbackRequest.handled}
                    onClick={() => handleCallbackRequest(
                      callbackRequest.id,
                      callbackRequest.store
                    )}
                  >
                    <CheckIcon />
                  </Button>
                </div>
              </Tooltip>

              <Tooltip title="Delete">
                <div>
                  <Button
                    color="primary"
                    onClick={() => deleteCallbackRequest(
                      callbackRequest.id,
                      callbackRequest.store
                    )}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              </Tooltip>
            </StyledButtonContainer>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

class CallbackList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filters: {
        phoneNumber: "",
        unhandledOnly: false
      },
      sort: { dateTime: "asc" },
    };
  }

  startCall = (destination) => {
    Actions.invokeAction("StartOutboundCall", {
      destination,
      taskAttributes: { VoicemailCall: true },
    });
  };

  updatePhoneNumberFilter = (e) => {
    const phoneNumberFilter = e.target.value.replace(/\D/g, "");
    this.setState({
      filters: {
        ...this.state.filters,
        phoneNumber: phoneNumberFilter
      }
    });
  };

  updateUnhandledOnlyFilter = (e) => {
    const checked = e.target.checked;
    this.setState({
      filters: {
        ...this.state.filters,
        unhandledOnly: checked
      }
    });
  };

  updateDateTimeSort = (e) => {
    const newSortOrder = this.state.sort.dateTime === "asc" ? "desc" : "asc";

    this.setState({
      sort: {
        ...this.state.sort,
        dateTime: newSortOrder
      }
    });
  };

  filterUnhandledOnly = (r) => 
    !this.state.filters.unhandledOnly ||
    (this.state.filters.unhandledOnly && !r.handled);

  filterPhoneNumber = (r) => 
    !this.state.filters.phoneNumber ||
    r.phoneNumber.includes(this.state.filters.phoneNumber);

  sortDateTime = (v1, v2) => {
    if (this.state.sort.dateTime === "asc") {
      return v1.dateCreated < v2.dateCreated ? 1 : -1;
    }

    return v1.dateCreated > v2.dateCreated ? 1 : -1;
  }

  render() {
    const {
      classes,
      callAllowed,
      handleCallbackRequest,
      deleteCallbackRequest,
    } = this.props;

    const headerProps = {
      phoneNumberFilterValue: this.state.filters.phoneNumber,
      updatePhoneNumberFilter: this.updatePhoneNumberFilter,
      unhandledOnlyFilterValue: this.state.filters.unhandledOnly,
      updateUnhandledOnlyFilter: this.updateUnhandledOnlyFilter,
      dateTimeSortValue: this.state.sort.dateTime,
      updateDateTimeSort: this.updateDateTimeSort,
    };

    const callbackRequests = this.props.callbackRequests
      .filter(this.filterUnhandledOnly)
      .filter(this.filterPhoneNumber)
      .sort(this.sortDateTime);

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <Header {...headerProps} />
          <Body 
            callbackRequests={callbackRequests} 
            callAllowed={callAllowed}
            startCall={this.startCall}
            handleCallbackRequest={handleCallbackRequest}
            deleteCallbackRequest={deleteCallbackRequest}
          />
        </Table>
      </Paper>
    )
  }
}

export default withStyles(useStyles)(CallbackList);
