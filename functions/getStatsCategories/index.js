const async = require('async');
const dbServices = require('./dbServices');
const statsCategoriesDataService = require('./statsCategoriesDataService');

function handle(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    async.waterfall([
        continuation => dbServices.getCredentials(continuation),
        (saintsStatsDbConfig, continuation) => dbServices.connectToDatabase(saintsStatsDbConfig, continuation),
        continuation => statsCategoriesDataService.getStatsCategories(continuation),
    ], (err, statsCategories) => {
        dbServices.disconnectDb();
        doneCallback(err, statsCategories);
    })
}

module.exports = {
    handle
};
