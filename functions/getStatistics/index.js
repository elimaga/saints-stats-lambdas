const async = require('async');
const dbServices = require('./dbServices');
const statisticsDataService = require('./statisticsDataService');

function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    async.waterfall([
        continuation => dbServices.connectToDatabase(continuation),
        continuation => statisticsDataService.getStatistics(continuation)
    ], (err, statistics) => {
        dbServices.disconnectDb();
        doneCallback(err, statistics);
    })
}

module.exports = {
    handler
};
