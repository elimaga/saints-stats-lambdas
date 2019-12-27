const databaseServiceLayer = require('/opt/databaseServiceLayer/index');
const statisticsDataService = require('./statisticsDataService');
const statisticsFormatter = require('./statisticsFormatter');

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
            doneCallback(null, statisticsFormatter.formatStatisticsForUi(statistics));
        })
        .catch(err => {
            databaseServiceLayer.disconnectDb();
            doneCallback(err);
        });
}

module.exports = {
    handler
};
