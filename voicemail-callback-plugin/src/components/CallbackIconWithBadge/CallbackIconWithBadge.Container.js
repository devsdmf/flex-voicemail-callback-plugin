import { connect } from "react-redux";
import { Actions } from "../../states/CallbackListState";
import { bindActionCreators } from "redux";
import CallbackIconWithBadge from "./CallbackIconWithBadge";

const mapStateToProps = (state) => ({
  callbackRequests: state["agent-voicemail"].CallbackList.callbackRequests
});

export default connect(mapStateToProps)(CallbackIconWithBadge);
