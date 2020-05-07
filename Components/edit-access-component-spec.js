/**
* The edit access component controller tests.
*/
describe('editAccessComponent Tests', function () {

    /**
    * @private @type {Pages.Component.edit-access-component.controller} The edit access component controller instance for testing.
    */
    var editAccessComponentController;

    /**
    * @private @type {Scripts.App.Common.Services.access-service} The access service mock object.
    */
    var accessServiceMock;

    // Initialize module.
    beforeEach(angular.mock.module('OutlookAddinDemo'));

    // Initialize dependencies of controller.
    beforeEach(inject(function ($componentController, fileAccessList) {

        // Arrange.
        accessServiceMock = {
            getDefaultAccessList: jasmine.createSpy().and.returnValue(fileAccessList),
            isAccessChanged: jasmine.createSpy()
        };

        editAccessComponentController = $componentController('editAccessComponent',
                                        {
                                            accessService: accessServiceMock
                                        });
    }));

    // Test controller initialization.
    it('EditAccessComponent Controller is defined on initialization', function () {

        // Assert.
        expect(editAccessComponentController).toBeDefined();
    });

    // Test controller initialization.
    it('EditAccessComponent Controller sets default values if accessList was not provided', function () {
        // Act.
        editAccessComponentController.initValues();

        // Assert.
        expect(editAccessComponentController.accessList).toBeDefined();
        expect(editAccessComponentController.initialAccessList).toBeDefined();
        expect(accessServiceMock.getDefaultAccessList).toHaveBeenCalled();
    });

    // Test controller initialization.
    it('EditAccessComponent Controller sets passed values if accessList was provided', inject(function (fileAccessList) {
        // Arrange.
        editAccessComponentController.value = fileAccessList;

        // Act.
        editAccessComponentController.initValues();

        // Assert.
        expect(editAccessComponentController.accessList).toBeDefined();
        expect(editAccessComponentController.initialAccessList).toBeDefined();
        expect(accessServiceMock.getDefaultAccessList).not.toHaveBeenCalled();
    }));

    // Test controller methods.
    it('EditAccessComponent Controller can save assess function test', inject(function (fileAccessList) {
        // Arrange.
        editAccessComponentController.accessList = fileAccessList;
        accessServiceMock.isAccessChanged.and.returnValue(true);

        // Act.
        var canSaveAccess = editAccessComponentController.canSaveAccess();

        // Assert.
        expect(canSaveAccess).toEqual(true);
        expect(accessServiceMock.isAccessChanged).toHaveBeenCalled();
    }));

    // Test controller methods.
    it('EditAccessComponent Controller submit access function test', inject(function (fileAccessList) {
        // Arrange.
        editAccessComponentController.accessList = fileAccessList;
        editAccessComponentController.onSave = jasmine.createSpy();

        // Act.
        editAccessComponentController.submitAccess();

        // Assert.
        expect(editAccessComponentController.onSave).toHaveBeenCalledWith({ accessList: fileAccessList });
        expect(editAccessComponentController.isOpen).toEqual(false);
    }));
});