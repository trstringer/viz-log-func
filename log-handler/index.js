const DocumentClient = require('documentdb').DocumentClient;

module.exports = function (context, myQueueItem) {
    // context.log('Deployment1 Node.js queue trigger function processed work item', myQueueItem);

    const client = new DocumentClient(process.env.DDB_HOST, {masterKey: process.env.DDB_KEY});

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
