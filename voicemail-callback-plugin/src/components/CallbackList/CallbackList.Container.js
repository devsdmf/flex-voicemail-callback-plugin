import { connect } from "react-redux";

import CallbackList from './CallbackList';

import { allowCreateNewVoiceTasks } from '../../helpers/TaskChannelHelper';
import { namespace } from '../../states';

const mapStateToProps = (state) => ({
  callbackRequests: state[namespace].CallbackList.callbackRequests,
  callAllowed: allowCreateNewVoiceTasks(
    state['flex'].worker.tasks,
    state['flex'].worker.activity.available
  )
});

export default connect(mapStateToProps)(CallbackList);
