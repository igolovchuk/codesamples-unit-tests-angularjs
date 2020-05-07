/**
* The about component controller tests.
*/
describe('aboutComponent Tests', function() {

    /**
    * @private @type {Pages.Component.about-component.controller} The about component controller instance for testing.
    */
    var aboutComponentController;

    /**
    * @private @type {Scripts.App.Common.Services.setting-service} The setting service mock object.
    */
    var settingServiceMock;

    // Initialize module.
    beforeEach(angular.mock.module('OutlookAddinDemo'));

    // Initialize dependencies of controller.
    beforeEach(inject(function ($componentController) {
        // Arrange.
        settingServiceMock = {
            appSettings: {}
        };

        aboutComponentController = $componentController('aboutComponent', {
            settingService: settingServiceMock
        });
    }));

    // Test controller initialization.
    it('AboutComponent Controller is defined on initialization', function () {
        // Assert.
        expect(aboutComponentController).toBeDefined();
        expect(aboutComponentController.appVersion).toEqual(Constants.EMPTY_STRING);
        expect(aboutComponentController.$onInit).toBeDefined();
    });

    // Test controller initialization.
    it('AboutComponent Controller sets appVersion after initialized', function () {
        // Arrange.
        var expectedAppVersion = '1.0.0';
        settingServiceMock.appSettings.version = expectedAppVersion;
        
        // Act.
        aboutComponentController.$onInit();

        // Assert.
        expect(aboutComponentController.appVersion).toBeDefined();
        expect(aboutComponentController.appVersion).toEqual(expectedAppVersion);
    });
});