/**
* The rename subject component controller tests.
*/
describe('renameSubjectComponent Tests', function () {

    /**
    * @private @type {Pages.Component.rename-subject-component.controller} The rename subject component controller instance for testing.
    */
    var renameSubjectComponentController;

    // Initialize module.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');

        // Need to mock only dependencies from custom services.
        angular.mock.module(function ($provide) {
            $provide.service('$window', function () {
                this.scrollTo = jasmine.createSpy();
            });
        });
    });

    // Initialize dependencies of controller.
    beforeEach(inject(function ($componentController) {
        // Arrange.
        renameSubjectComponentController = $componentController('renameSubjectComponent');
    }));

    // Test controller initialization.
    it('RenameSubjectComponent Controller is defined on initialization', function () {

        // Assert.
        expect(renameSubjectComponentController).toBeDefined();
    });

    // Test controller methods.
    it('RenameSubjectComponent Controller on text change validation test', function () {
        // Arrange.
        var notValidValue = 'test/\:*?"<>|';
        var validValue = 'test';

        renameSubjectComponentController.validationPattern = /[/\\*?":|<>]/g;
        renameSubjectComponentController.value = notValidValue;

        // Act.
        renameSubjectComponentController.onTextChange();

        // Assert.
        expect(renameSubjectComponentController.value).toEqual(validValue);
    });

    // Test controller methods.
    it('RenameSubjectComponent Controller on close callSave true test', inject(function ($window) {
        // Arrange.
        renameSubjectComponentController.initialValue = 'initial';
        renameSubjectComponentController.value = 'test';
        renameSubjectComponentController.onSave = jasmine.createSpy();

        // Act.
        renameSubjectComponentController.onClose(true);

        // Assert.
        expect($window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(renameSubjectComponentController.isOpen).toEqual(false);
        expect(renameSubjectComponentController.onSave).toHaveBeenCalledWith({ subject: renameSubjectComponentController.value });
        expect(renameSubjectComponentController.value).not.toEqual(renameSubjectComponentController.initialValue);
    }));

    // Test controller methods.
    it('RenameSubjectComponent Controller on close callSave false test', inject(function ($window) {
        // Arrange.
        renameSubjectComponentController.initialValue = 'initial';
        renameSubjectComponentController.value = 'test';

        // Act.
        renameSubjectComponentController.onClose(false);

        // Assert.
        expect($window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(renameSubjectComponentController.isOpen).toEqual(false);
        expect(renameSubjectComponentController.value).toEqual(renameSubjectComponentController.initialValue);
    }));
});