const sinon = require('sinon');

function dbMocks() {
    const databaseCredentialData = {
        apiEndpoint: 'apiEndpoint'
    };
    
    const dbConnectionMock = {
        query: sinon.spy()
    };

    const mySqlMock = {
        createConnection: sinon.spy(function() {
            return dbConnectionMock;
        })
    };
    
    return {
        databaseCredentialData,
        dbConnectionMock,
        mySqlMock
    }
}

module.exports = dbMocks;