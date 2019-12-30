const databaseServiceLayer = require('/opt/databaseServiceLayer/index');
const statsCategoriesDataService = require('./statsCategoriesDataService');

async function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    databaseServiceLayer.connectToDatabase();

    let handlerErr, statsCategories;

    try {
        statsCategories = await statsCategoriesDataService.getStatsCategories()
    } catch (e) {
        handlerErr = e;
    }

    databaseServiceLayer.disconnectDb();
    doneCallback(handlerErr, statsCategories);
}

module.exports = {
    handler
};
