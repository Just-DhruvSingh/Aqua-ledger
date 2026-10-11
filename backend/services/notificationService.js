// services/notificationService.js
const { PublishCommand } = require('@aws-sdk/client-sns');
const { snsClient }      = require('../config/aws');

/**
 * Sends a dispatch SMS via AWS SNS to the field crew.
 * Phone number resolution order:
 *   1. process.env.DISPATCH_PHONE_NUMBER (sandbox-verified number)
 *   2. phoneNumber argument (passed per-request from the controller)
 *   3. pipeline.crewPhone (stored on the document)
 * Must be E.164 format, e.g. +919876543210
 */
async function sendDispatchSms({ alert, pipeline, phoneNumber }) {
  if (!snsClient) {
    return { delivered: false, reason: 'AWS_REGION is not configured — SNS is disabled.' };
  }

  const recipient =
    process.env.DISPATCH_PHONE_NUMBER ||
    phoneNumber                       ||
    pipeline.crewPhone                ||
    null;

  if (!recipient) {
    return { delivered: false, reason: 'No E.164 crew phone number supplied.' };
  }

  const [lng, lat] = pipeline.location.coordinates[0];

  const message = [
    `[AquaLedger] CREW DISPATCHED`,
    `Alert ID  : ${alert._id}`,
    `Severity  : ${alert.severity}`,
    `Pipeline  : ${pipeline.name} (${pipeline._id})`,
    `Location  : ${lat}, ${lng}`,
    `Status    : Under Repair — proceed to site immediately.`,
  ].join('\n');

  const result = await snsClient.send(
    new PublishCommand({ PhoneNumber: recipient, Message: message })
  );

  return { delivered: true, messageId: result.MessageId };
}

module.exports = { sendDispatchSms };
