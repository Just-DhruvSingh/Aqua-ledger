const { SNSClient } = require('@aws-sdk/client-sns');

// Explicit credentials ensure the client works in AWS SNS Sandbox
// without relying on implicit credential chain (EC2 role / shared config).
const snsClient = process.env.AWS_REGION
  ? new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

module.exports = { snsClient };
