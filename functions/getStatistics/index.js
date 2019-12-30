const databaseServiceLayer = require('/opt/databaseServiceLayer/index');
const statisticsDataService = require('./statisticsDataService');
const statisticsFormatter = require('./statisticsFormatter');

async function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    databaseServiceLayer.connectToDatabase();

    try {
        const statistics = await statisticsDataService.getStatistics();
        const formattedStats = statisticsFormatter.formatStatisticsForUi(statistics);
        databaseServiceLayer.disconnectDb();
        doneCallback(null, formattedStats);
    } catch (e) {
        databaseServiceLayer.disconnectDb();
        doneCallback(e);
    }
}

module.exports = {
    handler
};
