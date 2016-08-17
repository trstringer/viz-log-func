const DocumentClient = require('documentdb').DocumentClient;
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const trill = require('trill');

function generateRandomVipMessage(vipName) {
  const randomVipMessages = [
    `Nooooooo wayyyyyy!! Our fav VIP, ${vipName} is here! #XboxOneS`,
    `Oh...my....gosh... ${vipName} just arrived! Party starts...NOW! #XboxOneS`,
    `I dunno where you are at, but ${vipName} is here and it's going DOWN! #XboxOneS`,
    `Check it out!!! <3 <3 <3 ${vipName} <3 <3 <3 is here now! #XboxOneS`,
    `Whaaaa!!! ${vipName} just showed up!!!11!1!one!1! #XboxOneS`,
    `Yeah yeah yeah! ${vipName} is in the HIZZZOUSSSEEEEE!! #XboxOneS`,
    `Partayyyyyyyyyy tyme!!! ${vipName} just arrrrrriiivvvveed! #XboxOneS`,
    `O_O o_O ${vipName} is here and we can't believe our eyes O_O #XboxOneS`,
    `Czech yo'self b4 u reck yo'self.... ${vipName} is heeeeere!! #XboxOneS`,
    `${vipName} is hear in the phlesh........ and phlexin!! #XboxOneS`,
    `Next round is on us! ${vipName} just came in!! #XboxOneS`,
    `Wowzas wowzas WOWZAS!!! ${vipName} showed up and it's happenin NOW!! #XboxOneS`
  ];

  return randomVipMessages[Math.floor(Math.random() * randomVipMessages.length)];
}

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
        sendTweet(generateRandomVipMessage(myQueueItem.Name), (err) => {
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
          if (err) {
            context.log(err.message);
          }
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
