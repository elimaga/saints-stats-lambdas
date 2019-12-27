const databaseServiceLayer = require('/opt/databaseServiceLayer/index');

function getStatistics() {
    const getStatisticsQuery = 'SELECT P.Number, P.Name, SC.Abbreviation, S.Value ' +
        'FROM Statistics S ' +
        'INNER JOIN Players P on S.PlayerId = P.Id ' +
        'INNER JOIN StatsCategories SC on S.CategoryId = SC.Id ' +
        'ORDER BY P.Number, SC.Id';
    const getStatisticsArgs = [];

    return databaseServiceLayer.query(getStatisticsQuery, getStatisticsArgs);
}

module.exports = {
    getStatistics
};
