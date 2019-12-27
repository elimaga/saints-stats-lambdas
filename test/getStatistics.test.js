const basedir = '../functions/getStatistics';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const moxandriaFactory = require('moxandria');

describe('getStatistics Lambda Test', () => {
    let getStatisticsLambda;
    let getStatisticsLambdaCallback;
    let dbServicesLayerMock;

    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: true,
            warnOnUnregistered: false
        });
        
        const config = {
            cwd: 'test/mocks',
            mockPaths: ['']
        }
        const moxandria = moxandriaFactory(config);

        dbServicesLayerMock = moxandria.buildMock('dbServicesMoxandria');
        mockery.registerMock('/opt/databaseServiceLayer/index', dbServicesLayerMock);
        getStatisticsLambda = require(`${basedir}/index`).handler;

        getStatisticsLambdaCallback = sinon.spy();
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('connectToDatabase', () => {
        it('should create a connection to the database', () => {
            dbServicesLayerMock.queryEnqueueData([null, []]);

            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(dbServicesLayerMock.connectToDatabase.callCount, 1);
        });
    });

    describe('getStatistics', () => {
        it('should query the database for the statistics', () => {
            dbServicesLayerMock.queryEnqueueData([null, []]);

            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            const expectedDbQueryString = 'SELECT P.Number, P.Name, SC.Abbreviation, S.Value ' +
                'FROM Statistics S ' +
                'INNER JOIN Players P on S.PlayerId = P.Id ' +
                'INNER JOIN StatsCategories SC on S.CategoryId = SC.Id ' +
                'ORDER BY P.Number, SC.Id';

            const expectedDbArgs = [];
            assert.equal(dbServicesLayerMock.query.callCount, 1);
            assert.equal(dbServicesLayerMock.query.args[0][0], expectedDbQueryString);
            assert.equal(JSON.stringify(dbServicesLayerMock.query.args[0][1]), JSON.stringify(expectedDbArgs));
        });

        it('should return the stats categories as an array of stats for each player', () => {
            const statisticsFake = [
                {Number: 1, Name: 'Player1', Abbreviation: 'FC', Value: 8},
                {Number: 1, Name: 'Player1', Abbreviation: 'CF', Value: 6},
                {Number: 2, Name: 'Player2', Abbreviation: 'FC', Value: 5},
                {Number: 2, Name: 'Player2', Abbreviation: 'CF', Value: 10}
            ];
            dbServicesLayerMock.queryEnqueueData([null, statisticsFake]);

            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

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
            assert.equal(dbServicesLayerMock.disconnectDb.callCount, 1);
        });

        it('should return an error if the database query fails', () => {
            const dbQueryError = 'this is an error querying the database';
            dbServicesLayerMock.queryEnqueueData([dbQueryError]);

            getStatisticsLambda({}, {}, getStatisticsLambdaCallback);

            assert.equal(getStatisticsLambdaCallback.callCount, 1);
            assert.equal(getStatisticsLambdaCallback.args[0][0], dbQueryError);
            assert.equal(getStatisticsLambdaCallback.args[0][1], undefined);
            assert.equal(dbServicesLayerMock.disconnectDb.callCount, 1);
        });
    });
});
