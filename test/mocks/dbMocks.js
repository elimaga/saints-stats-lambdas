const sinon = require('sinon');

function dbMocks() {
    const databaseServiceLayerMock = {
        connectToDatabase: sinon.spy(function (callback) {
            callback()
        }),
        query: sinon.spy(),
        disconnectDb: sinon.spy()
    };
    
    return {
        databaseServiceLayerMock
    }
}

module.exports = dbMocks;
