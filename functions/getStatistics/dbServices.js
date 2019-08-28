const mysql = require('mysql');
const saintsStatsDbConfig = require('./saintsStatsDbConfig.json');

let dbConnection;

function connectToDatabase(callback) {
    dbConnection = mysql.createConnection({
        host: saintsStatsDbConfig.endpoints.angularSaintsStatsDb,
        user: saintsStatsDbConfig.credentials.rdsSaintsStatsData.username,
        password: saintsStatsDbConfig.credentials.rdsSaintsStatsData.password,
        database: saintsStatsDbConfig.credentials.rdsSaintsStatsData.database
    });

    callback();
}

function query(queryString, args, callback) {
    dbConnection.query(queryString, args, callback);
}

function disconnectDb() {
    if (dbConnection) {
        dbConnection.end();
    }
}

module.exports = {
    connectToDatabase,
    query,
    disconnectDb
};
