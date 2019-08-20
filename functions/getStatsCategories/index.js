const async = require('async');
const dbServices = require('./dbServices');
const statsCategoriesDataService = require('./statsCategoriesDataService');

function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    async.waterfall([
        continuation => dbServices.connectToDatabase(continuation),
        continuation => statsCategoriesDataService.getStatsCategories(continuation),
    ], (err, statsCategories) => {
        dbServices.disconnectDb();
        doneCallback(err, statsCategories);
    })
}

module.exports = {
    handler
};
