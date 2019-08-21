const dbServices = require('./dbServices');

function getStatsCategories(callback) {
    const getStatsCategoriesQuery = 'SELECT * FROM StatsCategories ' +
                                    'ORDER BY Id ASC';
    const getStatsCategoriesArgs = [];

    dbServices.query(getStatsCategoriesQuery,getStatsCategoriesArgs, function (err, data) {
        if (err) {
            console.log('There was an error querying the database', err);
        }

        callback(err, data);
    });
}

module.exports = {
    getStatsCategories
};
