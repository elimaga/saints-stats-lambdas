const basedir = '../functions/getStatsCategories';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const awsMocksConstructor = require('./mocks/awsMocks');
const dbMocksConstructor = require('./mocks/dbMocks');

describe('getStatsCategories Lambda Test', () => {
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
        getStatsCategoriesLambda = require(`${basedir}/index`).handler;
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    function callbackFromGetCredentials() {
        const getParameterCallback = awsMocks.awsSdkSsmGetParameterSpy.args[0][1];
        getParameterCallback(null, awsMocks.getParameterDbConfig);
    }

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
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 0);
        });
    });

    describe('connectToDatabase', () => {
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
    });

    describe('getStatsCategories', () => {
        it('should query the database for the stats categories', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            callbackFromGetCredentials();

            const expectedDbQueryString = 'SELECT * FROM StatsCategories ' +
                                          'ORDER BY Id ASC';
            const expectedDbArgs = [];
            assert.equal(dbMocks.dbConnectionMock.query.callCount, 1);
            assert.equal(dbMocks.dbConnectionMock.query.args[0][0], expectedDbQueryString);
            assert.equal(JSON.stringify(dbMocks.dbConnectionMock.query.args[0][1]), JSON.stringify(expectedDbArgs));
        });

        it('should return the stats categories', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            callbackFromGetCredentials();

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 0);

            const statsCategoriesFake = [
                {Id: 1, Abbreviation: 'FC', CategoryName: 'Fake Category'},
                {Id: 2, Abbreviation: 'CF', CategoryName: 'Category that is Fake'}
            ];
            const getStatsCategoriesFromDbCallback = dbMocks.dbConnectionMock.query.args[0][2];
            getStatsCategoriesFromDbCallback(null, statsCategoriesFake);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], null);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][1], statsCategoriesFake);
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 1);
        });

        it('should return an error if the database query fails', () => {
            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            callbackFromGetCredentials();

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 0);

            const dbQueryError = 'this is an error querying the database';
            const getStatsCategoriesFromDbCallback = dbMocks.dbConnectionMock.query.args[0][2];
            getStatsCategoriesFromDbCallback(dbQueryError);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], dbQueryError);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][1], undefined);
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 1);
        });
    });
});
