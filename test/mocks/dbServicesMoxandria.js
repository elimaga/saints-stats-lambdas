function dbServicesMoxandria (mockApi) {
    return {
        connectToDatabase: () => {},
        query: () => {
            const [err, data] = mockApi.queryDequeueData();
            return new Promise((resolve, reject) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        },
        disconnectDb: () => {}
    }
}

module.exports = dbServicesMoxandria;