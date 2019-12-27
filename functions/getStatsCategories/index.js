const databaseServiceLayer = require('/opt/databaseServiceLayer/index');
const statsCategoriesDataService = require('./statsCategoriesDataService');

function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    databaseServiceLayer.connectToDatabase();

    statsCategoriesDataService.getStatsCategories()
        .then(statsCategories => {
            databaseServiceLayer.disconnectDb();
            doneCallback(null, statsCategories);
        })
        .catch(err => {
            databaseServiceLayer.disconnectDb();
            doneCallback(err);
        });
}

module.exports = {
    handler
};
