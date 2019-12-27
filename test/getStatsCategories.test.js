const basedir = '../functions/getStatsCategories';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const moxandriaFactory = require('moxandria');

describe('getStatsCategories Lambda Test', () => {
    let getStatsCategoriesLambda;
    let getStatsCategoriesLambdaCallback;
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
        getStatsCategoriesLambda = require(`${basedir}/index`).handler;

        getStatsCategoriesLambdaCallback = sinon.spy();
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('connectToDatabase', () => {
        it('should create a connection to the database', () => {
            dbServicesLayerMock.queryEnqueueData([null, []]);

            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(dbServicesLayerMock.connectToDatabase.callCount, 1);
        });
    });

    describe('getStatsCategories', () => {
        it('should query the database for the stats categories', () => {
            dbServicesLayerMock.queryEnqueueData([null, []]);

            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            const expectedDbQueryString = 'SELECT * FROM StatsCategories ' +
                                          'ORDER BY Id ASC';
            const expectedDbArgs = [];
            assert.equal(dbServicesLayerMock.query.callCount, 1);
            assert.equal(dbServicesLayerMock.query.args[0][0], expectedDbQueryString);
            assert.equal(JSON.stringify(dbServicesLayerMock.query.args[0][1]), JSON.stringify(expectedDbArgs));
        });

        it('should return the stats categories', () => {
            const statsCategoriesFake = [
                {Id: 1, Abbreviation: 'FC', CategoryName: 'Fake Category'},
                {Id: 2, Abbreviation: 'CF', CategoryName: 'Category that is Fake'}
            ];
            dbServicesLayerMock.queryEnqueueData([null, statsCategoriesFake]);

            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], null);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][1], statsCategoriesFake);
            assert.equal(dbServicesLayerMock.disconnectDb.callCount, 1);
        });

        it('should return an error if the database query fails', () => {
            const dbQueryError = 'this is an error querying the database';
            dbServicesLayerMock.queryEnqueueData([dbQueryError]);

            getStatsCategoriesLambda({}, {}, getStatsCategoriesLambdaCallback);

            assert.equal(getStatsCategoriesLambdaCallback.callCount, 1);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][0], dbQueryError);
            assert.equal(getStatsCategoriesLambdaCallback.args[0][1], undefined);
            assert.equal(dbServicesLayerMock.disconnectDb.callCount, 1);
        });
    });
});
