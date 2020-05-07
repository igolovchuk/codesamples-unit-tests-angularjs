/**
* The cabinet service tests.
*/
describe('cabinetService Tests', function () {
    /**
    * @private @type {jasmine.spy} The get cabinets moked function.
    */
    var getCabinetsMockFunction;

    /**
    * @private @type {Scripts.Tests.App.Helpers.cabinet-response-helper} The cabinet response helper.
    */
    var cabinetResponseHelper;

    /**
    * @private @type {string} The test host key.
    */
    var hostKey = 'lab.domain.com';

    // Initialize shared data between tests running.
    beforeAll(function () {
        cabinetResponseHelper = new CabinetResponseHelper();
    });

    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        getCabinetsMockFunction = jasmine.createSpy('getAsync');

        angular.mock.module(function ($provide) {
            $provide.service('httpService', function () {
                this.getAsync = getCabinetsMockFunction;
                this.fromPromiseResult = jasmine.createSpy();
            });
            $provide.service('settingService', function () {
                this.defaultCabinetId = null;
                this.saveAsync = jasmine.createSpy();
                this.tokenData = { hostKey: hostKey };
                this.appSettings = {
                    filingConfiguration: { setIndicator: true },
                    cachingConfiguration: { cabinetCachingEnabled: false }
                };
            });
            $provide.service('logService', function () {
                this.debug = jasmine.createSpy();
            });
            $provide.service('storageService', function () {
                this.getItem = jasmine.createSpy();
                this.setItem = jasmine.createSpy();
                this.removeItem = jasmine.createSpy();
            });
        });
    });

    // Angular promises are synchronous during tests,
    // $rootScope.$digest() is enough to make them settled at the end of the spec.
    afterEach(inject(function ($rootScope) {
        $rootScope.$digest(); // Called to resolve all promises.
    }));

    // Test service initialization.
    it('Cabinet Service is defined on initialization', inject(function (cabinetService) {
        // Assert.
        expect(cabinetService).toBeDefined();
    }));

    // Test service successful flow.
    it('Cabinet Service loads and parses cabinets successfully', inject(function ($q, cabinetService) {
        // Arrange.
        getCabinetsMockFunction.withArgs(Constants.USER_CABINETS_URL).and.returnValue($q.resolve(cabinetResponseHelper.getCabinetRequestResult(true)));

        // Cabinets should be sorted by default cabinet and by name.
        jasmine.addMatchers({
            toBeSorted: function () {
                return {
                    compare: function (actual) {
                        var expected = actual.slice().sort(function (a, b) { return b.isDefault - a.isDefault || a.name.localeCompare(b.name); });

                        return {
                            pass: jasmine.matchersUtil.equals(actual, expected)
                        };
                    }
                };
            }
        });

        // Act.
        cabinetService.loadCabinetsAsync().then(function (result) {
            // Assert.
            expect(result.isSuccessful).toBeTruthy();
            expect(getCabinetsMockFunction).toHaveBeenCalledWith(Constants.USER_CABINETS_URL);
            expect(result.response.length).toBeGreaterThan(0);
            expect(result.response).toBeSorted();
        });
    }));

    // Test service successful flow.
    it('Cabinet Service loads cabinets from cache if exisits successfully', inject(function ($q, cabinetService, storageService, settingService) {
        // Arrange.
        settingService.appSettings.cachingConfiguration.cabinetCachingEnabled = true;
        var cabinetResult = cabinetResponseHelper.getCabinetRequestResultByStatus(RequestResultStatus.success);

        storageService.getItem.withArgs(StorageType.database, Constants.CABINET_CACHE_KEY).and.returnValue($q.resolve({ creationDate: new Date().toISOString(), value: cabinetResult }));

        // Act.
        cabinetService.loadCabinetsAsync().then(function (result) {
            // Assert.
            expect(result.isSuccessful).toBeTruthy();
            expect(getCabinetsMockFunction).not.toHaveBeenCalledWith(Constants.USER_CABINETS_URL);
            expect(storageService.getItem).toHaveBeenCalledWith(StorageType.database, Constants.CABINET_CACHE_KEY);
            expect(result.response.length).toBeGreaterThan(0);
        });
    }));

    // Test service successful flow.
    it('Cabinet Service makes server call if cache is expired and updates cache', inject(function ($q, cabinetService, storageService, settingService) {
        // Arrange.
        settingService.appSettings.cachingConfiguration.cabinetCachingEnabled = true;
        var cabinetResult = cabinetResponseHelper.getCabinetRequestResult(true);

        getCabinetsMockFunction.withArgs(Constants.USER_CABINETS_URL).and.returnValue($q.resolve(cabinetResult));
        storageService.getItem.withArgs(StorageType.database, Constants.CABINET_CACHE_KEY).and.returnValue($q.resolve({ creationDate: new Date('05 October 2018 14:48 UTC').toISOString(), value: cabinetResult }));

        // Act.
        cabinetService.loadCabinetsAsync().then(function (result) {
            // Assert.
            expect(result.isSuccessful).toBeTruthy();
            expect(getCabinetsMockFunction).toHaveBeenCalledWith(Constants.USER_CABINETS_URL);
            expect(storageService.getItem).toHaveBeenCalledWith(StorageType.database, Constants.CABINET_CACHE_KEY);
            expect(storageService.setItem).toHaveBeenCalled();
            expect(result.response.length).toBeGreaterThan(0);
        });
    }));

    // Test service negative flow.
    it('Cabinet Service received error eresponse and return data as is', inject(function ($q, cabinetService) {
        // Arrange.
        getCabinetsMockFunction.withArgs(Constants.USER_CABINETS_URL).and.returnValue($q.resolve(cabinetResponseHelper.getCabinetRequestResult(false)));

        // Act.
        cabinetService.loadCabinetsAsync().then(function (result) {
            // Assert.
            expect(result.isSuccessful).toBeFalsy();
            expect(getCabinetsMockFunction).toHaveBeenCalledWith(Constants.USER_CABINETS_URL);

            expect(result.response).toBeFalsy();
        });
    }));

    // Test service getting default user cabinet identifier.
    it('Cabinet Service returns current cabinet Id value based on user settings and only if it exists in cabinet list response', inject(function ($q, cabinetService, settingService) {
        // Arrange.
        getCabinetsMockFunction.withArgs(Constants.USER_CABINETS_URL).and.returnValue($q.resolve(cabinetResponseHelper.getCabinetRequestResult(true)));
        cabinetService.loadCabinetsAsync().then(function (result) {
            // Set default cabinet id value from existing response to ensure that it is existing one.
            settingService.defaultCabinetId = result.response[0].id;

            // Act.
            var currentCabinetId = cabinetService.getCurrentCabinetId();

            // Assert.
            expect(currentCabinetId).toEqual(settingService.defaultCabinetId);
        });
    }));

    // Test service getting default user cabinet identifier.
    it('Cabinet Service returns null if the saved settings value does not exist in cabinet list response', inject(function ($q, cabinetService, settingService) {
        // Arrange.
        getCabinetsMockFunction.withArgs(Constants.USER_CABINETS_URL).and.returnValue($q.resolve(cabinetResponseHelper.getCabinetRequestResult(true)));

        // Set default cabinet id value that not exists in response.
        settingService.defaultCabinetId = 'NG-12345';
        cabinetService.loadCabinetsAsync().then(function (result) {

            // Act.
            var currentCabinetId = cabinetService.getCurrentCabinetId();

            // Assert.
            expect(currentCabinetId).toBeFalsy();
        });
    }));

    // Test service setting default user cabinet identifier.
    it('Cabinet Service sets user default cabinet Id value to settings', inject(function (cabinetService, settingService, $q, logService, $rootScope) {
        // Arrange.
        var newCurrentCabinetIdValue = 'NG-54554';
        settingService.saveAsync.and.returnValue($q.resolve(true));

        // Act.
        cabinetService.setUserDefaultCabinetIdAsync(newCurrentCabinetIdValue);
        $rootScope.$digest(); // Called to resolve all promises.

        // Assert.
        expect(settingService.saveAsync).toHaveBeenCalled();
        expect(logService.debug).toHaveBeenCalled();
        expect(settingService.defaultCabinetId).toEqual(newCurrentCabinetIdValue);
    }));

    // Test service cache clearing.
    it('Cabinet Service clearCache test', inject(function (cabinetService, storageService, settingService) {
        // Act.
        cabinetService.clearCache();
        settingService.appSettings.cachingConfiguration.cabinetCachingEnabled = true;
        cabinetService.clearCache();
      
        // Assert.
        expect(storageService.removeItem).toHaveBeenCalledTimes(1);
    }));
});