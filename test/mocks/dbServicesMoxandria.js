function dbServicesMoxandria (mockApi) {
    return {
        connectToDatabase: function (callback) {
            callback()
        },
        query: function (sql, params, callback) {
            const callbackData = mockApi.queryDequeueData();
            callback.apply(null, callbackData);
        },
        disconnectDb: () => {}
    }
}

module.exports = dbServicesMoxandria;