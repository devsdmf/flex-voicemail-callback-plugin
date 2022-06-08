
export const VOICE_TASK_CHANNEL_NAME = 'voice';
export const VOICEMAIL_TASK_CHANNEL_NAME = 'voicemail';
export const CALLBACK_TASK_CHANNEL_NAME = 'callback';

const TASK_CHANNELS_BLOCKING_NEW_TASKS = [
  VOICE_TASK_CHANNEL_NAME,
  VOICEMAIL_TASK_CHANNEL_NAME,
  CALLBACK_TASK_CHANNEL_NAME
];

export const allowCreateNewVoiceTasks = (tasks, available) => {
  if (!available) return false;

  for (const [reservationSid, task] of tasks) {
    if (TASK_CHANNELS_BLOCKING_NEW_TASKS.includes(
      task.channelType.toLowerCase()
    )) {
      return false;
    }
  }

  return true;
};
