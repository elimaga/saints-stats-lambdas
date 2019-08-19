const sinon = require('sinon');

function awsMocks() {
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

    const getParameterDbConfig = {
        Parameter: {
            Name: 'saintsStatsDbConfig',
            Value: JSON.stringify(saintsStatsDbConfigMock)
        }
    };

    const awsSdkSsmGetParameterSpy = sinon.spy();

    const awsSdkMock = {
        config: {
            update: sinon.spy()
        },
        SSM: sinon.spy(() => {
            return {
                getParameter: awsSdkSsmGetParameterSpy
            }
        })
    };

    return {
        awsSdkMock,
        getParameterDbConfig,
        awsSdkSsmGetParameterSpy
    }
}

module.exports = awsMocks;
