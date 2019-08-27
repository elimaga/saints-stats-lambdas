const basedir = '../functions/getStatistics';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const dbMocksConstructor = require('./mocks/dbMocks');

describe('getStatistics Lambda Test', () => {
    let getStatisticsLambda;
    let getStatisticsLambdaCallback;
    let dbMocks;

    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: true,
            warnOnUnregistered: false
        });

        getStatisticsLambdaCallback = sinon.spy();

        dbMocks = dbMocksConstructor();

        // mockery.registerMock('./saintsStatsDbConfig.json', dbMocks.saintsStatsDbConfigMock);
        // mockery.registerMock('mysql', dbMocks.mySqlMock);
        getStatisticsLambda = require(`${basedir}/index`).handler;
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });


    describe('connectToDatabase', () => {
        it('should create a connection to the database', () => {
            const expectedDatabaseConnectionData = {
                host: dbMocks.saintsStatsDbConfigMock.endpoints.angularSaintsStatsDb,
                user: dbMocks.saintsStatsDbConfigMock.credentials.rdsSaintsStatsData.username,
                password: dbMocks.saintsStatsDbConfigMock.credentials.rdsSaintsStatsData.password,
                database: dbMocks.saintsStatsDbConfigMock.credentials.rdsSaintsStatsData.database
            };

            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(dbMocks.mySqlMock.createConnection.callCount, 1);
            assert.equal(JSON.stringify(dbMocks.mySqlMock.createConnection.args[0][0]), JSON.stringify(expectedDatabaseConnectionData));
        });
    });

    describe.skip('getStatistics', () => {
        it('should query the database for the stats categories', () => {
            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            const expectedDbQueryString = 'SELECT * FROM StatsCategories ' +
                                          'ORDER BY Id ASC';
            const expectedDbArgs = [];
            assert.equal(dbMocks.dbConnectionMock.query.callCount, 1);
            assert.equal(dbMocks.dbConnectionMock.query.args[0][0], expectedDbQueryString);
            assert.equal(JSON.stringify(dbMocks.dbConnectionMock.query.args[0][1]), JSON.stringify(expectedDbArgs));
        });

        it('should return the stats categories', () => {
            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(getStatisticsLambdaCallback.callCount, 0);

            const statsCategoriesFake = [
                {Id: 1, Abbreviation: 'FC', CategoryName: 'Fake Category'},
                {Id: 2, Abbreviation: 'CF', CategoryName: 'Category that is Fake'}
            ];
            const getStatsCategoriesFromDbCallback = dbMocks.dbConnectionMock.query.args[0][2];
            getStatsCategoriesFromDbCallback(null, statsCategoriesFake);

            assert.equal(getStatisticsLambdaCallback.callCount, 1);
            assert.equal(getStatisticsLambdaCallback.args[0][0], null);
            assert.equal(getStatisticsLambdaCallback.args[0][1], statsCategoriesFake);
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 1);
        });

        it('should return an error if the database query fails', () => {
            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(getStatisticsLambdaCallback.callCount, 0);

            const dbQueryError = 'this is an error querying the database';
            const getStatsCategoriesFromDbCallback = dbMocks.dbConnectionMock.query.args[0][2];
            getStatsCategoriesFromDbCallback(dbQueryError);

            assert.equal(getStatisticsLambdaCallback.callCount, 1);
            assert.equal(getStatisticsLambdaCallback.args[0][0], dbQueryError);
            assert.equal(getStatisticsLambdaCallback.args[0][1], undefined);
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 1);
        });
    });
});
