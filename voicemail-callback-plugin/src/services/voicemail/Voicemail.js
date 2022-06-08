import parsePhoneNumber from "libphonenumber-js";
import moment from "moment";

function truncate(str, n, useWordBoundary) {
  if (str.length <= n) {
    return str;
  }
  const subString = str.substr(0, n - 1); // the original check
  return (
    (useWordBoundary
      ? subString.substr(0, subString.lastIndexOf(" "))
      : subString) + "..."
  );
}

class Voicemail {
  constructor(id, timestamp, listenedTo, callerId, transcription, url, archived, handled) {
    this.id = id;
    this.dateCreated = new Date(timestamp);
    this.listenedToFlag = listenedTo;
    this.callerId = callerId;
    this.transcription = transcription;
    this.url = url;
    this.archived = archived;
    this.handled = handled;
  }

  get createdDateTime() {
    return moment(this.dateCreated).format("LLLL");
  }

  get callerNumber() {
    if (!this.callerId || !(typeof this.callerId === "string"))
      return "unavailable";

    const callerNumber = parsePhoneNumber(this.callerId);

    return callerNumber ? callerNumber.formatNational() : this.callerId;
  }

  get transcriptionSummary() {
    if (!this.transcription || !(typeof this.transcription === "string"))
      return "Unavailable";
    else return truncate(this.transcription, 200, true);
  }
}

export default Voicemail;
