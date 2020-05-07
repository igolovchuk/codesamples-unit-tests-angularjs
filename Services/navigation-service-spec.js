/**
* The navigation service tests.
*/
describe('navigationService Tests', function () {
    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        // Need to mock only dependencies from custom services.
        angular.mock.module(function ($provide) {
            $provide.service('$location', function () {
                this.path = jasmine.createSpy();
            });

            $provide.service('logService', function () {
                this.debug = jasmine.createSpy();
            });

            $provide.service('$window', function () {
                this.location = {
                    replace: jasmine.createSpy(),
                    reload: jasmine.createSpy()
                };

                this.scrollTo = jasmine.createSpy();
            });

            $provide.service('officeService', function () {
                this.showDialogAsync = jasmine.createSpy();

                this.appHost = OfficeHost.webApp;
            });

            $provide.service('authService', function () {
                this.getLoginRequestURL = jasmine.createSpy();
                this.authConfiguration = { dialogLoginEnabled: false, diaogLoginEnvironments: [] };
            });
        });
    });

    // Test service initialization.
    it('Navigation Service is defined on initialization', inject(function (navigationService) {
        // Assert.
        expect(navigationService).toBeDefined();
    }));

    // Test service methods.
    it('Navigation Service reload test', inject(function (navigationService, $window) {
        // Act.
        navigationService.reload();

        // Assert.
        expect($window.location.reload).toHaveBeenCalled();
    }));

    // Test service methods.
    it('Navigation Service scrollTop test', inject(function (navigationService, $window) {
        // Act.
        navigationService.scrollTop();

        // Assert.
        expect($window.scrollTo).toHaveBeenCalledWith(0, 0);
    }));

    // Test service methods.
    it('Navigation Service goToLogin Default Way test', inject(function (navigationService, authService, $window, logService) {
        // Arrange.
        var loginURL = 'lab.domain.com';
        authService.getLoginRequestURL.and.returnValue(loginURL);
        authService.authConfiguration.dialogLoginEnabled = false;

        // Act.
        navigationService.goToLogin(loginURL);

        // Assert.
        expect(logService.debug).toHaveBeenCalled();
        expect($window.location.replace).toHaveBeenCalledWith(loginURL);
    }));

    // Test service methods.
    it('Navigation Service goToLogin Dialog Way positive test', inject(function (navigationService, authService, $window, logService, officeService, $q, $rootScope) {
        // Arrange.
        var loginURL = 'lab.domain.com';
        authService.getLoginRequestURL.and.returnValue(loginURL);
        authService.authConfiguration.dialogLoginEnabled = true;
        authService.authConfiguration.diaogLoginEnvironments = [officeService.appHost];

        officeService.showDialogAsync.and.returnValue($q.resolve({ isSuccessful: true, value: loginURL }));

        // Act.
        navigationService.goToLogin(loginURL);
        $rootScope.$digest(); // Called to resolve all promises.

        // Assert.
        expect(officeService.showDialogAsync).toHaveBeenCalledWith(loginURL);
        expect(logService.debug).toHaveBeenCalled();
        expect($window.location.replace).toHaveBeenCalledWith(loginURL);
    }));

    // Test service methods.
    it('Navigation Service goToLogin Dialog Way negative test', inject(function (navigationService, authService, $window, logService, officeService, $q, $rootScope) {
        // Arrange.
        var loginURL = 'lab.domain.com';
        authService.getLoginRequestURL.and.returnValue(loginURL);
        authService.authConfiguration.dialogLoginEnabled = true;
        authService.authConfiguration.diaogLoginEnvironments = [officeService.appHost];
        officeService.showDialogAsync.and.returnValue($q.resolve({ isSuccessful: false }));

        // Act.
        navigationService.goToLogin(loginURL);
        $rootScope.$digest(); // Called to resolve all promises.

        // Assert.
        expect(officeService.showDialogAsync).toHaveBeenCalledWith(loginURL);
        expect(logService.debug).toHaveBeenCalled();
        expect($window.location.replace).not.toHaveBeenCalled();
    }));

    // Test service methods.
    it('Navigation Service isLoginRequiresDialog for Andoid test', inject(function (navigationService, authService, officeService) {
        // Arrange.
        officeService.appHost = 'Not Deafult MS Host';
        authService.authConfiguration.dialogLoginEnabled = true;
        authService.authConfiguration.diaogLoginEnvironments = [OfficeHost.android];

        // Act.
        var result = navigationService.isLoginRequiresDialog();

        // Assert.
        expect(result).toBeTruthy();
    }));

    // Test service methods.
    it('Navigation Service goToHostSelection test', inject(function (navigationService, $location, logService) {
        // Act.
        navigationService.goToHostSelection();

        // Assert.
        expect(logService.debug).toHaveBeenCalled();
        expect($location.path).toHaveBeenCalledWith('/Hosts');
    }));

    // Test service methods.
    it('Navigation Service goToMainScreen test', inject(function (navigationService, $location, logService) {
        // Act.
        navigationService.goToMainScreen();

        // Assert.
        expect(logService.debug).toHaveBeenCalled();
        expect($location.path).toHaveBeenCalledWith('/MessageRead');
    }));

    // Test service methods.
    it('Navigation Service urlContainsTicketResponse test', inject(function (navigationService, $location) {
        // Arrange.
        $location.$$absUrl = 'lab.domain.com?code=123';

        // Act.
        var result = navigationService.urlContainsTicketResponse();

        // Assert.
        expect(result).toBeTruthy();
    }));

    // Test service methods.
    it('Navigation Service getCurrentUrl test', inject(function (navigationService, $location) {
        // Arrange.
        $location.$$absUrl = 'lab.domain.com';

        // Act.
        var url = navigationService.getCurrentUrl();

        // Assert.
        expect(url).toEqual($location.$$absUrl);
    }));
});