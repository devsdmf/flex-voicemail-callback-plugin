import { connect } from "react-redux";
import CallbackHelper from "../../helpers/callbackHelper";
import CallbackList from "./CallbackList";

const mapStateToProps = (state) => ({
  callbackRequests: state["agent-voicemail"].CallbackList.callbackRequests,
  callAllowed: true
});

export default connect(mapStateToProps)(CallbackList);
