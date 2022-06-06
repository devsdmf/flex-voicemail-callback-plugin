// Helper functions

const getDomain = (context) => context.DOMAIN_NAME.includes('localhost') ?
  `https://${context.NGROK_DOMAIN}` : `https://${context.DOMAIN_NAME}`;

const getTask = (context, sid) => {
  const client = context.getTwilioClient();
  let fetchTask;

  if (sid.startsWith('CA')) {
    fetchTask = client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks.list({
      evaluateTaskAttributes: `call_sid= '${sid}'`,
      limit: 20,
    });
  } else {
    fetchTask = client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks(sid).fetch();
  }

  return fetchTask
    .then((result) => {
      const task = Array.isArray(result) ? result[0] : result;
      return {
        status: 'success',
        topic: 'getTask',
        action: 'getTask',
        taskSid: task.sid,
        taskQueueSid: task.taskQueueSid,
        taskQueueName: task.taskQueueFriendlyName,
        workflowSid: task.workflowSid,
        workspaceSid: task.workspaceSid,
        data: task,
      };
    })
    .catch((error) => {
      return {
        status: 'error',
        topic: 'getTask',
        action: 'getTask',
        data: error,
      };
    });
};

const requestCallback = async(context, taskSid, callSid, callbackStore) => {
  const client = context.getTwilioClient();
  const domain = getDomain(context);

  await cancelTask(client, context.TWILIO_WORKSPACE_SID, taskSid);

  const method = 'POST';
  const url = `${domain}/callback` +
    `?mode=requestConfirmation` + 
    `&taskSid=${taskSid}` + 
    `&callbackStore=${encodeURIComponent(callbackStore)}`;

  try {
    await client.calls(callSid).update({ method, url });
  } catch (err) {
    console.error('requestCallback error', err);
    return false;
  }

  return true;
};

const sendCallToVoicemail = async (context, taskSid, callSid, voicemailBox, unavailable) => {
  const client = context.getTwilioClient();
  const domain = getDomain(context);

  await cancelTask(client, context.TWILIO_WORKSPACE_SID, taskSid);

  const method = 'POST';
  const url = `${domain}/voicemail` +
    `?taskSid=${taskSid}` + 
    `&voicemailBox=${encodeURIComponent(voicemailBox)}` + 
    `${unavailable === true ? '&unavailable=1' : ''}`;

  try {
    await client.calls(callSid).update({ method, url });
  } catch (err) {
    console.error('updateCall error', err);
    return false;
  }


  return true;
};

const cancelTask = async (client, workspaceSid, taskSid, reason) => {
  try {
    await client.taskrouter.workspaces(workspaceSid).tasks(taskSid).update({
      assignmentStatus: 'canceled',
      reason: 'Voicemail Request',
    });
  } catch (err) {
    console.error('cancelTask Error', err);
    return false;
  }
};


module.exports = {
  getDomain,
  getTask,
  requestCallback,
  sendCallToVoicemail,
  cancelTask
};
