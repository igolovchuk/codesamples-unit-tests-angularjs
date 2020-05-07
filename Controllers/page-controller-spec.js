/**
* The page controller tests.
*/
describe('pageController Tests', function () {

    /**
    * @private @type {Angular.$controller} The angular controller function.
    */
    var createController;

    /**
    * @private @type {Scripts.App.Common.Services.navigation-service} The navigation service mock object.
    */
    var navigationServiceMock;

    /**
    * @private @type {Scripts.App.Common.Services.setting-service} The setting service mock object.
    */
    var settingServiceMock;

    /**
    * @private @type {Scripts.App.Common.Services.auth-service} The auth service mock object.
    */
    var authServiceMock;

    /**
    * @private @type {Scripts.App.Common.Services.log-service} The log service mock object.
    */
    var logServiceMock;

    /**
    * @private @type {Scripts.App.Common.Services.office-service} The office service mock object.
    */
    var officeServiceMock;

    // Initialize module.
    beforeEach(angular.mock.module('OutlookAddinDemo'));

    // Initialize injection dependencies of controller.
    beforeEach(inject(function ($controller) {
        // Arrange.
        createController = $controller;

        navigationServiceMock = {
            goToLogin: jasmine.createSpy(),
            urlContainsTicketResponse: jasmine.createSpy(),
            getCurrentUrl: jasmine.createSpy(),
            goToMainScreen: jasmine.createSpy(),
            goToHostSelection: jasmine.createSpy()
        };

        settingServiceMock = {
            tokenData: null,
            loadApplicationSettingsAsync: jasmine.createSpy()
        };

        authServiceMock = {
            loginAsync: jasmine.createSpy()
        };

        logServiceMock = {
            error: jasmine.createSpy()
        };

        officeServiceMock = {
            isInsideMailBox: true,
            sendToParent: jasmine.createSpy()
        };
    }));

    describe('pageController with successful loading of settings Tests', function () {
        // Initialize arrange values for group.
        beforeEach(inject(function ($q) {
            // Arrange.
            settingServiceMock.loadApplicationSettingsAsync.and.returnValue($q.resolve());
        }));

        // Test controller initialization.
        it('Page Controller is defined on initialization', inject(function ($rootScope) {
            // Act.
            var pageController = createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(pageController).toBeDefined();
        }));

        // Test controller navigation.
        it('Page Controller navigates to parent window if add-in is outside of mailbox and Auth Code received', inject(function ($rootScope) {
            // Arrange.
            var ticketResponse = 'code=test';
            officeServiceMock.isInsideMailBox = false;
            navigationServiceMock.urlContainsTicketResponse.and.returnValue(true);
            navigationServiceMock.getCurrentUrl.and.returnValue(ticketResponse);
            

            // Act.
            createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(officeServiceMock.sendToParent).toHaveBeenCalledWith(ticketResponse);
        }));

        // Test controller navigation.
        it('Page Controller navigates to host selection if token data does not exists', inject(function ($rootScope) {
            // Arrange.
            settingServiceMock.tokenData = null;

            // Act.
            createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(navigationServiceMock.goToHostSelection).toHaveBeenCalled();
        }));

        // Test controller navigation.
        it('Page Controller navigates to main screaan if token data exists', inject(function ($rootScope) {
            // Arrange.
            settingServiceMock.tokenData = { accessToken: '1234567890', refreshToken: '0987654321' };

            // Act.
            createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(navigationServiceMock.goToMainScreen).toHaveBeenCalled();
        }));

        // Test controller navigation after login.
        it('Page Controller navigtes to main screen after successful login', inject(function ($rootScope, $q) {
            // Arrange.
            navigationServiceMock.urlContainsTicketResponse.and.returnValue(true);
            authServiceMock.loginAsync.and.returnValue($q.resolve({ isSuccessful: true }));

            // Act.
            createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(authServiceMock.loginAsync).toHaveBeenCalled();
            expect(navigationServiceMock.goToMainScreen).toHaveBeenCalled();
        }));

        // Test controller navigation after login.
        it('Page Controller shows error and do not navigates anywhere when login was unsuccessful', inject(function ($rootScope, $q) {
            // Arrange.
            navigationServiceMock.urlContainsTicketResponse.and.returnValue(true);
            authServiceMock.loginAsync.and.returnValue($q.resolve({ isSuccessful: false }));

            // Act.
            var controller = createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(authServiceMock.loginAsync).toHaveBeenCalled();
            expect(controller.globalMessage).toEqual(Constants.LOGIN_ERROR);
        }));

        // Test controller navigation.
        it('Page Controller shows error if add-in is outside of mailbox and Auth Code NOT received', inject(function ($rootScope) {
            // Arrange.
            officeServiceMock.isInsideMailBox = false;
            navigationServiceMock.urlContainsTicketResponse.and.returnValue(false);
            navigationServiceMock.getCurrentUrl.and.returnValue(null);


            // Act.
            var controller = createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(controller.globalMessage).toBeDefined();
            expect(controller.globalMessage).toEqual(Constants.APP_LOAD_OUTSIDE_MAILBOX_ERROR_MESSAGE);
        }));
    });

    describe('pageController with failed load of app settings Tests', function () {
        // Initialize arrange values for group.
        beforeEach(inject(function ($q) {
            // Arrange.
            settingServiceMock.loadApplicationSettingsAsync.and.returnValue($q.reject());
        }));

        // Test controller initialization.
        it('Page Controller shows error when could not load application settings', inject(function ($rootScope) {
            // Act.
            var pageController = createController('pageController', getControllerDependenciesObject());
            $rootScope.$digest(); // Called to resolve all promises.

            // Assert.
            expect(logServiceMock.error).toHaveBeenCalled();
            expect(pageController.globalMessage).toBeDefined();
            expect(pageController.globalMessageType).toBeDefined();
            expect(pageController.showGlobalLoading ).toBeFalsy();
            expect(pageController.globalMessage).toEqual(Constants.APP_SETTINGS_LOAD_ERROR_MESSAGE);
        }));
    });

    /**
    * Because the controller runs navigation function on its initialization
    * need to mock all dependencies each time before controller initialization.
    * Makes fake controller dependencies injector object.
    * @private
    * @return {object}                                                                        The controller dependencies object.
    */
    function getControllerDependenciesObject() {
        return {
            navigationService: navigationServiceMock,
            settingService: settingServiceMock,
            authService: authServiceMock,
            logService: logServiceMock,
            officeService: officeServiceMock
        };
    }
});