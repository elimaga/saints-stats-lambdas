const databaseServiceLayer = require('/opt/databaseServiceLayer/index');

function getStatsCategories(callback) {
    const getStatsCategoriesQuery = 'SELECT * FROM StatsCategories ' +
                                    'ORDER BY Id ASC';
    const getStatsCategoriesArgs = [];

    databaseServiceLayer.query(getStatsCategoriesQuery, getStatsCategoriesArgs)
        .then(data => {
            callback(null, data);
        })
        .catch(err => {
            callback(err);
        });
}

module.exports = {
    getStatsCategories
};
