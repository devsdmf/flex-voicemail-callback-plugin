import { connect } from "react-redux";
import { Actions } from "../../states/VoiceMailListState";
import { bindActionCreators } from "redux";
import VoicemailIconWithBadge from "./VoicemailIconWithBadge";

const mapStateToProps = (state) => ({
  voicemails: state["agent-voicemail"].VoiceMailList.voicemails,
});

export default connect(mapStateToProps)(VoicemailIconWithBadge);
