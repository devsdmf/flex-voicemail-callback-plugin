import { connect } from "react-redux";

import VoiceMailList from "./VoiceMailList";

import { allowCreateNewVoiceTasks } from '../../helpers/TaskChannelHelper';
import { namespace } from '../../states';

const mapStateToProps = (state) => ({
  voicemails: state[namespace].VoiceMailList.voicemails,
  allowCreateVoicemailTasks: allowCreateNewVoiceTasks(
    state['flex'].worker.tasks,
    state['flex'].worker.activity.available
  ),
});

export default connect(mapStateToProps)(VoiceMailList);
