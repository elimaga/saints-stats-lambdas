const databaseServiceLayer = require('/opt/databaseServiceLayer/index');

function getStatsCategories() {
    const getStatsCategoriesQuery = 'SELECT * FROM StatsCategories ' +
                                    'ORDER BY Id ASC';
    const getStatsCategoriesArgs = [];

    return databaseServiceLayer.query(getStatsCategoriesQuery, getStatsCategoriesArgs);
}

module.exports = {
    getStatsCategories
};
