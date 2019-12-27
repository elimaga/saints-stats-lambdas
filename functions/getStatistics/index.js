const async = require('async');
const databaseServiceLayer = require('/opt/databaseServiceLayer/index');
const statisticsDataService = require('./statisticsDataService');

function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    databaseServiceLayer.connectToDatabase();

    async.waterfall([
        continuation => statisticsDataService.getStatistics(continuation)
    ], (err, statistics) => {
        databaseServiceLayer.disconnectDb();
        doneCallback(err, statistics);
    })
}

module.exports = {
    handler
};
