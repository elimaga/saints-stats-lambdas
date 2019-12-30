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

    let formattedStats;
    let error;

    try {
        const statistics = await statisticsDataService.getStatistics();
        formattedStats = statisticsFormatter.formatStatisticsForUi(statistics);
    } catch (e) {
        error = e;
    }

    databaseServiceLayer.disconnectDb();
    doneCallback(error, formattedStats);
}

module.exports = {
    handler
};
