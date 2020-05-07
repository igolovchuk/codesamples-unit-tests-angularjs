/**
* The notification component controller tests.
*/
describe('notificationComponent Tests', function () {

    /**
    * @private @type {Pages.Component.rename-subject-component.controller} The notification component controller instance for testing.
    */
    var notificationComponentController;

    // Initialize module.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');
    });

    // Initialize dependencies of controller.
    beforeEach(inject(function ($componentController) {
        // Arrange.
        notificationComponentController = $componentController('notificationComponent');
    }));

    // Test controller initialization.
    it('NotificationComponent Controller is defined on initialization', function () {

        // Assert.
        expect(notificationComponentController).toBeDefined();
    });

    // Test controller methods.
    it('NotificationComponent Controller init sub text with action', function () {
        // Arrange.
        var subTextPartOne = 'Hello, ';
        var subTextPartTwo = ' World!';
        var actionText = 'click';
        var action = '<action>' + actionText + '</action>';

        var wholePhrase = subTextPartOne + action + subTextPartTwo;

        // Act.
        notificationComponentController.initSubText(wholePhrase);

        // Assert.
        expect(notificationComponentController.subTextPartOne).toEqual(subTextPartOne);
        expect(notificationComponentController.subTextPartTwo).toEqual(subTextPartTwo);
        expect(notificationComponentController.actionText).toEqual(actionText);
    });


    // Test controller methods.
    it('NotificationComponent Controller init sub text without action', function () {
        // Arrange.
        var wholePhrase = 'Hello, World!';

        // Act.
        notificationComponentController.initSubText(wholePhrase);

        // Assert.
        expect(notificationComponentController.subTextPartOne).toEqual(wholePhrase);
        expect(notificationComponentController.subTextPartTwo).toBeFalsy();
        expect(notificationComponentController.actionText).toBeFalsy();
    });
});