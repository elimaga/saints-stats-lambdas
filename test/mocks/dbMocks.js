const sinon = require('sinon');

function dbMocks() {
    const saintsStatsDbConfigMock = {
        endpoints: {
            angularSaintsStatsDb: 'databaseEndpoint'
        },
        credentials: {
            rdsSaintsStatsData: {
                username: 'username',
                password: 'password',
                database: 'database'
            }
        }
    };
    
    const dbConnectionMock = {
        query: sinon.spy(),
        end: sinon.spy()
    };

    const mySqlMock = {
        createConnection: sinon.spy(function() {
            return dbConnectionMock;
        })
    };
    
    return {
        saintsStatsDbConfigMock,
        dbConnectionMock,
        mySqlMock
    }
}

module.exports = dbMocks;
