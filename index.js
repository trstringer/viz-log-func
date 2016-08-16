module.exports = function (context, myQueueItem) {
    context.log('Deployment1 Node.js queue trigger function processed work item', myQueueItem);
    context.done();
};
