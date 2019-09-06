const databaseServiceLayer = require('/opt/databaseServiceLayer/index');

function getStatsCategories(callback) {
    const getStatsCategoriesQuery = 'SELECT * FROM StatsCategories ' +
                                    'ORDER BY Id ASC';
    const getStatsCategoriesArgs = [];

    databaseServiceLayer.query(getStatsCategoriesQuery, getStatsCategoriesArgs, callback);
}

module.exports = {
    getStatsCategories
};
