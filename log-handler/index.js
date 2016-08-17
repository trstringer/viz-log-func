const DocumentClient = require('documentdb').DocumentClient;
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

function sendSms(to, message, callback) {
  twilioClient.messages.create({
    body: message,
    to: to,
    from: process.env.TWILIO_NUMBER
  }, callback);
}

module.exports = function (context, myQueueItem) {
  // process.env.TWILIO_RECIPIENTS.split(',').forEach((phoneNum) => {
  //   console.log(`sending message to ${phoneNum}`);
  //   sendSms(phoneNum, 'yOu H@v3 b33n h@ck3dd!!!1!1!!one!!');
  // });
  // return;

  var smsMessage;

  if (myQueueItem.Group) {
    switch (myQueueItem.Group.toLowerCase()) {
      case 'vip':
        smsMessage = `Heads up! A VIP (${myQueueItem.Name}) just entered the club!! Go greet him/her!`;
        break;
      case 'criminal':
        smsMessage = `ALERT!!! A known criminal (${myQueueItem.Name}) has entered the club. Call the police IMMEDIATELY!`;
        break;
    }

    if (smsMessage) {
      process.env.TWILIO_RECIPIENTS.split(',').forEach((phoneNum) => {
        // console.log(`sending message to ${phoneNum}`);
        sendSms(phoneNum, smsMessage);
      });
    }
  }

  const client = new DocumentClient(process.env.DDB_HOST, { masterKey: process.env.DDB_KEY });

  const databaseUri = 'dbs/viz-access';
  const collectionUri = `${databaseUri}/colls/facial-recog`;

  client.createDocument(collectionUri, myQueueItem, (err, resource, response) => {
    if (err) {
      context.log(err.message);
    }
    else {
      context.log('successfully inserted document in ddb');
    }

    context.done();
  });
};
