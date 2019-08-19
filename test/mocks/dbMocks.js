const sinon = require('sinon');

function dbMocks() {
    const databaseCredentialData = {
        apiEndpoint: 'apiEndpoint'
    };
    const dbConnectionMock = {
        query: sinon.spy()
    };
    
    return {
        databaseCredentialData,
        dbConnectionMock
    }
}

module.exports = dbMocks;