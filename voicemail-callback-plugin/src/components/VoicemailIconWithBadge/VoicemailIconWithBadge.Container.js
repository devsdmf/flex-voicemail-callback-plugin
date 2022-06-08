import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import VoicemailIconWithBadge from "./VoicemailIconWithBadge";

import { namespace } from '../../states';
import { Actions } from "../../states/VoiceMailListState";

const mapStateToProps = (state) => ({
  voicemails: state[namespace].VoiceMailList.voicemails,
});

export default connect(mapStateToProps)(VoicemailIconWithBadge);
