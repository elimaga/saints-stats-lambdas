const databaseServiceLayer = require('/opt/databaseServiceLayer/index');

function getStatistics(callback) {
    const getStatisticsQuery = 'SELECT P.Number, P.Name, SC.Abbreviation, S.Value ' +
                               'FROM Statistics S ' +
                               'INNER JOIN Players P on S.PlayerId = P.Id ' +
                               'INNER JOIN StatsCategories SC on S.CategoryId = SC.Id ' +
                               'ORDER BY P.Number, SC.Id';
    const getStatisticsArgs = [];

    databaseServiceLayer.query(getStatisticsQuery, getStatisticsArgs, function (err, statistics) {
        if (err) {
            callback(err);
            return;
        }

        let statsForEachPlayer = [];

        let playerStats = {};
        statistics.forEach(statistic => {
            if (statistic.Number === playerStats.Number) {
                playerStats[statistic.Abbreviation] = statistic.Value;
            } else {
                playerStats = {};
                statsForEachPlayer.push(playerStats);
                playerStats.Number = statistic.Number;
                playerStats.Name = statistic.Name;
                playerStats[statistic.Abbreviation] = statistic.Value;
            }
        });

        callback(null, statsForEachPlayer);
    });
}

module.exports = {
    getStatistics
};
