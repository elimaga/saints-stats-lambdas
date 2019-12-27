const basedir = '../functions/getStatsCategories';
const assert = require('assert');
const mockery = require('mockery');
const moxandriaFactory = require('moxandria');

describe('getStatsCategories Lambda Test', () => {
    let getStatsCategoriesLambda;
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
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('connectToDatabase', () => {
        it('should create a connection to the database', (done) => {
            dbServicesLayerMock.queryEnqueueData([null, []]);

            getStatsCategoriesLambda({}, {}, () => {
                assert.equal(dbServicesLayerMock.connectToDatabase.callCount, 1);
                done();
            });
        });
    });

    describe('getStatsCategories', () => {
        it('should query the database for the stats categories', (done) => {
            const expectedDbQueryString = 'SELECT * FROM StatsCategories ' +
                'ORDER BY Id ASC';
            const expectedDbArgs = [];
            dbServicesLayerMock.queryEnqueueData([null, []]);

            getStatsCategoriesLambda({}, {}, () => {
                assert.equal(dbServicesLayerMock.query.args[0][0], expectedDbQueryString);
                assert.deepEqual(dbServicesLayerMock.query.args[0][1], expectedDbArgs);
                done()
            });
        });

        it('should return the stats categories', (done) => {
            const statsCategoriesFake = [
                { Id: 1, Abbreviation: 'FC', CategoryName: 'Fake Category' },
                { Id: 2, Abbreviation: 'CF', CategoryName: 'Category that is Fake' }
            ];
            dbServicesLayerMock.queryEnqueueData([null, statsCategoriesFake]);

            getStatsCategoriesLambda({}, {}, (err, data) => {
                assert.ifError(err);
                assert.equal(data, statsCategoriesFake);
                assert.equal(dbServicesLayerMock.disconnectDb.callCount, 1);
                done();
            });
        });

        it('should return an error if the database query fails', (done) => {
            const dbQueryError = 'this is an error querying the database';
            dbServicesLayerMock.queryEnqueueData([dbQueryError]);

            getStatsCategoriesLambda({}, {}, (err, data) => {
                assert.equal(err, dbQueryError);
                assert.equal(data, undefined);
                assert.equal(dbServicesLayerMock.disconnectDb.callCount, 1);
                done();
            });
        });
    });
});
