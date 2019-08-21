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

    dbConnection.connect((err) => {
        if (err) {
            console.log('There was an error connecting to the database', err);
        } else {
            console.log('Connected to the database');
        }

        callback(err);
    });
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
