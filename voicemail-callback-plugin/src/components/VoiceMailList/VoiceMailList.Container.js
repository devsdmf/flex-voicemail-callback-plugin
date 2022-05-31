import { connect } from "react-redux";
import VoicemailHelper from "../../helpers/voicemailHelper";
import VoiceMailList from "./VoiceMailList";

const mapStateToProps = (state) => ({
  extension: state["agent-voicemail"].VoiceMailList.extension,
  voicemails: state["agent-voicemail"].VoiceMailList.voicemails,
  allowCreateVoicemailTasks: VoicemailHelper.allowCreateNewVoicemailTask(
    state["flex"].worker.tasks,
    state["flex"].worker.activity.available
  ),
});

export default connect(mapStateToProps)(VoiceMailList);
