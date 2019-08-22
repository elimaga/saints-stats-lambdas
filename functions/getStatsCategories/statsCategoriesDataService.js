const dbServices = require('./dbServices');

function getStatsCategories(callback) {
    const getStatsCategoriesQuery = 'SELECT * FROM StatsCategories ' +
                                    'ORDER BY Id ASC';
    const getStatsCategoriesArgs = [];

    dbServices.query(getStatsCategoriesQuery,getStatsCategoriesArgs, callback);
}

module.exports = {
    getStatsCategories
};
