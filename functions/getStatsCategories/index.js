const async = require('async');
const dbServices = require('./dbServices');

function handle(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    async.waterfall([
        continuation => dbServices.getCredentials(continuation),
        (saintsStatsDbConfig, continuation) => dbServices.connectToDatabase(saintsStatsDbConfig, continuation)
    ], doneCallback)
}

module.exports = {
    handle
}