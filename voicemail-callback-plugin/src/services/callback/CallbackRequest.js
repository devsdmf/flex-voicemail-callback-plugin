import parsePhoneNumber from "libphonenumber-js";
import moment from "moment";

class CallbackRequest {

  constructor(id, store, timestamp, phoneNumber, handled) {
    this.id = id;
    this.store = store;
    this.dateCreated = new Date(timestamp);
    this.phoneNumber = phoneNumber;
    this.handled = handled;
  }

  get createdDateTime() {
    return moment(this.dateCreated).format("LLLL");
  }

  get callbackPhoneNumber() {
    if (!this.phoneNumber || !(typeof this.phoneNumber === "string")) {
      return "unavailable";
    }

    const callbackPhoneNumber = parsePhoneNumber(this.phoneNumber);

    return callbackPhoneNumber ? callbackPhoneNumber.formatNational() : this.phoneNumber;
  }
}

export default CallbackRequest;
