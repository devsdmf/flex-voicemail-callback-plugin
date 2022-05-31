import React from "react";
import { PLUGIN_NAME } from "../../PerAgentVoicemailPlugin";
import VoicemailHelper from "../../helpers/voicemailHelper";
import { Button } from "@twilio/flex-ui-core";
import {
  SectionHeader,
  SpacedBoldText,
  Container,
} from "./SupervisorExtensionConfig.Components";
import { CircularProgress } from "@material-ui/core";
import AddExtension from "./SupervisorExtensionConfig.AddExtension";

const NumberOfExtentionDigits = 4;

class SupervisorExtensionConfig extends React.Component {
  constructor(props) {
    super(props);
    console.log(
      PLUGIN_NAME,
      " SupervisorExtensionConfig constructor ",
      props.worker.sid
    );
    this.state = {
      showSpinner: true,
      workerSid: null,
      extension: null,
      errorText: null,
      addingExtension: false,
    };
  }

  componentDidUpdate() {
    // if we aren't arlready in the process of fetching an extension and the current worker sid doesn't match the states worker sid lets fetch it
    if (
      this.state.showSpinner === false &&
      this.props.worker.sid !== this.state.workerSid
    ) {
      console.log(
        PLUGIN_NAME,
        " SupervisorExtensionConfig update state needed"
      );
      this.updateState();
    }
  }

  componentDidMount() {
    this.updateState();
  }

  // fetch extension for agent and update state
  async updateState() {
    console.log(
      PLUGIN_NAME,
      " SupervisorExtensionConfig update state in progress for ",
      this.props.worker.sid
    );

    this.setState({ showSpinner: true });

    const { worker } = this.props;
    var extension = null;

    if (worker && worker.attributes && worker.attributes.workerExtension) {
      extension = worker.attributes.workerExtension;
    }

    if (extension) {
      // agent attributes has an extension. Check if there is a voicemail box in Sync List and if not create one
      const extensionExists = await VoicemailHelper.extensionExists(extension);
      if (!extensionExists) {
        await VoicemailHelper.addExtension(worker, extension);

        this.setState({
          workerSid: worker.sid,
          extension,
          errorText: null,
          showSpinner: false,
        });
      } else {
        this.setState({
          workerSid: worker.sid,
          extension,
          errorText: null,
          showSpinner: false,
        });
      }
    } else {
      // agent doesn't have extension in attributes
      this.setState({
        workerSid: worker.sid,
        extension: null,
        showSpinner: false,
        errorText:null,
      });
    }
  }

  handleAddExtensionClicked() {
    this.setState({ addExtensionClicked: true });
  }

  handleDeleteExtensionClicked = async () => {
    const extsionToDelete = this.state.extension;
    this.setState({
      addExtensionClicked: false,
      showSpinner: true,
      extension: null,
      errorText: null,
    });

    await VoicemailHelper.deleteExtension(this.props.worker, extsionToDelete);
    this.setState({ showSpinner: false });
  };

  handleSaveAddClicked = async (extensionToAdd) => {
    const workerName = await VoicemailHelper.workerNameFromExtenstion(
      extensionToAdd
    );
    console.log("Test:",workerName);
    if(workerName)
    {
      this.setState({
        showSpinner: false,
        errorText: `Failed to add extension ${extensionToAdd} - already assigned to ${workerName}`,
        extension: null,
      })
    }
    else {
      this.setState({
        addExtensionClicked: false,
        errorText: null,
        showSpinner: true,
        extension: extensionToAdd,
      });
      await VoicemailHelper.addExtension(this.props.worker, extensionToAdd);
    this.setState({ showSpinner: false });
    }
    
  };

  handleCancelAddClicked = () => {
    this.setState({ addExtensionClicked: false, errorText: null });
  };

  render() {
    console.log(
      PLUGIN_NAME,
      " SupervisorExtensionConfig render for ",
      this.state.workerSid
    );

    const { theme } = this.props;
    const { extension, addExtensionClicked } = this.state;
    const { errorText } = this.state;

    // Either show
    // Loading - fetching or updating state
    // No extension and Add button
    // Extenstion and delete option
    // Add form to add extension

    const header = <SectionHeader>Voicemail Extension</SectionHeader>;
    const loadingIcon = this.state.showSpinner ? (
      <Container>
        <CircularProgress />
      </Container>
    ) : null;

    const mainView = loadingIcon ? null : this.state.extension ? (
      <Container>
        <SpacedBoldText>Voicemail Extension: {extension}</SpacedBoldText>
        <Button
          onClick={() => {
            this.handleDeleteExtensionClicked();
          }}
          themeOverride={theme.WorkerSkills.SaveButton}
          roundCorners={false}
        >
          Delete Extension
        </Button>       
      </Container>
    ) : (
      <Container>
        <SpacedBoldText>No Voicemail Extension Configured</SpacedBoldText>
        <Button
          onClick={() => {
            this.handleAddExtensionClicked();
          }}
          themeOverride={theme.WorkerSkills.SaveButton}
          disabled={addExtensionClicked}
          roundCorners={false}
        >
          Add Extension
        </Button>
        <SpacedBoldText>{errorText}</SpacedBoldText>
      </Container>
    );

    const addExtensionComponent = addExtensionClicked ? (
      <AddExtension
        numberOfExtensionDigits={NumberOfExtentionDigits}
        handleCancelClicked={this.handleCancelAddClicked}
        handleSaveClicked={this.handleSaveAddClicked}
        theme={theme}
      />
    ) : null;

    return (
      <div>
        {header}
        {loadingIcon}
        {mainView}
        {addExtensionComponent}
      </div>
    );
  }
}

export default SupervisorExtensionConfig;
