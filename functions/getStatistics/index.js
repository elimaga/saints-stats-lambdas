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

    statisticsDataService.getStatistics()
        .then(statistics => {
            databaseServiceLayer.disconnectDb();
            doneCallback(null, statistics);
        })
        .catch(err => {
            databaseServiceLayer.disconnectDb();
            doneCallback(err);
        });
}

module.exports = {
    handler
};
