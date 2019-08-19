const basedir = '../functions/getStatsCategories';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const awsMocksConstructor = require('./mocks/awsMocks');
const dbMocksConstructor = require('./mocks/dbMocks');

describe('getStatsCategories Test', () => {
    let getStatsCategoriesLambda;
    let getStatsCategoriesLambdaCallback;
    let awsMocks;
    let dbMocks;

    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: true,
            warnOnUnregistered: false
        });

        getStatsCategoriesLambdaCallback = sinon.spy();

        awsMocks = awsMocksConstructor();
        dbMocks = dbMocksConstructor();

        mockery.registerMock('aws-sdk', awsMocks.awsSdkMock);
        mockery.registerMock('mysql', dbMocks.mySqlMock);
        getStatsCategoriesLambda = require(`${basedir}/index`).handle;
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    })

    describe('getCredentials', () => {
        it('should update the region for aws', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(awsMocks.awsSdkMock.config.update.callCount, 1);
            assert.equal(JSON.stringify(awsMocks.awsSdkMock.config.update.args[0][0]), JSON.stringify({region: 'us-west-1'}));
        });

        it('should create a new SSM object', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(awsMocks.awsSdkMock.SSM.callCount, 1);
        });

        it('should attempt to get the database credential data from SSM', () => {
            const expectedParams = {
                Name: 'saintsStatsDbConfig',
                WithDecryption: true
            };

            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(awsMocks.awsSdkSsmGetParameterSpy.callCount, 1);
            assert.equal(JSON.stringify(awsMocks.awsSdkSsmGetParameterSpy.args[0][0]), JSON.stringify(expectedParams));
        });
        
        it.skip('should return the database credentials returned from SSM', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 0);

            const getParameterCallback = awsMocks.awsSdkSsmGetParameterSpy.args[0][1];
            getParameterCallback(null, awsMocks.getParameterDbConfig);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], null);
            assert.equal(JSON.stringify(getStatsCategoriesLambdaCallback.args[0][1]), awsMocks.getParameterDbConfig.Parameter.Value);
        });
      
        it('should return if there is an error withh AWS', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 0);

            const getParameterError = 'this is an error in getting parameter';
            const getParameterCallback = awsMocks.awsSdkSsmGetParameterSpy.args[0][1];
            getParameterCallback(getParameterError);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], getParameterError);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][1], undefined);
        });
    });

    describe('connectToDatabase', () => {
        function callbackFromGetCredentials() {
            const getParameterCallback = awsMocks.awsSdkSsmGetParameterSpy.args[0][1];
            getParameterCallback(null, awsMocks.getParameterDbConfig);
        }

        it('should create a connection to the database', () => {
            const expectedDatabaseConnectionData = {
                host: awsMocks.saintsStatsDbConfigMock.endpoints.angularSaintsStatsDb,
                user: awsMocks.saintsStatsDbConfigMock.credentials.rdsSaintsStatsData.username,
                password: awsMocks.saintsStatsDbConfigMock.credentials.rdsSaintsStatsData.password,
                database: awsMocks.saintsStatsDbConfigMock.credentials.rdsSaintsStatsData.database
            };

            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            callbackFromGetCredentials();

            assert.equal(dbMocks.mySqlMock.createConnection.callCount, 1);
            assert.equal(JSON.stringify(dbMocks.mySqlMock.createConnection.args[0][0]), JSON.stringify(expectedDatabaseConnectionData));
        });

        it('should return the connection', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            callbackFromGetCredentials();

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], null);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][1], dbMocks.dbConnectionMock);
        });
    });
});