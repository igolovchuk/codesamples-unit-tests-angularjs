/**
* The search service tests.
*/
describe('searchService Tests', function () {

    /**
    * @private @type {Scripts.Tests.App.Helpers.search-response-helper} The search response helper.
    */
    var searchResponseHelper;

    // Initialize shared data between tests running.
    beforeAll(function () {
        searchResponseHelper = new SearchResponseHelper();
    });

    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        angular.mock.module(function ($provide) {
            $provide.service('httpService', function () {
                this.getAsync = jasmine.createSpy();
                this.fromPromiseResult = jasmine.createSpy();
                this.newDeffer = jasmine.createSpy();
            });

            $provide.factory('urlHelper', function () {
                return {
                    fixedEncodeURIComponent: jasmine.createSpy()
                };
            });

            $provide.service('logService', function () {
                this.debug = jasmine.createSpy();
            });
        });
    });

    // Angular promises are synchronous during tests,
    // $rootScope.$digest() is enough to make them settled at the end of the spec.
    afterEach(inject(function ($rootScope) {
        $rootScope.$digest(); // Called to resolve all promises.
    }));

    // Test service initialization.
    it('Search Service is defined on initialization', inject(function (searchService) {
        // Assert.
        expect(searchService).toBeDefined();
    }));

    // Test service method.
    it('Search Service cancells all pending requests', inject(function (searchService) {
        // Act & Assert.
        expect(function () {
            searchService.cancelPendingRequests();
        }).not.toThrow();
    }));

    // Test service methods.
    it('Search Service makes successful request and filters out all locations', inject(function (searchService, httpService, $q, urlHelper) {
        //Arange.
        var cabinetId = 'NG-12345';
        var queryText = 'test';
        var deffered = { promise: {} };
        var searchConfig = {
            cabinetId: cabinetId,
            includeFilters: false,
            includeWorkspaces: false,
            includeFolders: false
        };

        urlHelper.fixedEncodeURIComponent.withArgs(queryText).and.returnValue(queryText);

        httpService.newDeffer.and.returnValue(deffered);
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_URL_TEMPLATE, cabinetId, queryText), deffered.promise).and.returnValue($q.resolve(searchResponseHelper.getSearchRequestResult(true, cabinetId, queryText)));
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_CONFIG_URL_TEMPLATE, cabinetId), deffered.promise).and.returnValue($q.resolve(searchResponseHelper.getSearchConfigRequestResult(true, searchConfig, cabinetId)));

        // Act.
        searchService.loadQuickSearchLocationsAsync(cabinetId, queryText)
                     .then(function (result) {

                         // Assert.
                         expect(result).toBeDefined();
                         expect(result.isSuccessful).toBeTruthy();
                         expect(result.response.filingLocations.length).toEqual(0);
                     });
    }));

    // Test service methods.
    it('Search Service caches config data if make secod call with same data', inject(function (searchService, httpService, $q, urlHelper) {
        //Arange.
        var cabinetId = 'NG-12345';
        var queryText = 'test';
        var deffered = { promise: {} };
        var searchConfig = {
            cabinetId: cabinetId,
            includeFilters: true,
            includeWorkspaces: true,
            includeFolders: true
        };
        var searchResult = searchResponseHelper.getSearchRequestResult(true, cabinetId, queryText);

        urlHelper.fixedEncodeURIComponent.withArgs(queryText).and.returnValue(queryText);

        httpService.newDeffer.and.returnValue(deffered);
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_URL_TEMPLATE, cabinetId, queryText), deffered.promise).and.returnValue($q.resolve(searchResult));
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_CONFIG_URL_TEMPLATE, cabinetId), deffered.promise).and.returnValue($q.resolve(searchResponseHelper.getSearchConfigRequestResult(true, searchConfig, cabinetId)));
        httpService.fromPromiseResult.and.returnValue($q.resolve([]));// [] - because all types included.

        // Act.
        searchService.loadQuickSearchLocationsAsync(cabinetId, queryText).then(function () {
            searchService.loadQuickSearchLocationsAsync(cabinetId, queryText)
                .then(function (result) {
                    // Assert.
                    expect(httpService.getAsync).toHaveBeenCalledTimes(3);
                    expect(httpService.fromPromiseResult).toHaveBeenCalled();
                 
                    expect(result).toBeDefined();
                    expect(result.isSuccessful).toBeTruthy();
                    expect(result.response.filingLocations.length).toEqual(searchResult.response.filingLocations.length);
                });
        });
    }));

    // Test service methods.
    it('Search Service return error request result of response not succeessful', inject(function (searchService, httpService, $q, urlHelper) {
        //Arange.
        var cabinetId = 'NG-12345';
        var queryText = 'test';
        var deffered = { promise: {} };

        urlHelper.fixedEncodeURIComponent.withArgs(queryText).and.returnValue(queryText);
        httpService.newDeffer.and.returnValue(deffered);
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_URL_TEMPLATE, cabinetId, queryText), deffered.promise).and.returnValue($q.resolve(searchResponseHelper.getSearchRequestResult(false, cabinetId, queryText)));

        // Act.
        searchService.loadQuickSearchLocationsAsync(cabinetId, queryText)
                     .then(function (result) {

                        // Assert.
                        expect(result).toBeDefined();
                        expect(result.isSuccessful).toBeFalsy();
                        expect(result.response).toBeFalsy();
                     });
    }));

    // Test service methods.
    it('Search Service does not makes filtering when locations list is empty', inject(function (searchService, httpService, $q, urlHelper) {
        //Arange.
        var cabinetId = 'NG-12345';
        var queryText = 'test';
        var deffered = { promise: {} };
        var searchResult = searchResponseHelper.getSearchRequestResult(true, cabinetId, queryText);
        searchResult.response.filingLocations = [];

        urlHelper.fixedEncodeURIComponent.withArgs(queryText).and.returnValue(queryText);
        httpService.newDeffer.and.returnValue(deffered);
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_URL_TEMPLATE, cabinetId, queryText), deffered.promise).and.returnValue($q.resolve(searchResult));

        // Act.
        searchService.loadQuickSearchLocationsAsync(cabinetId, queryText)
            .then(function (result) {

                // Assert.
                expect(httpService.getAsync).not.toHaveBeenCalledWith(String.format(Constants.QUICK_SEARCH_CONFIG_URL_TEMPLATE, cabinetId));
                expect(result).toBeDefined();
                expect(result.isSuccessful).toBeTruthy();
                expect(result.response.filingLocations.length).toEqual(0);
            });
    }));

    // Test service methods.
    it('Search Service does not makes filtering when configuration call returns error', inject(function (searchService, httpService, $q, urlHelper) {
        //Arange.
        var cabinetId = 'NG-12345';
        var queryText = 'test';
        var deffered = { promise: {} };
        var searchResult = searchResponseHelper.getSearchRequestResult(true, cabinetId, queryText);

        urlHelper.fixedEncodeURIComponent.withArgs(queryText).and.returnValue(queryText);
        httpService.newDeffer.and.returnValue(deffered);
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_URL_TEMPLATE, cabinetId, queryText), deffered.promise).and.returnValue($q.resolve(searchResult));
        httpService.getAsync.withArgs(String.format(Constants.QUICK_SEARCH_CONFIG_URL_TEMPLATE, cabinetId), deffered.promise).and.returnValue($q.resolve(searchResponseHelper.getSearchConfigRequestResult(false, null, cabinetId)));

        // Act.
        searchService.loadQuickSearchLocationsAsync(cabinetId, queryText)
            .then(function (result) {

                // Assert.
                expect(result).toBeDefined();
                expect(result.isSuccessful).toBeTruthy();
                expect(result.response.filingLocations.length).toEqual(searchResult.response.filingLocations.length);
            });
    }));
});