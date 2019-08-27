const async = require('async');

function handler(event, context, doneCallback) {
    console.log('Start process\n', JSON.stringify(event));

    process.on('uncaughtException', (err) => {
        console.log('uncaught error', err);
        doneCallback(err);
    });

    async.waterfall([

    ], (err, statsCategories) => {
        doneCallback(err, statsCategories);
    })
}

module.exports = {
    handler
};
