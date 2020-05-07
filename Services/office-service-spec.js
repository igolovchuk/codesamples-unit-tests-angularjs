/**
* The office service tests.
*/
describe('officeService Tests', function () {

    /**
    * @private @type {string} The test Outlook user address.
    */
    var outlookUserAddress = 'test@outlook.com';

    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        angular.mock.module(function ($provide) {
            $provide.value('officeContext', {
                platform: OfficePlatform.officeOnline,
                mailbox: {
                    diagnostics: { hostName: OfficeHost.webApp },
                    userProfile: { emailAddress: outlookUserAddress },
                    item: {},
                    addHandlerAsync: jasmine.createSpy(),
                    removeHandlerAsync: jasmine.createSpy()
                },
                roamingSettings: {
                    saveAsync: function (callback) {
                        callback(true);
                    },
                    remove: jasmine.createSpy(),
                    get: jasmine.createSpy(),
                    set: jasmine.createSpy()
                },
                ui: {
                    messageParent: jasmine.createSpy(),
                    closeContainer: jasmine.createSpy(),
                    displayDialogAsync: jasmine.createSpy()
                }
            });

            $provide.factory('restApiProvider', function () {
                return {
                    getItemPropertiesAsync: {}
                };
            });
        });
    });

    // Test service initialization.
    it('Office Service is defined on initialization', inject(function (officeService) {
        // Assert.
        expect(officeService).toBeDefined();
    }));

    // Test service initialization.
    it('Office Service properties are defined on initialization', inject(function (officeService) {
        // Assert.
        expect(officeService.roamingSettings).toBeDefined();
        expect(officeService.activeItem).toBeDefined();
        expect(officeService.activeItem.RestApi).toBeDefined();
        expect(officeService.activeItem.RestApi.getItemPropertiesAsync).toBeDefined();
        expect(officeService.isInsideMailBox).toBeTruthy();
        expect(officeService.appHost).toEqual(OfficeHost.webApp);
        expect(officeService.platform).toEqual(OfficePlatform.officeOnline);
        expect(officeService.outlookUserId).toEqual(outlookUserAddress);
    }));

    // Test service methods.
    it('Office Service sendToParent Test', inject(function (officeService, officeContext) {
        // Arrange.
        var stringData = 'test';
        var objectData = { result: true };

        // Act.
        officeService.sendToParent(stringData);
        officeService.sendToParent(objectData);

        // Assert.
        expect(officeContext.ui.messageParent).toHaveBeenCalledTimes(2);
        expect(officeContext.ui.messageParent).toHaveBeenCalledWith(stringData);
        expect(officeContext.ui.messageParent).toHaveBeenCalledWith(JSON.stringify(objectData));
    }));

    // Test service methods.
    it('Office Service closeAddin Test', inject(function (officeService, officeContext) {
        // Act.
        officeService.closeAddin();

        // Assert.
        expect(officeContext.ui.closeContainer).toHaveBeenCalled();
    }));

    // Test service methods.
    it('Office Service addItemChangedHandlerAsync Test', inject(function (officeService, officeContext) {
        // Arrange.
        var handlerFunction = function () { };

        // Act.
        officeService.addItemChangedHandlerAsync(handlerFunction);

        // Assert.
        expect(officeContext.mailbox.addHandlerAsync).toHaveBeenCalledWith(Office.EventType.ItemChanged, handlerFunction);
    }));

    // Test service methods.
    it('Office Service removeItemChangedHandlerAsync Test', inject(function (officeService, officeContext) {
        // Act.
        officeService.removeItemChangedHandlerAsync();

        // Assert.
        expect(officeContext.mailbox.removeHandlerAsync).toHaveBeenCalledWith(Office.EventType.ItemChanged);
    }));

    // Test service methods.
    it('Office Service isSupportedItem Test', inject(function (officeService) {
        // Act.
        var isSupportedItemPost = officeService.isSupportedItem(Constants.OUTLOOK_ITEM_TYPE_POST);
        var isSupportedItemMessage = officeService.isSupportedItem(Constants.OUTLOOK_ITEM_TYPE_MESSAGE);

        // Assert.
        expect(isSupportedItemPost).toBeFalsy();
        expect(isSupportedItemMessage).toBeTruthy();
    }));

    // Test service methods.
    it('Office Service showDialogAsync Open Positive Result Success Test', inject(function (officeService, officeContext) {
        // Arrange.
        var resolvedState = 1;
        var result = 'dialog result';
        var asyncResult = {
            status: Office.AsyncResultStatus.Succeeded,
            value: {
                addEventHandler: function (eventType, messageCallback) {
                    messageCallback({ message: result });
                },
                close: jasmine.createSpy()
            }
        };

        officeContext.ui.displayDialogAsync = function (url, options, callback) {
            callback(asyncResult);
        };
    
        // Act.
        var dialogResultPromise = officeService.showDialogAsync('lab.domain.com');

        // Assert.
        expect(dialogResultPromise.$$state).toBeDefined();
        expect(dialogResultPromise.$$state.status).toEqual(resolvedState);
        expect(dialogResultPromise.$$state.value).toEqual(jasmine.any(DialogResult));
        expect(dialogResultPromise.$$state.value.value).toEqual(result);
        expect(asyncResult.value.close).toHaveBeenCalled();
    }));

    // Test service methods.
    it('Office Service showDialogAsync Open Positive Result Error Test', inject(function (officeService, officeContext) {
        // Arrange.
        var result = 'error result';
        var asyncResult = {
            status: Office.AsyncResultStatus.Succeeded,
            value: {
                addEventHandler: function (eventType, messageCallback) { messageCallback({ error: result }); },
                close: jasmine.createSpy()
            }
        };
        var resolvedState = 1;
        

        officeContext.ui.displayDialogAsync = function (url, options, callback) { callback(asyncResult); };

        // Act.
        var promise = officeService.showDialogAsync('lab.domain.com');

        // Assert.
        expect(promise).toBeDefined();
        expect(promise.$$state).toBeDefined();
        expect(promise.$$state.status).toEqual(resolvedState);
        expect(promise.$$state.value).toEqual(jasmine.any(DialogResult));
        expect(promise.$$state.value.value).toEqual(result);
        expect(asyncResult.value.close).toHaveBeenCalled();
    }));

    // Test service methods.
    it('Office Service showDialogAsync Open Negative Test', inject(function (officeService, officeContext) {
        // Arrange.
        var resolvedState = 1;
        var result = 'open error result';
        var asyncResult = {
            status: Office.AsyncResultStatus.Failed,
            error: result
        };

        officeContext.ui.displayDialogAsync = function (url, options, callback) { callback(asyncResult); };

        // Act.
        var promise = officeService.showDialogAsync('lab.domain.com');

        // Assert.
        expect(promise).toBeDefined();
        expect(promise.$$state).toBeDefined();
        expect(promise.$$state.status).toEqual(resolvedState);
        expect(promise.$$state.value).toEqual(jasmine.any(DialogResult));
        expect(promise.$$state.value.value).toEqual(result);
    }));
});