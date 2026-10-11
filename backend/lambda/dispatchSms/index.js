/**
 * AquaLedger — Lambda Dispatch Handler
 * 
 * Deploy this file as a standalone AWS Lambda function named:
 *   "aqualedger-dispatch-sms"
 * Runtime: Node.js 18.x
 *
 * Required Lambda Environment Variables:
 *   TWILIO_ACCOUNT_SID   — from console.twilio.com
 *   TWILIO_AUTH_TOKEN    — from console.twilio.com
 *   TWILIO_PHONE_NUMBER  — your Twilio sender number (E.164, e.g. +14155552671)
 *   DISPATCH_PHONE_NUMBER — verified recipient number (E.164, e.g. +919876543210)
 *
 * Expected event payload (sent from Express via InvokeCommand):
 * {
 *   "alert_id":   "64abc...",
 *   "severity":   "CRITICAL",
 *   "pipeline_id": "64def...",
 *   "pipeline_name": "Sector 4 Loop",
 *   "coordinates": [lng, lat]
 * }
 */

const twilio = require('twilio');

exports.handler = async (event) => {
  const {
    alert_id,
    severity     = 'CRITICAL',
    pipeline_id,
    pipeline_name = 'Unknown Pipeline',
    coordinates   = [],
  } = event;

  // ── Validate required fields ────────────────────────────────────────────────
  if (!alert_id || !pipeline_id) {
    const msg = 'Missing required fields: alert_id and pipeline_id.';
    console.error('[Lambda][dispatch-sms]', msg, { event });
    return { statusCode: 400, body: JSON.stringify({ success: false, message: msg }) };
  }

  // ── Validate environment ─────────────────────────────────────────────────────
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, DISPATCH_PHONE_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER || !DISPATCH_PHONE_NUMBER) {
    const msg = 'Twilio environment variables are not fully configured.';
    console.error('[Lambda][dispatch-sms]', msg);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: msg }) };
  }

  // ── Format SMS body ──────────────────────────────────────────────────────────
  const [lng, lat] = coordinates.length === 2 ? coordinates : ['N/A', 'N/A'];

  const body = [
    `🚨 AQUALEDGER CREW DISPATCH`,
    `Severity  : ${severity}`,
    `Alert ID  : ${alert_id}`,
    `Pipeline  : ${pipeline_name} (${pipeline_id})`,
    `GPS       : ${lat}, ${lng}`,
    `Action    : Proceed to site immediately for repair.`,
  ].join('\n');

  // ── Send SMS via Twilio ──────────────────────────────────────────────────────
  try {
    const client  = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to:   DISPATCH_PHONE_NUMBER,
    });

    console.log(`[Lambda][dispatch-sms] SMS sent. SID: ${message.sid}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success:    true,
        messageSid: message.sid,
        to:         DISPATCH_PHONE_NUMBER,
      }),
    };
  } catch (err) {
    console.error('[Lambda][dispatch-sms] Twilio error:', err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};
