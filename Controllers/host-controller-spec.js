/**
* The host controller tests.
*/
describe('hostController Tests', function () {

    /**
    * @private @type {Scripts.App.Controllers.host-controller} The host controller instance for testing.
    */
    var hostController;

    /**
    * @private @type {Scripts.App.Common.Services.navigation-service} The navigation service mock object.
    */
    var navigationServiceMock;

    /**
    * @private @type {Scripts.App.Common.Services.setting-service} The setting service mock object.
    */
    var settingServiceMock;

    /**
    * @private @type {Array<object>} The host list mock object.
    */
    var hostListMock;

    // Initialize module.
    beforeEach(angular.mock.module('OutlookAddinDemo'));

    // Initialize dependencies of controller.
    beforeEach(inject(function ($controller) {

        // Arrange.
        navigationServiceMock = {
            goToLogin: function (hostKey) { }
        };

        settingServiceMock = {
            lastSelectedHostKey: null
        };

        hostListMock = [{
            Id: 'prod.name.com',
            Name: 'prod (USA)',
            ClientId: 'ClientId',
            ApiUrl: 'product-us.domain.com',
            Ticket: 'testTikect'
        }];

        hostController = $controller('hostController',
                                    {
                                      navigationService: navigationServiceMock,
                                      hostList: hostListMock,
                                      settingService: settingServiceMock
                                    });
    }));

    // Test controller initialization.
    it('Host Controller is defined on initialization', function () {

        // Assert.
        expect(hostController).toBeDefined();
    });

    // Test controller initialization.
    it('Host Controller initialized with default values', function () {

        // Assert.
        expect(hostController.selectedHostKey).toEqual(hostListMock[0].Id);
        expect(hostController.hostList).toEqual(hostListMock);
    });

    // Test controller initialization.
    it('Host Controller initialized with settings values if exists', inject(function ($controller) {
        // Arrange.
        settingServiceMock.lastSelectedHostKey = 'lab.domain.com';

        // Act.
        hostController = $controller('hostController',
            {
                navigationService: navigationServiceMock,
                hostList: hostListMock,
                settingService: settingServiceMock
            });

        // Assert.
        expect(hostController.selectedHostKey).toEqual(settingServiceMock.lastSelectedHostKey);
        expect(hostController.hostList).toEqual(hostListMock);
    }));

    // Test controller Login function.
    it('Host Controller saves key on Login and navigates to Login page', function () {
        // Arrange.
        var hostKey = 'lab.domain.com';
        spyOn(navigationServiceMock, 'goToLogin');

        // Act.
        hostController.Login(hostKey);

        // Assert.
        expect(settingServiceMock.lastSelectedHostKey).toEqual(hostKey);
        expect(navigationServiceMock.goToLogin).toHaveBeenCalledWith(hostKey);
    });
});