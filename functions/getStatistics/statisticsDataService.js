const dbServices = require('./dbServices');

function getStatistics(callback) {
    const getStatisticsQuery = 'SELECT P.Number, P.Name, SC.Abbreviation, SC.CategoryName, S.Value ' +
                               'FROM Statistics S ' +
                               'INNER JOIN Players P on S.PlayerId = P.Id ' +
                               'INNER JOIN StatsCategories SC on S.CategoryId = SC.Id ' +
                               'ORDER BY P.Number, SC.Id';
    const getStatisticsArgs = [];

    dbServices.query(getStatisticsQuery, getStatisticsArgs, callback);
}

module.exports = {
    getStatistics
};
