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

    let handlerErr, formattedStats;

    try {
        const statistics = await statisticsDataService.getStatistics();
        formattedStats = statisticsFormatter.formatStatisticsForUi(statistics);
    } catch (e) {
        handlerErr = e;
    }

    databaseServiceLayer.disconnectDb();
    doneCallback(handlerErr, formattedStats);
}

module.exports = {
    handler
};
