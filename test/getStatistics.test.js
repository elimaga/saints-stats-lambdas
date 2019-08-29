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

        mockery.registerMock('./saintsStatsDbConfig.json', dbMocks.saintsStatsDbConfigMock);
        mockery.registerMock('mysql', dbMocks.mySqlMock);
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

    describe('getStatistics', () => {
        it('should query the database for the statistics', () => {
            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            const expectedDbQueryString = 'SELECT P.Number, P.Name, SC.Abbreviation, S.Value ' +
                'FROM Statistics S ' +
                'INNER JOIN Players P on S.PlayerId = P.Id ' +
                'INNER JOIN StatsCategories SC on S.CategoryId = SC.Id ' +
                'ORDER BY P.Number, SC.Id';

            const expectedDbArgs = [];
            assert.equal(dbMocks.dbConnectionMock.query.callCount, 1);
            assert.equal(dbMocks.dbConnectionMock.query.args[0][0], expectedDbQueryString);
            assert.equal(JSON.stringify(dbMocks.dbConnectionMock.query.args[0][1]), JSON.stringify(expectedDbArgs));
        });

        it('should return the stats categories as an array of stats for each player', () => {
            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(getStatisticsLambdaCallback.callCount, 0);

            const statisticsFake = [
                {Number: 1, Name: 'Player1', Abbreviation: 'FC', Value: 8},
                {Number: 1, Name: 'Player1', Abbreviation: 'CF', Value: 6},
                {Number: 2, Name: 'Player2', Abbreviation: 'FC', Value: 5},
                {Number: 2, Name: 'Player2', Abbreviation: 'CF', Value: 10}
            ];
            const getStatisticsFromDbCallback = dbMocks.dbConnectionMock.query.args[0][2];
            getStatisticsFromDbCallback(null, statisticsFake);

            const expectedFormattedStats = [
                {
                    Number: 1,
                    Name: 'Player1',
                    FC: 8,
                    CF: 6
                },
                {
                    Number: 2,
                    Name: 'Player2',
                    FC: 5,
                    CF: 10
                }
            ];

            assert.equal(getStatisticsLambdaCallback.callCount, 1);
            assert.equal(getStatisticsLambdaCallback.args[0][0], null);
            assert.equal(JSON.stringify(getStatisticsLambdaCallback.args[0][1]), JSON.stringify(expectedFormattedStats));
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 1);
        });

        it('should return an error if the database query fails', () => {
            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(getStatisticsLambdaCallback.callCount, 0);

            const dbQueryError = 'this is an error querying the database';
            const getStatisticsFromDbCallback = dbMocks.dbConnectionMock.query.args[0][2];
            getStatisticsFromDbCallback(dbQueryError);

            assert.equal(getStatisticsLambdaCallback.callCount, 1);
            assert.equal(getStatisticsLambdaCallback.args[0][0], dbQueryError);
            assert.equal(getStatisticsLambdaCallback.args[0][1], undefined);
            assert.equal(dbMocks.dbConnectionMock.end.callCount, 1);
        });
    });
});
