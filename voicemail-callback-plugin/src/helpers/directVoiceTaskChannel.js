
function registerDirectCallChannel(flex){
const directVoiceTaskChannel = flex.DefaultTaskChannels.createCallTaskChannel(
    "directCall",
    (task) =>
      task.taskChannelUniqueName === "voice" &&
      task.attributes.workerExtension
  );
directVoiceTaskChannel.icons.list = "Twilio";
directVoiceTaskChannel.icons.main = "Twilio";
directVoiceTaskChannel.icons.active = "Twilio";
flex.TaskChannels.register(directVoiceTaskChannel);
}

export {registerDirectCallChannel}
