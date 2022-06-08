import { connect } from "react-redux";

import VoiceMailTaskCanvas from "./VoiceMailTaskCanvas";

const mapStateToProps = (state) => ({
  workerActivity: state['flex'].worker.activity,
});

export default connect(mapStateToProps)(VoiceMailTaskCanvas);
