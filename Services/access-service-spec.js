/**
* The access service tests.
*/
describe('accessService Tests', function () {
    // Initialize dependencies of service.
    beforeEach(function () {
        angular.mock.module('OutlookAddinDemo');
    });

    // Test service initialization.
    it('Access Service is defined on initialization', inject(function (accessService) {
        // Assert.
        expect(accessService).toBeDefined();
    }));

    // Test getting default access list.
    it('Access Service returns default value when called getDefaultAccessList', inject(function (accessService, fileAccessList) {
        // Act.
        var defaultList = accessService.getDefaultAccessList();

        // Assert.
        expect(defaultList).toEqual(fileAccessList);
    }));

    // Test saving access.
    it('Access Service saves changed access correctly', inject(function (accessService) {
        // Arrange.
        var defaultList = accessService.getDefaultAccessList();

        // Modify values.
        defaultList[0].Selected = false;
        defaultList[1].Selected = true;

        // Act.
        accessService.saveAccessState(defaultList);
        var result = accessService.getLastSavedAccessState();

        // Assert.
        expect(result).toEqual(defaultList);
    }));

    // Test detecting access chnages.
    it('Access Service detects changed access correctly', inject(function (accessService) {
        // Arrange.
        var defaultList = accessService.getDefaultAccessList();
        var newList = accessService.getDefaultAccessList();

        // Modify values.
        newList[0].Selected = false;
        newList[1].Selected = true;

        // Act.
        var changedFromLastSaved = accessService.isAccessChanged(newList);
        var changedFromInitial = accessService.isAccessChanged(defaultList, newList);

        // Assert.
        expect(changedFromLastSaved).toBeTruthy();
        expect(changedFromInitial).toBeTruthy();
    }));

    // Test resetting access.
    it('Access Service resets access correctly', inject(function (accessService) {
        // Arrange.
        var defaultList = accessService.getDefaultAccessList();

        // Modify values.
        defaultList[0].Selected = false;
        defaultList[1].Selected = true;

        // Act.
        accessService.saveAccessState(defaultList);
        accessService.resetAccessState();
        var result = accessService.getLastSavedAccessState();

        // Assert.
        expect(result).not.toEqual(defaultList);
        expect(result).toEqual(accessService.getDefaultAccessList());
    }));
});