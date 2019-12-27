const async = require('async');
const databaseServiceLayer = require('/opt/databaseServiceLayer/index');
const statsCategoriesDataService = require('./statsCategoriesDataService');

function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    databaseServiceLayer.connectToDatabase();
    
    async.waterfall([
        continuation => statsCategoriesDataService.getStatsCategories(continuation),
    ], (err, statsCategories) => {
        databaseServiceLayer.disconnectDb();
        doneCallback(err, statsCategories);
    })
}

module.exports = {
    handler
};
