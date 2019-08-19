const awsSdk = require('aws-sdk');

function getCredentials(callback) {
    awsSdk.config.update({region: 'us-west-1'});

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

module.exports = {
    getCredentials
};