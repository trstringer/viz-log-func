const DocumentClient = require('documentdb').DocumentClient;
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const trill = require('trill');

function sendSms(to, message, callback) {
  twilioClient.messages.create({
    body: message,
    to: to,
    from: process.env.TWILIO_NUMBER
  }, callback);
}

function sendTweet(tweetText, callback) {
  const twitterAuth = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  };

  const tweet = { text: tweetText };

  trill(twitterAuth, tweet, callback);
}

module.exports = function (context, myQueueItem) {
  var smsMessage;

  if (myQueueItem.Group) {
    switch (myQueueItem.Group.toLowerCase()) {
      case 'vip':
        smsMessage = `Heads up! A VIP (${myQueueItem.Name}) just entered the club!! Go greet him/her!`;
        sendTweet(`Whoa! A VIP is here! Welcome to SanDUBsky, ${myQueueItem.Name}!`, (err) => {
          if (err) {
            context.log(err.message);
          }
        });
        break;
      case 'criminal':
        smsMessage = `ALERT!!! A known criminal (${myQueueItem.Name}) has entered the club. Call the police IMMEDIATELY!`;
        break;
    }

    if (smsMessage) {
      process.env.TWILIO_RECIPIENTS.split(',').forEach((phoneNum) => {
        sendSms(phoneNum, smsMessage, (err) => {
          context.log(err.message);
        });
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
