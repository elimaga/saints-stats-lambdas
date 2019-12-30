function dbServicesMoxandria (mockApi) {
    return {
        connectToDatabase: () => {},
        query: () => {
            const [err, data] = mockApi.queryDequeueData();
            return new Promise((resolve, reject) => {
                err ? reject(err) : resolve(data);
            });
        },
        disconnectDb: () => {}
    }
}

module.exports = dbServicesMoxandria;