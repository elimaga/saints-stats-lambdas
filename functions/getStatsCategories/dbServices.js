const awsSdk = require('aws-sdk');
const mysql = require('mysql');

function getCredentials(callback) {
    awsSdk.config.update({ region: 'us-west-1' });

    const ssm = new awsSdk.SSM();

    const params = {
        Name: 'saintsStatsDbConfig',
        WithDecryption: true
    };

    ssm.getParameter(params, (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        const saintsStatsDbConfig = JSON.parse(data.Parameter.Value);

        callback(null, saintsStatsDbConfig);
    });
}

function connectToDatabase(saintsStatsDbConfig, callback) {
    const connection = mysql.createConnection({
        host: saintsStatsDbConfig.endpoints.angularSaintsStatsDb,
        user: saintsStatsDbConfig.credentials.rdsSaintsStatsData.username,
        password: saintsStatsDbConfig.credentials.rdsSaintsStatsData.password,
        database: saintsStatsDbConfig.credentials.rdsSaintsStatsData.database
    });

    callback(null, connection);
}

module.exports = {
    getCredentials,
    connectToDatabase
};