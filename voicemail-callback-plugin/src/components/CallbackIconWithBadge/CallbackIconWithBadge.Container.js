import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import CallbackIconWithBadge from './CallbackIconWithBadge';

import { namespace } from '../../states';
import { Actions } from '../../states/CallbackListState';

const mapStateToProps = (state) => ({
  callbackRequests: state[namespace].CallbackList.callbackRequests
});

export default connect(mapStateToProps)(CallbackIconWithBadge);
