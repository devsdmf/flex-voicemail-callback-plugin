import React from "react";
import { PLUGIN_NAME } from "../../PerAgentVoicemailPlugin";
import { Button } from "@twilio/flex-ui-core";
import {
  SpacedBoldText,
  Container,
  ButtonsContainer,
  ExtensionInput,
} from "./SupervisorExtensionConfig.Components";
import FormHelperText from "@material-ui/core/FormHelperText";

class AddExtension extends React.Component {
  constructor(props) {
    super(props);
    this.state = { extension: "", errorText: "" };
  }

  handleExtensionChange = (e) => {
    const extension = e.target.value.replace(/\D/g, "");
    var errorText = "";

    if (extension.length !== this.props.numberOfExtensionDigits) {
      errorText = "Extensions are 4 digits";
    } else {
      errorText = "";
    }
    this.setState({
      extension,
      errorText,
    });
  };

  render() {
    const {
      handleSaveClicked,
      handleCancelClicked,
      theme,
      numberOfExtensionDigits,
    } = this.props;

    const { extension, errorText } = this.state;

    return (
      <Container>
        <SpacedBoldText>
          Add {numberOfExtensionDigits} Digit Extension
        </SpacedBoldText>
        <ExtensionInput
          value={extension}
          onChange={this.handleExtensionChange}
          error={errorText !== ""}
        />
        {errorText && <FormHelperText>{errorText}</FormHelperText>}

        <ButtonsContainer>
          <Button
            onClick={() => {
              handleSaveClicked(this.state.extension);
            }}
            themeOverride={theme.WorkerSkills.SaveButton}
            roundCorners={false}
            disabled={errorText !== "" || !extension}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              handleCancelClicked();
            }}
            themeOverride={theme.WorkerSkills.CancelButton}
            roundCorners={false}
          >
            Cancel
          </Button>
        </ButtonsContainer>
      </Container>
    );
  }
}

export default AddExtension;
