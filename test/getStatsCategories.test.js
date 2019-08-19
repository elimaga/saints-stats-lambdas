const basedir = '../functions/getStatsCategories';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const awsMocksConstructor = require('./mocks/awsMocks');

describe('getStatsCategories Test', () => {
    let getStatsCategoriesLambda;
    let awsMocks;

    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: true,
            warnOnUnregistered: false
        });

        awsMocks = awsMocksConstructor();

        mockery.registerMock('aws-sdk', awsMocks.awsSdkMock);
        getStatsCategoriesLambda = require(`${basedir}/index`).handle;
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    })

    describe('getCredentials', () => {
        let getStatsCategoriesLambdaCallback;

        beforeEach(() => {
            getStatsCategoriesLambdaCallback = sinon.spy();
        });

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
        
        it('should return the database credentials returned from SSM', () => {
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
});