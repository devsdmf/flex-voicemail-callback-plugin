import React, { Component, Fragment } from "react";

import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/IconButton";
import TableRow from "@material-ui/core/TableRow";
import { Table } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import TableHead from "@material-ui/core/TableHead";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { FlexBox } from "@twilio/flex-ui-core";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";

import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import VoicemailIcon from "@material-ui/icons/Voicemail";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";

import {
  StyledButtonContainer,
  useStyles,
  HtmlTooltip,
  StyledHeaderTableCell,
} from "./VoiceMailList.Styles";

function Header(props) {
  const {
    updateNewOnlyFilter,
    updateDateTimeSort,
    updateCallerFilter,
    newOnlyFilterValue,
    callerFilerValue,
    dateTimeSortValue,
  } = props;
  return (
    <TableHead>
      <TableRow>
        <StyledHeaderTableCell>
          <FlexBox>New only</FlexBox>
          <FlexBox>
            <Switch
              color="secondary"
              onChange={updateNewOnlyFilter}
              checked={newOnlyFilterValue}
            />
          </FlexBox>
        </StyledHeaderTableCell>
        <StyledHeaderTableCell width={300}>
          <TableSortLabel
            active
            direction={dateTimeSortValue}
            onClick={updateDateTimeSort}
          >
            Voicemail left
          </TableSortLabel>
        </StyledHeaderTableCell>
        <StyledHeaderTableCell>
          <FlexBox>Caller</FlexBox>
          <FlexBox>
            <TextField
              size="small"
              label="Search"
              value={callerFilerValue}
              onChange={updateCallerFilter}
            />
          </FlexBox>
        </StyledHeaderTableCell>
        <StyledHeaderTableCell>Open | Delete</StyledHeaderTableCell>
      </TableRow>
    </TableHead>
  );
}

function Body(props) {
  const {
    filteredAndSortedVoicemails,
    openAllowed,
    openHandler,
    deleteHandler,
  } = props;
  return (
    <TableBody>
      {filteredAndSortedVoicemails.map((voicemail) => (
        <TableRow key={voicemail.id}>
          <TableCell component="th" scope="row">
            <HtmlTooltip
              title={
                <Fragment>
                  <Typography color="inherit">Transcription</Typography>
                  <em>{voicemail.transcriptionSummary}</em>
                </Fragment>
              }
            >
              <VoicemailIcon
                color={voicemail.listenedToFlag ? "primary" : "secondary"}
              />
            </HtmlTooltip>
          </TableCell>
          <TableCell align="left">{voicemail.createdDateTime}</TableCell>
          <TableCell align="left">{voicemail.callerNumber}</TableCell>
          <TableCell align="left">
            <StyledButtonContainer>
              <Tooltip title="Open">
                <div>
                  <Button
                    color="primary"
                    disabled={!openAllowed}
                    onClick={() => {
                      openHandler(voicemail.id);
                    }}
                  >
                    <PlayCircleOutlineIcon />
                  </Button>
                </div>
              </Tooltip>

              <Tooltip title="Delete">
                <Button
                  color="primary"
                  onClick={() => {
                    deleteHandler(voicemail.id);
                  }}
                >
                  <HighlightOffIcon />
                </Button>
              </Tooltip>
            </StyledButtonContainer>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

class VoicemailList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: { caller: "", newOnly: false },
      sort: { dateTime: "asc" },
    };
  }

  updateCallerFilter = (e) => {
    const callerFilter = e.target.value.replace(/\D/g, "");
    this.setState({ filters: { ...this.state.filters, caller: callerFilter } });
  };

  updateNewOnlyFilter = (e) => {
    const checked = e.target.checked;
    this.setState({ filters: { ...this.state.filters, newOnly: checked } });
  };

  updateDateTimeSort = (e) => {
    const newSortOrder = this.state.sort.dateTime === "asc" ? "desc" : "asc";
    this.setState({
      sort: { ...this.state.sort, dateTime: newSortOrder },
    });
  };

  filterNewOnly = (voicemail) =>
    !this.state.filters.newOnly ||
    (this.state.filters.newOnly && !voicemail.listenedToFlag);

  filterCaller = (voicemail) =>
    !this.state.filters.caller ||
    voicemail.callerNumber.includes(this.state.filters.caller);

  sortDateTime = (v1, v2) => {
    const result =
      this.state.sort.dateTime === "asc"
        ? v1.dateCreated < v2.dateCreated
          ? 1
          : -1
        : v1.dateCreated > v2.dateCreated
        ? 1
        : -1;
    return result;
  };

  render() {
    const { classes, deleteHandler, openHandler, allowCreateVoicemailTasks } =
      this.props;

    const openAllowed = allowCreateVoicemailTasks;

    const callerFilerValue = this.state.filters.caller;
    const newOnlyFilterValue = this.state.filters.newOnly;
    const dateTimeSortValue = this.state.sort.dateTime;

    const filteredAndSortedVoicemails = this.props.voicemails
      .filter(this.filterNewOnly)
      .filter(this.filterCaller)
      .sort(this.sortDateTime);

    const headerProps = {
      updateDateTimeSort: this.updateDateTimeSort,
      updateNewOnlyFilter: this.updateNewOnlyFilter,
      updateCallerFilter: this.updateCallerFilter,

      callerFilerValue,
      newOnlyFilterValue,
      dateTimeSortValue,
    };

    const bodyProps = {
      deleteHandler,
      openHandler,
      filteredAndSortedVoicemails,
      openAllowed,
    };

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <Header {...headerProps} />
          <Body {...bodyProps} />
        </Table>
      </Paper>
    );
  }
}
export default withStyles(useStyles)(VoicemailList);
